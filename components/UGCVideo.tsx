import React, { useRef, useState } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const bgRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Layer 1: Background Video
  const bgVideo = "https://www.w3schools.com/html/mov_bbb.mp4"; 
  // Layer 2: Trending Audio
  const trendingAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
  // Layer 3: Trendy Text Overlay
  const hookText = "Me acting like I know my macros so I just open CalAI and let it handle it";
  // Layer 4: GIF on Top (Most Important Part)
  const memeGif = "https://i.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif"; 

  // Global toggle enables clicking anywhere on the frame to play or pause
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bgRef.current || !audioRef.current) return;

    if (isPlaying) {
      bgRef.current.pause();
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      bgRef.current.play().catch((err) => console.error("Video play failed:", err));
      audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
      setIsPlaying(true);
    }
  };

  return (
    <div 
      onClick={handleTogglePlay}
      className="w-[300px] h-[533px] relative overflow-hidden rounded-xl border-2 border-gray-800 shadow-2xl mt-4 bg-black cursor-pointer select-none flex flex-col justify-between py-16"
    >
      {/* 1. Background Video Layer */}
      <video
        ref={bgRef}
        src={bgVideo}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
        loop
        playsInline
        muted // Muted to guarantee browser autoplay configurations do not halt execution
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

      {/* 4. GIF on Top Layer (Includes a fallback if Brave Browser blocks the image) */}
      <div className="relative z-10 w-full flex justify-center items-center px-4 mb-4">
        <img
          src={memeGif}
          alt="Meme"
          className="w-4/5 max-h-[220px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] rounded-lg"
          onError={(e) => {
            // If Brave blocks the GIF, seamlessly fall back to a trendy Emoji layout so it never looks broken
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.innerHTML = '<span style="font-size: 5rem; filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.8));">💀😭</span>';
            }
          }}
        />
      </div>

      {/* Play/Pause UI Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all z-40">
          <div className="bg-white/20 p-5 rounded-full backdrop-blur-md shadow-2xl border border-white/10 hover:scale-110 transition-transform duration-200">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}