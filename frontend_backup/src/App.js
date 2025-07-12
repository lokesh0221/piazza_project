import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Controls, Background, Handle, Position, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { Upload, FileText, Database, Eye, Download, AlertCircle, CheckCircle, Loader, Play, Server, Wifi, WifiOff } from 'lucide-react';

// Custom Node Components
const PDFNode = ({ data }) => (
  <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <FileText className="w-5 h-5 text-blue-600" />
      <span className="font-semibold text-gray-800">PDF Input</span>
    </div>
    <div className="text-sm text-gray-600">
      {data.fileName || 'No file selected'}
    </div>
    <Handle type="source" position={Position.Right} className="bg-blue-500" />
  </div>
);

const ProcessingNode = ({ data }) => (
  <div className="bg-white border-2 border-yellow-500 rounded-lg p-4 shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Database className="w-5 h-5 text-yellow-600" />
      <span className="font-semibold text-gray-800">OCR Processing</span>
    </div>
    <div className="text-sm text-gray-600">
      {data.status === 'processing' && (
        <div className="flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin text-yellow-600" />
          Processing...
        </div>
      )}
      {data.status === 'completed' && (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Completed
        </div>
      )}
      {data.status === 'idle' && 'FastAPI + olmocr-7b'}
    </div>
    <Handle type="target" position={Position.Left} className="bg-yellow-500" />
    <Handle type="source" position={Position.Right} className="bg-yellow-500" />
  </div>
);

const OutputNode = ({ data }) => (
  <div className="bg-white border-2 border-green-500 rounded-lg p-4 shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Eye className="w-5 h-5 text-green-600" />
      <span className="font-semibold text-gray-800">Results</span>
    </div>
    <div className="text-sm text-gray-600">
      {data.hasResults ? 'Entities & Tables' : 'No results yet'}
    </div>
    <Handle type="target" position={Position.Left} className="bg-green-500" />
  </div>
);

const nodeTypes = {
  pdfNode: PDFNode,
  processingNode: ProcessingNode,
  outputNode: OutputNode,
};

const initialNodes = [
  {
    id: 'pdf',
    type: 'pdfNode',
    position: { x: 0, y: 100 },
    data: { fileName: null },
  },
  {
    id: 'processing',
    type: 'processingNode',
    position: { x: 300, y: 100 },
    data: { status: 'idle' },
  },
  {
    id: 'output',
    type: 'outputNode',
    position: { x: 600, y: 100 },
    data: { hasResults: false },
  },
];

const initialEdges = [
  {
    id: 'pdf-processing',
    source: 'pdf',
    target: 'processing',
    animated: false,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
  {
    id: 'processing-output',
    source: 'processing',
    target: 'output',
    animated: false,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
];

const PDFProcessorApp = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown');
  const [ocrApiStatus, setOcrApiStatus] = useState('unknown');

  // API configuration
  const API_BASE_URL = 'http://localhost:8000';

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const updateEdgeAnimation = useCallback((edgeId, animated) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, animated };
        }
        return edge;
      })
    );
  }, [setEdges]);

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus('online');
        setOcrApiStatus(data.ocr_api_status || 'unknown');
      } else {
        setApiStatus('offline');
        setOcrApiStatus('unknown');
      }
    } catch (error) {
      setApiStatus('offline');
      setOcrApiStatus('unknown');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
      updateNodeData('pdf', { fileName: file.name });
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError(null);
        updateNodeData('pdf', { fileName: file.name });
      } else {
        setError('Please drop a valid PDF file');
      }
    }
  };

  const processPDF = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    if (apiStatus === 'offline') {
      setError('FastAPI backend is offline. Please make sure the server is running on port 8000.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // Update UI to show processing state
    updateNodeData('processing', { status: 'processing' });
    updateEdgeAnimation('pdf-processing', true);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Make API call to FastAPI backend
      const response = await fetch(`${API_BASE_URL}/process-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Transform the API response to match the expected format
        const transformedResults = {
          text: data.extracted_text,
          entities: data.ocr_result.entities,
          tables: data.ocr_result.tables
        };
        
        setResults(transformedResults);
        
        // Update UI to show completion
        updateNodeData('processing', { status: 'completed' });
        updateNodeData('output', { hasResults: true });
        updateEdgeAnimation('processing-output', true);
      } else {
        throw new Error(data.error || 'Processing failed');
      }
      
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
      updateEdgeAnimation('pdf-processing', false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'pdf-extraction-results.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PDF Processing Pipeline</h1>
                <p className="text-gray-600 mt-1">Extract entities and tables from PDF documents using OCR</p>
              </div>
            </div>
            
            {/* API Status Indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Server className="w-4 h-4" />
                <span className="text-gray-600">FastAPI:</span>
                <div className="flex items-center gap-1">
                  {apiStatus === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${apiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                    {apiStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4" />
                <span className="text-gray-600">OCR API:</span>
                <div className="flex items-center gap-1">
                  {ocrApiStatus === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${ocrApiStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                    {ocrApiStatus}
                  </span>
                </div>
              </div>
              
              <button
                onClick={checkApiHealth}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload & Process</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File
              </label>
              
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {selectedFile ? selectedFile.name : 'Drop your PDF here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or <span className="text-blue-600 font-medium">browse</span> to choose a file
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">PDF files only • Max 10MB</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={processPDF}
              disabled={!selectedFile || isProcessing || apiStatus === 'offline'}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Process PDF
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          
          {apiStatus === 'offline' && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              FastAPI backend is offline. Make sure to run: <code className="bg-yellow-100 px-2 py-1 rounded">uvicorn main:app --reload</code>
            </div>
          )}
        </div>

        {/* Pipeline Visualization */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Processing Pipeline</h2>
          <div className="h-80 border rounded-lg bg-gray-50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Extracted JSON */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Extracted JSON</h3>
                <button
                  onClick={downloadResults}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Results
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
              </div>
            </div>

            {/* Entities */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Entities</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Names</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.entities.names.map((name, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                    {results.entities.names.length === 0 && (
                      <span className="text-gray-500 text-sm">No names found</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Dates</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.entities.dates.map((date, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {date}
                      </span>
                    ))}
                    {results.entities.dates.length === 0 && (
                      <span className="text-gray-500 text-sm">No dates found</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Addresses</h4>
                  <div className="space-y-2">
                    {results.entities.addresses.map((address, index) => (
                      <div key={index} className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                        {address}
                      </div>
                    ))}
                    {results.entities.addresses.length === 0 && (
                      <span className="text-gray-500 text-sm">No addresses found</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tables */}
            {results.tables && results.tables.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Tables</h3>
                
                {results.tables.map((table, tableIndex) => (
                  <div key={tableIndex} className="mb-6 last:mb-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            {table.headers.map((header, index) => (
                              <th key={index} className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFProcessorApp;