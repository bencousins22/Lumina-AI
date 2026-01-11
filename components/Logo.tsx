
import React from 'react';
import { cn } from '../lib/utils';

export const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={cn("w-full h-full", className)} xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
    </defs>
    
    {/* Circle Ring - Stroke width adjusted for visibility at small sizes */}
    <circle cx="100" cy="100" r="95" fill="none" stroke="url(#logoGradient)" strokeWidth="10" className="opacity-80" />
    
    {/* AA Logo - Filled Geometric Shapes */}
    <g transform="translate(0, 5)">
        {/* Left A */}
        <path 
            d="M 45 135 L 70 55 L 90 55 L 115 135 L 100 135 L 93 105 H 67 L 60 135 Z M 80 65 L 73 95 H 87 Z" 
            fill="url(#logoGradient)" 
            fillRule="evenodd"
        />
        
        {/* Right A */}
        <path 
            d="M 85 135 L 110 55 L 130 55 L 155 135 L 140 135 L 133 105 H 107 L 100 135 Z M 120 65 L 113 95 H 127 Z" 
            fill="url(#logoGradient)" 
            fillRule="evenodd"
        />
    </g>
  </svg>
);
