import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen py-12 px-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-900/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid background effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #ec4899 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-12">
        <header className="text-center">
          <h1 className="text-5xl md:text-7xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2 neon-text-pink mix-blend-screen">
            SYNTHSNAKE
          </h1>
          <p className="text-slate-400 uppercase tracking-[0.3em] font-orbitron text-sm">
            Interactive Audio-Visual Experience
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 w-full justify-center items-start lg:items-stretch">
          <div className="w-full lg:w-[450px]">
            <SnakeGame />
          </div>
          
          <div className="w-full lg:w-[350px] shrink-0">
            <MusicPlayer />
            
            <div className="mt-8 p-6 bg-slate-900 border border-slate-700/50 rounded-2xl hidden lg:block">
              <h3 className="font-orbitron text-cyan-400 font-bold mb-3 uppercase tracking-wider text-sm">Controls</h3>
              <ul className="text-slate-400 text-sm space-y-2 font-mono">
                <li><span className="inline-block w-8 text-pink-400">WASD</span> Move snake</li>
                <li><span className="inline-block w-8 text-pink-400">&larr;&rarr;</span> Move snake</li>
                <li><span className="inline-block w-8 text-pink-400">SPC</span> Start / Restart</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
