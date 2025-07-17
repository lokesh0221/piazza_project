import React from 'react';
import { ReactFlow, Controls, Background } from 'reactflow';

const PipelineFlow = ({ nodes, edges, onNodesChange, onEdgesChange, nodeTypes }) => (
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
);

export default PipelineFlow;
