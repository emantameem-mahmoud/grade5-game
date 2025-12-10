import React from 'react';

interface PlantProgressProps {
  current: number;
  total: number;
}

const PlantProgress: React.FC<PlantProgressProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;

  // Determine plant stage based on percentage
  let plantIcon = "🌱"; // Seedling
  if (percentage > 33) plantIcon = "🌿"; // Herb
  if (percentage > 66) plantIcon = "🌳"; // Tree

  return (
    <div className="w-full max-w-md mx-auto mb-6 bg-white/50 rounded-full p-2 backdrop-blur-sm border border-white/40 shadow-sm relative">
      <div className="flex justify-between items-center px-2 relative z-10">
        <span className="text-xs font-bold text-rose-900">البداية</span>
        <span className="text-2xl transition-all duration-500 transform hover:scale-125 cursor-help" title="تابع التقدم لنمو النبات!">
            {plantIcon}
        </span>
        <span className="text-xs font-bold text-rose-900">النهاية</span>
      </div>
      
      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-gray-200 rounded-full w-full -z-0"></div>
      
      {/* Active Progress */}
      <div 
        className="absolute bottom-0 right-0 h-1.5 bg-gradient-to-l from-rose-600 to-red-400 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default PlantProgress;