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
        scale: [1, 1.8, 0.5, 1.5, 1],
        rotate: [0, -30, 30, -20, 20, 0],
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
        onColorChange('white'); // Left = White (Dimension Tear)
        controls.start({
          x: [offset.x, -100, 100, 0],
          scaleX: [1, 4, 0.2, 1],
          scaleY: [1, 0.1, 3, 1],
          rotate: [0, 180, 0],
          transition: { duration: 0.5, ease: 'easeInOut' },
        });
      } else {
        // Snap back to origin if below threshold
        controls.start({ x: 0, y: 0 });
      }
    } else {
      // Vertical drag
      if (offset.y > threshold) {
        onColorChange('cyan'); // Down = Cyan (Heavy Drop)
        controls.start({
          y: [offset.y, 800, -800, 0],
          scaleY: [1, 2, 0.5, 1],
          transition: { duration: 0.6, ease: 'backOut' },
        });
      } else if (offset.y < -threshold) {
        onColorChange('pink'); // Up = Pink (The Glitch Ascend)
        controls.start({
          y: [offset.y, -1000, 1000, 0],
          scaleY: [1, 4, 4, 1],
          scaleX: [1, 0.2, 0.2, 1],
          transition: { duration: 0.7, ease: 'easeInOut' },
        });
      } else {
        // Snap back to origin if below threshold
        controls.start({ x: 0, y: 0 });
      }
    }
  };

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNudgeTrigger = () => {
    onNudge();
    controls.start({
      scale: [1, 1.8, 0.5, 1.5, 1],
      rotate: [0, -30, 30, -20, 20, 0],
      transition: { type: 'spring', stiffness: 500, damping: 12, mass: 1 },
    });
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const startHold = () => {
    holdTimer.current = setTimeout(() => {
      handleNudgeTrigger();
    }, 3000);
    controls.start({
      scale: 0.7,
      rotate: [0, -5, 5, -5, 5, 0],
      transition: { duration: 3.0, ease: 'linear' }
    });
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
      controls.start({
        scale: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 500, damping: 15 }
      });
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden touch-none select-none">
      <motion.div
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        onDragStart={cancelHold}
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
        Drag to snap color &bull; Hold to nudge
      </div>
    </div>
  );
}
