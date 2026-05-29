'use client';

import { useRef, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { ResonanceColor } from '@/hooks/useResonance';

interface TokenProps {
  currentColor: ResonanceColor;
  partnerLastNudge: number | null;
  onColorChange: (color: ResonanceColor) => void;
  onNudge: () => void;
  isDarkMode: boolean;
}

export function Token({ currentColor, partnerLastNudge, onColorChange, onNudge, isDarkMode }: TokenProps) {
  const getTokenColor = () => {
    if (currentColor === 'neutral') {
      return isDarkMode ? '#FFFFFF' : '#171717';
    }
    const colorMap: Record<string, string> = {
      white: '#FFFFFF',
      pink: '#FF007F',
      cyan: '#00FFFF',
      yellow: '#FFFF00',
    };
    return colorMap[currentColor];
  };

  const controls = useAnimation();
  const prevNudge = useRef(partnerLastNudge);

  // Trigger pop animation when partner sends a nudge
  useEffect(() => {
    if (partnerLastNudge && partnerLastNudge !== prevNudge.current) {
      prevNudge.current = partnerLastNudge;
      // "The Heartbeat Wobble" for incoming nudge
      controls.start({
        scale: [1, 1.4, 0.9, 1.2, 1],
        rotate: [0, -15, 15, -10, 10, 0],
        transition: { type: 'spring', stiffness: 500, damping: 12, mass: 1 },
      });
    }
  }, [partnerLastNudge, controls]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    const threshold = 50;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal drag
      if (offset.x > threshold) {
        onColorChange('yellow'); // Right = Yellow
        controls.start({
          x: [offset.x, -20, 20, -15, 15, 0],
          rotate: [0, -10, 10, -5, 5, 0],
          transition: { type: 'spring', stiffness: 400, damping: 10 },
        });
      } else if (offset.x < -threshold) {
        onColorChange('white'); // Left = White
        controls.start({
          x: [offset.x, -5, 5, -2, 2, 0],
          transition: { type: 'spring', stiffness: 800, damping: 5 },
        });
      } else {
        // Snap back to origin if below threshold
        controls.start({ x: 0, y: 0 });
      }
    } else {
      // Vertical drag
      if (offset.y > threshold) {
        onColorChange('cyan'); // Down = Cyan
        controls.start({
          y: [offset.y, offset.y + 20, 0],
          scaleY: [1, 0.8, 1.1, 1],
          transition: { duration: 1.0, ease: "easeOut" },
        });
      } else if (offset.y < -threshold) {
        onColorChange('pink'); // Up = Pink
        controls.start({
          y: [offset.y, -40, 20, -10, 0],
          scale: [1, 1.1, 1, 1.05, 1],
          transition: { type: 'spring', stiffness: 300, damping: 8 },
        });
      } else {
        // Snap back to origin if below threshold
        controls.start({ x: 0, y: 0 });
      }
    }
  };

  const handleDoubleClick = () => {
    onNudge();
    // "The Heartbeat Wobble" for local nudge
    controls.start({
      scale: [1, 1.4, 0.9, 1.2, 1],
      rotate: [0, -15, 15, -10, 10, 0],
      transition: { type: 'spring', stiffness: 500, damping: 12, mass: 1 },
    });
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Aggressive heartbeat buzz
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden touch-none select-none">
      <motion.div
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        onDoubleClick={handleDoubleClick}
        animate={controls}
        style={{
          backgroundColor: getTokenColor(),
        }}
        className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-[8px] cursor-grab active:cursor-grabbing active:scale-95 transition-colors duration-300 flex items-center justify-center relative z-10 ${
          isDarkMode 
            ? 'border-white shadow-[16px_16px_0_0_#808080]' 
            : 'border-black shadow-[16px_16px_0_0_#000000]'
        }`}
      >
      </motion.div>
      
      {/* Instructions overlaid with mix-blend-difference to guarantee visibility against any background */}
      <div className="absolute bottom-12 left-0 right-0 text-center text-sm md:text-base font-black tracking-widest uppercase opacity-80 pointer-events-none z-0 mix-blend-difference text-white">
        Drag to snap color &bull; Double tap to nudge
      </div>
    </div>
  );
}
