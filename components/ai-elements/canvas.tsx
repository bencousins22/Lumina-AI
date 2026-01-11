
import React from 'react';
import { ReactFlow, ReactFlowProps, Background, Controls } from '@xyflow/react';

interface CanvasProps extends Partial<ReactFlowProps<any, any>> {
  children?: React.ReactNode;
  nodes?: any;
  edges?: any;
  onNodesChange?: any;
  onEdgesChange?: any;
  onConnect?: any;
  nodeTypes?: any;
  edgeTypes?: any;
  fitView?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ children, ...props }) => {
  return (
    <div className="h-full w-full bg-background font-sans">
      <ReactFlow
        {...props}
        defaultEdgeOptions={{
          type: 'animated',
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={4}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls className="!bg-card !border-border !fill-foreground [&>button]:!border-b-border hover:[&>button]:!bg-muted" />
        {children}
      </ReactFlow>
      
      {/* Styles for edge animation */}
      <style>{`
        @keyframes dashdraw {
          from {
            stroke-dashoffset: 10;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
