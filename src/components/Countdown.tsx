import React from 'react';

interface CountdownProps {
  count: number;
}

const Countdown: React.FC<CountdownProps> = ({ count }) => {
  return (
    <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <span className="text-6xl font-bold text-blue-500 dark:text-blue-400 animate-pulse">{count}</span>
    </div>
  );
};

export default Countdown;