'use client';

import { useState, useEffect, useRef } from 'react';
import { PinEntry } from '@/components/PinEntry';
import { Token } from '@/components/Token';
import { useResonance } from '@/hooks/useResonance';
import { motion, useAnimation } from 'framer-motion';

export default function Home() {
  const [pin, setPin] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { myState, partnerState, isConnected, updateColor, sendNudge } = useResonance(pin);
  const bgControls = useAnimation();
  const prevMyColor = useRef(myState.color);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDarkMode(saved === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // Trigger background animations when MY color changes (dragging)
  useEffect(() => {
    if (myState.color !== prevMyColor.current) {
      const newColor = myState.color;
      prevMyColor.current = newColor;

      if (newColor === 'pink') {
        bgControls.start({
          scale: [1, 1.05, 1],
          transition: { type: 'spring', stiffness: 300 },
        });
      } else if (newColor === 'cyan') {
        bgControls.start({
          scale: [1, 0.5, 1.2, 1],
          transition: { duration: 0.6, ease: 'backOut' },
        });
      } else if (newColor === 'white') {
        bgControls.start({
          skewX: [0, 45, -45, 0],
          skewY: [0, -20, 20, 0],
          transition: { duration: 0.5, ease: 'easeInOut' },
        });
      } else if (newColor === 'yellow') {
        bgControls.start({
          rotate: [0, -15, 15, -360, 0],
          scale: [1, 1.5, 0.5, 1],
          transition: { duration: 0.8 },
        });
      }
    }
  }, [myState.color, bgControls]);

  const getPartnerBgColor = () => {
    if (partnerState.color === 'neutral') {
      return isDarkMode ? '#000000' : '#FFFFFF';
    }
    const colorMap: Record<string, string> = {
      white: '#FFFFFF',
      pink: '#FF007F',
      cyan: '#00FFFF',
      yellow: '#FFFF00',
    };
    return colorMap[partnerState.color];
  };

  return (
    <motion.main 
      animate={bgControls}
      className={`w-screen h-screen flex flex-col items-center justify-center transition-colors duration-500 relative ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
      style={pin && partnerState.color !== 'neutral' ? { backgroundColor: getPartnerBgColor() } : {}}
    >
      <button 
        onClick={toggleTheme}
        className={`absolute top-6 right-6 font-black uppercase text-xs tracking-widest px-4 py-2 border-4 transition-all active:translate-y-1 active:translate-x-1 z-50 ${
          isDarkMode 
            ? 'bg-black text-white border-white shadow-[4px_4px_0_0_#FFF] active:shadow-[0_0_0_0_#FFF]' 
            : 'bg-white text-black border-black shadow-[4px_4px_0_0_#000] active:shadow-[0_0_0_0_#000]'
        }`}
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {!pin ? (
        <PinEntry onJoin={setPin} isDarkMode={isDarkMode} />
      ) : (
        <>
          {/* Connection Indicator */}
          <div className="absolute top-20 right-6 z-20 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full border-2 border-black ${isConnected ? 'bg-[#00FF00]' : 'bg-[#FF0000]'} shadow-[2px_2px_0_0_#000]`}></div>
            <span className={`font-bold uppercase text-xs tracking-widest px-2 py-1 border-2 shadow-[2px_2px_0_0_#000] ${isDarkMode ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}`}>
              {isConnected ? `Room ${pin}` : 'Connecting'}
            </span>
          </div>
          
          <Token 
            currentColor={myState.color}
            partnerLastNudge={partnerState.lastNudge}
            onColorChange={updateColor}
            onNudge={sendNudge}
            isDarkMode={isDarkMode}
          />
        </>
      )}
    </motion.main>
  );
}
