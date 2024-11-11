'use client';

import { AudioContextType, AudioProps } from "@/types";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [audio, setAudio] = useState<AudioProps | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);  // Added state for tracking if audio is playing
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/create-podcast') {
      setAudio(undefined);
      setIsPlaying(false);  // Reset playback status on specific routes
    }
  }, [pathname]);

  return (
    <AudioContext.Provider value={{ audio, setAudio, isPlaying, setIsPlaying }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);

  if (!context) throw new Error('useAudio must be used within an AudioProvider');

  return context;
};

export default AudioProvider;
