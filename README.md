# PDF Processing Pipeline

A full-stack application that extracts entities (names, dates, addresses) and tables from PDF documents using OCR processing with the olmocr-7b-0225-preview model.

## Features

- **PDF Upload**: Drag & drop or browse to upload PDF files
- **OCR Processing**: Uses olmocr-7b-0225-preview model via LM Studio
- **Entity Extraction**: Automatically extracts names, dates, and addresses
- **Table Detection**: Identifies and extracts structured table data
- **Visual Pipeline**: Real-time processing visualization with React Flow
- **Results Export**: Download extracted data as JSON
- **API Health Monitoring**: Real-time status of OCR API connection

## Architecture

- **Frontend**: React.js with React Flow for pipeline visualization
- **Backend**: FastAPI with PyMuPDF for PDF text extraction
- **OCR Engine**: olmocr-7b-0225-preview model via LM Studio API
- **Communication**: RESTful API with CORS support

## Prerequisites

1. **Python 3.8+**
2. **Node.js 16+ and npm**
3. **LM Studio** with olmocr-7b-0225-preview model

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd piazza
```

### 2. Install Python Dependencies
```bash
pip install fastapi uvicorn PyMuPDF requests
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Set up LM Studio
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Download the `olmocr-7b-0225-preview` model
3. Start LM Studio and load the model
4. Start the local server on port 1234

## Quick Start

### Option 1: Use the Service Starter Script (Recommended)
```bash
python start_services.py
```

This script will:
- Check all dependencies
- Install frontend packages if needed
- Start both backend and frontend servers
- Monitor both services and stop them when you press Ctrl+C

### Option 2: Manual Start

#### Start Backend Server
```bash
cd backend
python main.py
```
The backend will be available at `http://localhost:8000`

#### Start Frontend Server (in a new terminal)
```bash
cd frontend
npm start
```
The frontend will be available at `http://localhost:3000`

## Usage

1. **Open the Application**: Navigate to `http://localhost:3000`
2. **Check API Status**: Verify that the OCR API status shows "Online"
3. **Upload PDF**: Drag & drop a PDF file or click to browse
4. **Process Document**: Click "Process PDF" to extract entities and tables
5. **View Results**: Examine extracted entities and tables in the results section
6. **Download Results**: Click "Download Results" to save as JSON

## API Endpoints

### Backend API (http://localhost:8000)

- `GET /` - API information
- `GET /health` - Health check and OCR API status
- `POST /upload-pdf` - Upload and extract text from PDF
- `POST /process-pdf` - Upload PDF and process with OCR model
- `POST /process-text` - Process raw text with OCR model

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## Configuration

### Backend Configuration
Edit `backend/main.py` to modify:
- `OLMOCR_API_URL`: LM Studio API endpoint (default: `http://127.0.0.1:1234/v1/chat/completions`)
- `MAX_TEXT_LENGTH`: Maximum text length for OCR processing (default: 4000)

### Frontend Configuration
Edit `frontend/src/App.js` to modify:
- `API_BASE_URL`: Backend API URL (default: `http://localhost:8000`)

## Troubleshooting

### OCR API Offline
If the OCR API status shows "Offline":
1. Ensure LM Studio is running
2. Verify the olmocr-7b-0225-preview model is loaded
3. Check that LM Studio is serving on port 1234
4. Restart LM Studio if needed

### Frontend Won't Start
1. Check if Node.js and npm are installed
2. Run `npm install` in the frontend directory
3. Check for port conflicts (default: 3000)

### Backend Won't Start
1. Verify Python dependencies are installed
2. Check for port conflicts (default: 8000)
3. Ensure no other service is using the required ports

### PDF Processing Errors
1. Ensure the PDF contains extractable text
2. Check file size (max 10MB recommended)
3. Verify the PDF is not corrupted
4. Check backend logs for detailed error messages

## Development

### Project Structure
```
piazza/
├── backend/
│   └── main.py              # FastAPI backend server
├── frontend/
│   ├── src/
│   │   └── App.js           # React frontend application
│   ├── package.json         # Frontend dependencies
│   └── public/              # Static assets
├── start_services.py        # Service starter script
└── README.md               # This file
```

### Adding New Features
1. **Backend**: Add new endpoints in `backend/main.py`
2. **Frontend**: Modify components in `frontend/src/App.js`
3. **API Integration**: Update API calls in the frontend
4. **Testing**: Test both services independently

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `http://localhost:8000/docs`
3. Check the console logs for error messages
4. Ensure all prerequisites are met 