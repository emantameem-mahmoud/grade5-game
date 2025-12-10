import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const Celebration: React.FC = () => {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      // Maroon, Gold, White/Silver theme
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9b1c1c', '#FFD700', '#ffffff'] 
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9b1c1c', '#FFD700', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return null;
};

export default Celebration;