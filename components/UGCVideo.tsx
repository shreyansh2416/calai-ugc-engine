import React, { useRef, useState } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Layer 1: Background Image (Gym Aesthetic)
  const bgImage = "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop"; 
  
  // Layer 2: Trending Audio
  const trendingAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
  
  // Layer 3: Trendy Text Overlay
  const hookText = "Me acting like I know my macros so I just open CalAI and let it handle it";
  
  // Layer 4: Transparent GIF (No background, perfectly cut out)
  const memeGif = "https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif"; 

  // Global toggle enables clicking anywhere on the frame to play or pause
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
      setIsPlaying(true);
    }
  };

  return (
    // 'mx-auto' perfectly centers the player in the chat box
    <div 
      onClick={handleTogglePlay}
      className="mx-auto my-4 w-[300px] h-[533px] relative overflow-hidden rounded-xl border-2 border-gray-800 shadow-2xl bg-black cursor-pointer select-none flex flex-col justify-between py-16"
    >
      {/* 1. Background Photo Layer */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
      />

      {/* 2. Audio Track Layer */}
      <audio ref={audioRef} src={trendingAudio} loop />

      {/* 3. Trendy Text Overlay Layer */}
      <div className="relative z-10 px-6 w-full flex justify-center mt-4">
        <h1 
          className="text-white text-[24px] font-black text-center leading-snug uppercase tracking-wider"
          style={{ textShadow: '0px 4px 12px rgba(0,0,0,1), 0px 2px 4px rgba(0,0,0,0.8)' }}
        >
          {hookText}
        </h1>
      </div>

      {/* 4. Transparent GIF on Top Layer */}
      <div className="relative z-10 w-full flex justify-center items-end px-4 mb-4 h-full pb-10">
        <img
          src={memeGif}
          alt="Transparent Meme"
          className="w-[120%] max-h-[300px] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* Play/Pause UI Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all z-40">
          <div className="bg-white/20 p-5 rounded-full backdrop-blur-md shadow-2xl border border-white/10 transition-transform duration-200">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}