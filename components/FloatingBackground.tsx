import React from 'react';

// Configuration for background effects - adjustable parameters
const CONFIG = {
  minSpeed: 6,      // Minimum animation duration in seconds
  speedVariance: 8, // Range of random variance for duration
  minDelay: 0,      // Minimum start delay
  delayVariance: 5, // Range of random delay
  baseOpacity: 0.15,
  opacityVariance: 0.25,
};

const FloatingBackground: React.FC = () => {
  const icons = [
    // Tech Emojis
    { icon: '💻', left: '10%', top: '10%', type: 'float' },
    { icon: '💾', left: '50%', top: '40%', type: 'wiggle' },
    { icon: '01', left: '20%', top: '60%', type: 'pulse' },
    { icon: '🤖', left: '85%', top: '30%', type: 'float' },
    { icon: '⌨️', left: '5%', top: '50%', type: 'spin' },
    { icon: '🖥️', left: '90%', top: '80%', type: 'glow' },
    { icon: '📡', left: '60%', top: '10%', type: 'pulse' },
    { icon: '⚙️', left: '40%', top: '5%', type: 'spin-slow' },
    { icon: '☁️', left: '10%', top: '90%', type: 'float' },
    { icon: '🖱️', left: '30%', top: '75%', type: 'wiggle' },
    { icon: '📱', left: '70%', top: '20%', type: 'float' },
    { icon: '🎮', left: '5%', top: '30%', type: 'spin-reverse' },
    
    // Nature Emojis (keeping the garden theme but less bio-lab)
    { icon: '🌱', left: '80%', top: '15%', type: 'float' },
    { icon: '🌿', left: '15%', top: '80%', type: 'float' },
    { icon: '🍃', left: '95%', top: '5%', type: 'float' },
    { icon: '🌷', left: '35%', top: '20%', type: 'pulse' },
    { icon: '🌻', left: '75%', top: '50%', type: 'float' },
  ];

  const getAnimationClass = (type: string) => {
    switch (type) {
      case 'spin': return 'animate-spin-slow';
      case 'spin-slow': return 'animate-spin-slow';
      case 'spin-reverse': return 'animate-spin-reverse';
      case 'wiggle': return 'animate-wiggle';
      case 'glow': return 'animate-glow';
      case 'pulse': return 'animate-pulse-slow';
      case 'float': default: return 'animate-float';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((item, index) => {
        // Calculate random parameters based on config
        const duration = CONFIG.minSpeed + Math.random() * CONFIG.speedVariance;
        const delay = CONFIG.minDelay + Math.random() * CONFIG.delayVariance;
        const opacity = CONFIG.baseOpacity + Math.random() * CONFIG.opacityVariance;
        
        return (
          <div
            key={index}
            className={`absolute text-4xl select-none ${getAnimationClass(item.type)}`}
            style={{
              left: item.left,
              top: item.top,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity: opacity,
              filter: 'blur(0.5px)'
            }}
          >
            {item.icon}
          </div>
        );
      })}
    </div>
  );
};

export default FloatingBackground;