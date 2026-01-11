
import React, { useId } from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const Logo = ({ className, variant = 'full' }: LogoProps) => {
  const id = useId().replace(/:/g, ''); // Ensure safe ID string
  const ringGradientId = `ringGradient-${id}`;
  const bgGradientId = `bgGradient-${id}`;
  const textGradientId = `textGradient-${id}`;

  return (
    <svg
      viewBox={variant === 'icon' ? "0 0 160 160" : "0 0 480 160"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full transition-all duration-300", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={ringGradientId} x1="0" y1="0" x2="160" y2="160">
          <stop offset="0%" stopColor="#38BDF8"/>
          <stop offset="100%" stopColor="#0EA5E9"/>
        </linearGradient>

        <radialGradient id={bgGradientId}>
          <stop offset="0%" stopColor="#020617"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>

        <linearGradient id={textGradientId} x1="0" y1="0" x2="0" y2="160">
          <stop offset="0%" stopColor="#E0F2FE"/>
          <stop offset="100%" stopColor="#38BDF8"/>
        </linearGradient>
      </defs>

      {/* Icon container */}
      <circle
        cx="80"
        cy="80"
        r="56"
        stroke={`url(#${ringGradientId})`}
        strokeWidth="3"
        opacity="0.9"
      />

      <circle
        cx="80"
        cy="80"
        r="50"
        fill={`url(#${bgGradientId})`}
      />

      {/* Abstract AI mark (L + spark) */}
      <path
        d="M68 52 V108 H92"
        stroke={`url(#${textGradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="98"
        cy="56"
        r="3.5"
        fill="#38BDF8"
      />

      {/* Text: Lumina A.I */}
      {variant === 'full' && (
        <text
          x="160"
          y="92"
          fill={`url(#${textGradientId})`}
          fontSize="44"
          fontWeight="600"
          fontFamily="Inter, ui-sans-serif, system-ui"
          letterSpacing="0.04em"
        >
          LUMINA A.I
        </text>
      )}
    </svg>
  );
};
