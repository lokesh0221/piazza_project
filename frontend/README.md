# PDF Processing Pipeline

## 🌐 Frontend Demo

![Frontend Demo](frontend_demo.png)

A full-stack application that extracts entities (names, dates, addresses) and tables from PDF documents using OCR processing with the olmocr-7b-0225-preview model. Features a modern React frontend with real-time pipeline visualization and a FastAPI backend for robust PDF processing.

## 🚀 Features

- **📄 PDF Upload**: Drag & drop or browse to upload PDF files
- **🔍 OCR Processing**: Uses olmocr-7b-0225-preview model via LM Studio
- **🏷️ Entity Extraction**: Automatically extracts names, dates, and addresses
- **📊 Table Detection**: Identifies and extracts structured table data
- **🎯 Visual Pipeline**: Real-time processing visualization with React Flow
- **💾 Results Export**: Download extracted data as JSON
- **📡 API Health Monitoring**: Real-time status of OCR API connection
- **🎨 Modern UI**: Beautiful interface with Tailwind CSS and Lucide icons
- **⚡ Real-time Updates**: Live status updates during processing

## 🏗️ Architecture

- **Frontend**: React.js 19.1.0 with React Flow for pipeline visualization
- **Backend**: FastAPI 0.104.1 with PyMuPDF for PDF text extraction
- **OCR Engine**: olmocr-7b-0225-preview model via LM Studio API
- **Communication**: RESTful API with CORS support
- **Styling**: Tailwind CSS for modern UI design
- **Icons**: Lucide React for consistent iconography

## 📋 Prerequisites

1. **Python 3.8+**
2. **Node.js 16+ and npm**
3. **LM Studio** with olmocr-7b-0225-preview model

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/lokesh0221/piazza_project.git
cd piazza_project
```

### 2. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

**Or install manually:**
```bash
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 python-multipart==0.0.6 PyMuPDF==1.23.8 requests==2.31.0
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

## 🚀 Quick Start

### Manual Start (Recommended for Development)

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

## 📖 Usage

1. **Open the Application**: Navigate to `http://localhost:3000`
2. **Check API Status**: Verify that the OCR API status shows "Online"
3. **Upload PDF**: Drag & drop a PDF file or click to browse
4. **Process Document**: Click "Process PDF" to extract entities and tables
5. **View Results**: Examine extracted entities and tables in the results section
6. **Download Results**: Click "Download Results" to save as JSON

## 🔌 API Endpoints

### Backend API (http://localhost:8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and available endpoints |
| `/health` | GET | Health check and OCR API status |
| `/upload-pdf` | POST | Upload and extract text from PDF |
| `/process-pdf` | POST | Upload PDF and process with OCR model |
| `/process-text` | POST | Process raw text with OCR model |

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## ⚙️ Configuration

### Backend Configuration
Edit `backend/main.py` to modify:
- `OLMOCR_API_URL`: LM Studio API endpoint (default: `http://127.0.0.1:1234/v1/chat/completions`)
- `MAX_TEXT_LENGTH`: Maximum text length for OCR processing (default: 4000)

### Frontend Configuration
Edit `frontend/src/App.js` to modify:
- `API_BASE_URL`: Backend API URL (default: `http://localhost:8000`)

## 🐛 Troubleshooting

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

## 📁 Development

### Project Structure
```
piazza_project/
├── backend/
│   ├── main.py              # FastAPI backend server with all endpoints
│   ├── app.py               # Additional backend modules and utilities
│   └── requirements.txt     # Python dependencies with exact versions
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main React application with pipeline visualization
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles and Tailwind imports
│   ├── public/
│   │   ├── index.html       # HTML template with meta tags
│   │   ├── manifest.json    # PWA manifest for mobile support
│   │   └── robots.txt       # SEO configuration
│   ├── package.json         # Frontend dependencies and scripts
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── README.md           # Frontend-specific documentation
├── test.pdf                # Sample PDF for testing
└── README.md               # This comprehensive documentation
```

### Frontend Technologies
- **React 19.1.0**: Modern React with hooks and functional components
- **React Flow 11.11.4**: Interactive node-based pipeline visualization
- **Tailwind CSS 3.4.17**: Utility-first CSS framework for styling
- **Lucide React 0.525.0**: Modern icon library with consistent design
- **React Scripts 5.0.1**: Build tools and development server

### Backend Technologies
- **FastAPI 0.104.1**: Modern, fast web framework for building APIs
- **PyMuPDF 1.23.8**: High-performance PDF processing library
- **Uvicorn 0.24.0**: Lightning-fast ASGI server
- **Requests 2.31.0**: HTTP library for API communication
- **Pydantic**: Data validation using Python type annotations

### Key Features Implementation
- **Real-time Pipeline Visualization**: Uses React Flow to show processing stages
- **Drag & Drop File Upload**: Native HTML5 drag and drop with visual feedback
- **API Health Monitoring**: Continuous monitoring of OCR service status
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Adding New Features
1. **Backend**: Add new endpoints in `backend/main.py`
2. **Frontend**: Modify components in `frontend/src/App.js`
3. **API Integration**: Update API calls in the frontend
4. **Testing**: Test both services independently





## 🔮 Future Enhancements

- [ ] Support for multiple file formats (DOCX, TXT)
- [ ] Batch processing of multiple PDFs
- [ ] Advanced table structure detection
- [ ] Export to Excel/CSV formats
- [ ] User authentication and file management
- [ ] Cloud deployment support
- [ ] Docker containerization 