import React, { useRef, useState } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const bgRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Gold Standard Open Assets - Zero embed/hotlink restrictions
  const bgVideo = "https://www.w3schools.com/html/mov_bbb.mp4"; 
  const trendingAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
  const hookText = "me acting like I know my macros so I just open calai.app and let it handle it";
  const memeGif = "https://upload.wikimedia.org/wikipedia/commons/a/a5/Red_Panda_Animate.gif";

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
      className="w-[300px] h-[533px] relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl mt-4 bg-black cursor-pointer select-none group"
    >
      {/* Layer 1: Background Video */}
      <video
        ref={bgRef}
        src={bgVideo}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
        loop
        playsInline
        muted // Muted to guarantee browser autoplay configurations do not halt execution
      />

      {/* Layer 2: Audio Track */}
      <audio ref={audioRef} src={trendingAudio} loop />

      {/* Layer 3: Trendy Text Overlay */}
      <div className="absolute top-16 left-0 w-full flex justify-center px-6 pointer-events-none z-10">
        <h1 className="text-white text-[22px] font-extrabold text-center drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] leading-snug uppercase tracking-wide">
          {hookText}
        </h1>
      </div>

      {/* Layer 4: Meme GIF Overlay */}
      <div className="absolute bottom-16 left-0 w-full flex justify-center pointer-events-none z-10">
        <img
          src={memeGif}
          alt="Meme Reaction"
          className="w-3/5 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* UI Layer: Dynamic Play/Pause Screen State */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all z-40">
          <div className="bg-white/20 p-5 rounded-full backdrop-blur-md shadow-xl border border-white/10 group-hover:scale-110 transition-transform">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* UI Layer: Subtle Pause Indicator on Hover when running */}
      {isPlaying && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all z-30 opacity-0 hover:opacity-100">
          <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </div>
        </div>
      )}

      {/* UI Layer: TikTok/Reels Engagement Bar */}
      <div className="absolute right-3 bottom-24 flex flex-col gap-4 pointer-events-none z-20">
        <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg text-lg">🤍</div>
        <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg text-lg">💬</div>
        <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg text-lg">↗️</div>
      </div>
    </div>
  );
}