
import React from 'react';
import { ConnectionLineComponentProps } from '@xyflow/react';

export const Connection = ({ fromX, fromY, toX, toY, connectionLineStyle }: ConnectionLineComponentProps) => {
  return (
    <g>
      <path
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        className="animated"
        d={`M${fromX},${fromY} C${fromX} ${fromY} ${toX} ${toY} ${toX},${toY}`}
        style={{ ...connectionLineStyle, strokeDasharray: 5, animation: 'dashdraw 0.5s linear infinite' }}
      />
    </g>
  );
};
