import React from 'react';

export const LoadingFallback: React.FC = () => (
  <div
    className="min-h-[60vh] flex items-center justify-center"
    role="status"
    aria-label="Loading"
  >
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default LoadingFallback;
