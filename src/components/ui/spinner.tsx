import React from 'react';

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => (
  <div className={`animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 ${className}`}></div>
);