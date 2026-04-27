import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  { 
    id: 1, 
    title: 'Neon Drive [AI Mock]', 
    artist: 'SynthBot 3000', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
  },
  { 
    id: 2, 
    title: 'Cyber City [AI Mock]', 
    artist: 'NeuroNet', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' 
  },
  { 
    id: 3, 
    title: 'Digital Horizon [AI Mock]', 
    artist: 'Quantum Wave', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' 
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    switchTrack(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    switchTrack(prevIndex);
  };

  const switchTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setProgress(0);
    setIsPlaying(true);
  };

  // When track changes, play it auto if it was playing, else wait
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error("Playback failed line 63", e);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const handleEnded = () => {
    handleNext(); // Autoplay next track
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  return (
    <div className="flex flex-col p-6 bg-slate-900 border border-slate-700/50 rounded-2xl neon-box-pink w-full">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-pink-500/30">
        <div className="w-16 h-16 rounded bg-slate-950 border border-pink-500 flex items-center justify-center neon-box-pink shrink-0 relative overflow-hidden group">
           {/* Pulsing overlay when playing */}
           {isPlaying && (
             <div className="absolute inset-0 bg-pink-500/20 animate-pulse" />
           )}
           <Music className="text-pink-500 w-8 h-8 relative z-10" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-orbitron font-bold text-pink-400 text-lg truncate neon-text-pink">
            {currentTrack.title}
          </p>
          <p className="text-slate-400 text-sm truncate uppercase tracking-widest mt-1">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Progress Bar */}
      <div className="mb-6 relative w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_0_10px_#ec4899] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handlePrev}
            className="p-3 text-slate-400 hover:text-pink-400 hover:bg-slate-800 rounded-full transition-all active:scale-95"
            aria-label="Previous Track"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="p-4 bg-pink-600 text-slate-950 rounded-full hover:bg-pink-500 transition-all hover:scale-105 active:scale-95 neon-box-pink"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            )}
          </button>
          
          <button 
            onClick={handleNext}
            className="p-3 text-slate-400 hover:text-pink-400 hover:bg-slate-800 rounded-full transition-all active:scale-95"
            aria-label="Next Track"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mt-2 px-2">
          <button 
            onClick={() => setIsMuted(m => !m)}
            className="text-slate-400 hover:text-pink-400 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
