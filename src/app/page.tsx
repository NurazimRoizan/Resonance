'use client';

import { useState, useEffect } from 'react';
import { PinEntry } from '@/components/PinEntry';
import { Token } from '@/components/Token';
import { useResonance, ResonanceColor } from '@/hooks/useResonance';

const colorMap: Record<ResonanceColor, string> = {
  white: '#FFFFFF',
  pink: '#FF007F',
  cyan: '#00FFFF',
  yellow: '#FFFF00',
};

export default function Home() {
  const [pin, setPin] = useState<string | null>(null);
  const { myState, partnerState, isConnected, updateColor, sendNudge } = useResonance(pin);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  if (!pin) {
    return (
      <main className="w-screen h-screen flex items-center justify-center bg-white transition-colors duration-500">
        <PinEntry onJoin={setPin} />
      </main>
    );
  }

  // Once connected, the background represents the PARTNER's color
  // The central token represents MY color
  const partnerColorHex = colorMap[partnerState.color];

  return (
    <main 
      className="w-screen h-screen flex flex-col items-center justify-center transition-colors duration-500 relative"
      style={{ backgroundColor: partnerColorHex }}
    >
      {/* Connection Indicator */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full border-2 border-black ${isConnected ? 'bg-[#00FF00]' : 'bg-[#FF0000]'} shadow-[2px_2px_0_0_#000]`}></div>
        <span className="font-bold uppercase text-xs tracking-widest px-2 py-1 bg-white border-2 border-black shadow-[2px_2px_0_0_#000]">
          {isConnected ? `Room ${pin}` : 'Connecting'}
        </span>
      </div>
      
      <Token 
        currentColor={myState.color}
        partnerLastNudge={partnerState.lastNudge}
        onColorChange={updateColor}
        onNudge={sendNudge}
      />
    </main>
  );
}
