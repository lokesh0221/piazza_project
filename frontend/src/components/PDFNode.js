import React from 'react';
import { FileText } from 'lucide-react';
import { Handle, Position } from 'reactflow';

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

export default PDFNode;
