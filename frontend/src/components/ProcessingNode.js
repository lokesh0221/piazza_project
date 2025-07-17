import React from 'react';
import { Database, Loader, CheckCircle } from 'lucide-react';
import { Handle, Position } from 'reactflow';

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

export default ProcessingNode;
