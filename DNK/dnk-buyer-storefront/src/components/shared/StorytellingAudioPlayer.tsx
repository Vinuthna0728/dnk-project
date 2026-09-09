"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface StorytellingAudioPlayerProps {
  audioUrl?: string;
  artisanName: string;
}

export const StorytellingAudioPlayer: React.FC<StorytellingAudioPlayerProps> = ({
  audioUrl,
  artisanName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 border border-purple-100 rounded-2xl p-3 shadow-sm">
      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-200">
        <Volume2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-purple-900 tracking-wide uppercase">Artisan Voice Note</p>
        <p className="text-sm text-slate-600 truncate">Listen to {artisanName}'s Craft Story</p>
      </div>
      {audioUrl ? (
        <>
          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
          <button
            onClick={togglePlay}
            aria-label="Play story"
            className="h-9 w-9 rounded-full bg-white border border-purple-200 hover:border-purple-400 text-purple-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
        </>
      ) : (
        <span className="text-xs text-slate-400 italic">No Audio</span>
      )}
    </div>
  );
};