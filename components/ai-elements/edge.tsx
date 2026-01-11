
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import React from 'react';

export const Edge = {
  Animated: (props: EdgeProps) => {
    const [edgePath] = getBezierPath(props);
    return (
      <BaseEdge
        path={edgePath}
        {...props}
        style={{
            stroke: 'var(--primary)',
            strokeWidth: 2,
            strokeDasharray: 5,
            animation: 'dashdraw 0.5s linear infinite',
            ...props.style
        }}
      />
    );
  },
  Temporary: (props: EdgeProps) => {
    const [edgePath] = getBezierPath(props);
    return (
      <BaseEdge
        path={edgePath}
        {...props}
        style={{
          stroke: 'var(--muted-foreground)',
          strokeWidth: 1.5,
          strokeDasharray: '4 4',
          opacity: 0.5,
          ...props.style
        }}
      />
    );
  }
};
