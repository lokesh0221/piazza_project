from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import json
from normalize import normalize_tables
import tempfile
import os
from typing import Dict, Any

# Import functions from main.py
from main import extract_text_from_pdf, send_text_to_olmocr

app = FastAPI(
    title="PDF OCR API",
    description="API for extracting text from PDFs and processing with OCR",
    version="1.0.0"
)

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "PDF OCR API",
        "version": "1.0.0",
        "endpoints": {
            "/extract-text": "Extract text from uploaded PDF",
            "/process-ocr": "Extract text and process with OCR",
            "/process-text": "Process plain text with OCR",
            "/health": "Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "PDF OCR API"}

@app.post("/extract-text")
async def extract_text_endpoint(file: UploadFile = File(...)):
    """Extract text from uploaded PDF file."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Extract text using function from main.py
        extracted_text = extract_text_from_pdf(temp_file_path)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return {
            "filename": file.filename,
            "text": extracted_text,
            "text_length": len(extracted_text)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/process-ocr")
async def process_ocr_endpoint(file: UploadFile = File(...)):
    """Extract text from PDF and process with OCR."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Extract text using function from main.py
        extracted_text = extract_text_from_pdf(temp_file_path)
        
        # Process with OCR using function from main.py
        ocr_response = send_text_to_olmocr(extracted_text)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        # Parse OCR response
        try:
            content = ocr_response["choices"][0]["message"]["content"]
            parsed_content = json.loads(content)
        except Exception as e:
            # If parsing fails, return raw response
            parsed_content = ocr_response
        
        return {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "text_length": len(extracted_text),
            "ocr_result": parsed_content
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/process-text")
async def process_text_endpoint(text: str):
    """Process plain text with OCR without PDF extraction."""
    try:
        # Process with OCR using function from main.py
        ocr_response = send_text_to_olmocr(text)
        
        # Parse OCR response
        try:
            content = ocr_response["choices"][0]["message"]["content"]
            parsed_content = json.loads(content)
        except Exception as e:
            # If parsing fails, return raw response
            parsed_content = ocr_response
        
        return {
            "input_text": text,
            "text_length": len(text),
            "ocr_result": parsed_content
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
