from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import fitz  # PyMuPDF
from normalize import normalize_tables
import requests
import json
import tempfile
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for response structure
class EntityData(BaseModel):
    names: List[str]
    dates: List[str]
    addresses: List[str]

class TableData(BaseModel):
    headers: List[str]
    rows: List[List[str]]

class OCRResponse(BaseModel):
    entities: EntityData
    tables: List[TableData]

class ProcessingResult(BaseModel):
    success: bool
    ocr_result: OCRResponse
    error: str = None

# Initialize FastAPI app
app = FastAPI(
    title="PDF OCR Processing API",
    description="Extract text from PDFs and process with olmocr-7b model",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OLMOCR_API_URL = "http://127.0.0.1:1234/v1/chat/completions"
MAX_TEXT_LENGTH = 4000

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts all text from the given PDF file."""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

def send_text_to_olmocr(text: str) -> dict:
    """Sends extracted PDF text to olmocr-7b-0225-preview via LM Studio API."""
    logger.info(f"Sending text to OCR API (length: {len(text)})")
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "model": "olmocr-7b-0225-preview",
        "messages": [
            {
                "role": "system",
                "content": (
                    "- entities: Names, Dates, Addresses\n"
                    "- tables: headers and rows\n\n"
                    "Respond in this JSON format:\n"
                    "{\n"
                    '  "entities": {\n    "names": [],\n    "dates": [],\n    "addresses": []\n  },\n'
                    '  "tables": [ { "headers": [], "rows": [] } ]\n}'
                )
            },
            {
                "role": "user",
                "content": text[:MAX_TEXT_LENGTH]  # Limit very long PDF input
            }
        ],
        "temperature": 0.3,
        "max_tokens": 2048
    }
    
    try:
        logger.info(f"Making request to {OLMOCR_API_URL}")
        response = requests.post(OLMOCR_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            response_data = response.json()
            logger.info("OCR API request successful")
            # Validate response structure
            if not isinstance(response_data, dict):
                logger.error("OCR API returned invalid response format")
                raise HTTPException(
                    status_code=500,
                    detail="OCR API returned invalid response format"
                )
            return response_data
        else:
            logger.error(f"OCR API request failed with status {response.status_code}: {response.text}")
            raise HTTPException(
                status_code=500, 
                detail=f"OCR API request failed: {response.status_code} - {response.text}"
            )
    except requests.exceptions.Timeout:
        logger.error("OCR API request timed out")
        raise HTTPException(status_code=500, detail="OCR API request timed out")
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to OCR API")
        raise HTTPException(status_code=500, detail="Cannot connect to OCR API. Make sure LM Studio is running on port 1234")
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error connecting to OCR API: {str(e)}")
    except json.JSONDecodeError:
        logger.error("OCR API returned invalid JSON response")
        raise HTTPException(status_code=500, detail="OCR API returned invalid JSON response")

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "PDF OCR Processing API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/upload-pdf",
            "process": "/process-pdf",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test OCR API connection
        test_response = requests.get("http://127.0.0.1:1234/v1/models", timeout=5)
        ocr_status = "online" if test_response.status_code == 200 else "offline"
    except:
        ocr_status = "offline"
    
    return {
        "status": "healthy",
        "ocr_api_status": ocr_status,
        "max_text_length": MAX_TEXT_LENGTH
    }

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and extract text from PDF file."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Extract text
        extracted_text = extract_text_from_pdf(tmp_file_path)
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        return {
            "success": True,
            "filename": file.filename,
            "text_length": len(extracted_text),
            "extracted_text": extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text
        }
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'tmp_file_path' in locals():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/process-pdf", response_model=ProcessingResult)
async def process_pdf(file: UploadFile = File(...)):
    """Upload PDF, extract text, and process with OCR model."""
    logger.info(f"Processing PDF file: {file.filename}")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    tmp_file_path = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        logger.info(f"Extracting text from PDF: {tmp_file_path}")
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(tmp_file_path)
        
        if not extracted_text:
            logger.warning("No text found in PDF")
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        logger.info(f"Extracted text length: {len(extracted_text)}")
        
        # Process with OCR model
        try:
            ocr_response = send_text_to_olmocr(extracted_text)
        except HTTPException as e:
            # Re-raise HTTPException to maintain proper error handling
            logger.error(f"OCR processing failed: {str(e)}")
            raise e
        
        # Check if OCR response is valid
        if not ocr_response or not isinstance(ocr_response, dict):
            logger.error("Invalid OCR response format")
            return ProcessingResult(
                success=False,
                ocr_result=OCRResponse(
                    entities=EntityData(names=[], dates=[], addresses=[]),
                    tables=[]
                ),
                error="Invalid OCR response format"
            )
        
        # Parse OCR response
        try:
            content = ocr_response.get("choices", [{}])[0].get("message", {}).get("content")
            if not content:
                raise ValueError("No content in OCR response")
            
            logger.info("Parsing OCR response content")
            parsed_content = json.loads(content)
            parsed_content = normalize_tables(parsed_content)
            
            # Validate and structure the response
            ocr_result = OCRResponse(
                entities=EntityData(
                    names=parsed_content.get("entities", {}).get("names", []),
                    dates=parsed_content.get("entities", {}).get("dates", []),
                    addresses=parsed_content.get("entities", {}).get("addresses", [])
                ),
                tables=[
                    TableData(
                        headers=table.get("headers", []),
                        rows=table.get("rows", [])
                    ) for table in parsed_content.get("tables", [])
                ]
            )
            
            logger.info("PDF processing completed successfully")
            return ProcessingResult(
                success=True,
                ocr_result=ocr_result
            )
            
        except (KeyError, json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse OCR response: {str(e)}; Raw content: {content}")
            # If parsing fails, return raw response
            return ProcessingResult(
                success=False,
                ocr_result=OCRResponse(
                    entities=EntityData(names=[], dates=[], addresses=[]),
                    tables=[]
                ),
                error=f"Failed to parse OCR response: {str(e)}; Raw content: {content}"
            )
        
    except HTTPException:
        # Re-raise HTTPException to maintain proper error handling
        raise
    except Exception as e:
        logger.error(f"Unexpected error in process_pdf: {str(e)}")
        return ProcessingResult(
            success=False,
            ocr_result=OCRResponse(
                entities=EntityData(names=[], dates=[], addresses=[]),
                tables=[]
            ),
            error=str(e)
        )
    
    finally:
        # Clean up temporary file
        if tmp_file_path and os.path.exists(tmp_file_path):
            try:
                os.unlink(tmp_file_path)
                logger.info(f"Cleaned up temporary file: {tmp_file_path}")
            except:
                pass

@app.post("/process-text")
async def process_text(text: str):
    """Process raw text with OCR model (alternative endpoint)."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        # Process with OCR model
        try:
            ocr_response = send_text_to_olmocr(text)
        except HTTPException as e:
            # Re-raise HTTPException to maintain proper error handling
            raise e
        
        # Check if OCR response is valid
        if not ocr_response or not isinstance(ocr_response, dict):
            return {
                "success": False,
                "input_text": text,
                "error": "Invalid OCR response format"
            }
        
        # Parse OCR response
        try:
            content = ocr_response.get("choices", [{}])[0].get("message", {}).get("content")
            if not content:
                raise ValueError("No content in OCR response")
                
            parsed_content = json.loads(content)
            parsed_content = normalize_tables(parsed_content)
            return {
                "success": True,
                "input_text": text,
                "parsed_result": parsed_content
            }
            
        except (KeyError, json.JSONDecodeError, ValueError) as e:
            return {
                "success": False,
                "input_text": text,
                "raw_response": ocr_response,
                "error": f"Failed to parse OCR response: {str(e)}"
            }
            
    except HTTPException:
        # Re-raise HTTPException to maintain proper error handling
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)