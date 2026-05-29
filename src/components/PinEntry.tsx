'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PinEntryProps {
  onJoin: (pin: string) => void;
  isDarkMode: boolean;
}

export function PinEntry({ onJoin, isDarkMode }: PinEntryProps) {
  const [pin, setPin] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setPin(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      onJoin(pin);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-8 w-full max-w-sm"
      >
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center">
          Enter PIN
        </h1>
        
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={pin}
          onChange={handleChange}
          placeholder="0000"
          className={`w-full text-center text-7xl md:text-8xl font-black tracking-[0.2em] outline-none border-4 p-8 transition-all focus:-translate-y-1 focus:-translate-x-1 ${
            isDarkMode
              ? 'border-white bg-black text-white placeholder-white/20 shadow-[8px_8px_0_0_#FFFFFF] focus:shadow-[12px_12px_0_0_#FFFFFF]'
              : 'border-black bg-white text-black placeholder-black/20 shadow-[8px_8px_0_0_#000000] focus:shadow-[12px_12px_0_0_#000000]'
          }`}
        />

        <button
          type="submit"
          disabled={pin.length !== 4}
          className={`w-full py-6 text-3xl font-black uppercase border-4 transition-all active:translate-y-2 active:translate-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'border-white bg-white text-black shadow-[8px_8px_0_0_#FFFFFF] active:shadow-[0_0_0_0_#FFFFFF] disabled:bg-gray-800'
              : 'border-black bg-black text-white shadow-[8px_8px_0_0_#000000] active:shadow-[0_0_0_0_#000000] disabled:bg-gray-300'
          }`}
        >
          Connect
        </button>
      </motion.form>
    </div>
  );
}
