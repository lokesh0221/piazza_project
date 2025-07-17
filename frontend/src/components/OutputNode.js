import React from 'react';
import { Eye } from 'lucide-react';
import { Handle, Position } from 'reactflow';

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

export default OutputNode;
