import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 font-mono">
      <div className="text-4xl font-bold text-white mb-8">Loading Words</div>
      <div className="w-16 h-16 border-t-4 border-white border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingScreen;