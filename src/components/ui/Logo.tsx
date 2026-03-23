import React from 'react';

export const Logo: React.FC<{ className?: string; color?: string }> = ({ 
  className = "w-8 h-8", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Aviator Sunglasses Icon */}
      <path 
        d="M2 10C2 10 3 10 4 10C5 10 6 9 6 8V7" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <path 
        d="M22 10C22 10 21 10 20 10C19 10 18 9 18 8V7" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <path 
        d="M6 11C6 13.7614 8.23858 16 11 16C11 16 11 16 11 16C11 16 11 16 11 16C13.7614 16 16 13.7614 16 11V10C16 8.89543 15.1046 8 14 8H8C6.89543 8 6 8.89543 6 10V11Z" 
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Refined Teardrop Lenses */}
      <path 
        d="M3 10C3 13.5 5 17 8.5 17C12 17 12 13.5 12 10C12 8.5 10.5 7 9 7H6C4.5 7 3 8.5 3 10Z" 
        fill={color}
      />
      <path 
        d="M21 10C21 13.5 19 17 15.5 17C12 17 12 13.5 12 10C12 8.5 13.5 7 15 7H18C19.5 7 21 8.5 21 10Z" 
        fill={color}
      />
      {/* Bridge */}
      <path 
        d="M10 8.5H14" 
        stroke="white" 
        strokeWidth="0.5" 
        strokeLinecap="round"
      />
      <path 
        d="M10 10H14" 
        stroke="white" 
        strokeWidth="0.5" 
        strokeLinecap="round"
      />
    </svg>
  );
};
