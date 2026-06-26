import React, { useRef, useState } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const bgRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // THE FIX: Using universally trusted Vercel and Giphy CDNs that bypass Brave Shields
  const bgVideo = "https://assets.vercel.com/video/upload/v1588629558/nextjs/next-video.mp4";
  const trendingAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const hookText = "me acting like I know my macros so I just open calai.app and let it handle it";
  const memeGif = "https://media.giphy.com/media/L0qTl8hl84QwGStXAI/giphy.gif"; 

  // Custom play handler ensures audio and video start together in perfect sync
  const handlePlay = () => {
    setIsPlaying(true);
    if (bgRef.current) bgRef.current.play();
    if (audioRef.current) audioRef.current.play();
  };

  return (
    <div className="w-[300px] h-[533px] relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl mt-4 bg-black">

      {/* Layer 1: Background Video */}
      <video
        ref={bgRef}
        src={bgVideo}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-70"
        loop
        playsInline
      />

      {/* Layer 2: Audio Track */}
      <audio ref={audioRef} src={trendingAudio} loop />

      {/* Layer 3: Trendy Text Overlay */}
      <div className="absolute top-16 left-0 w-full flex justify-center px-6 pointer-events-none z-10">
        <h1 className="text-white text-[22px] font-extrabold text-center drop-shadow-[0_4px_4px_rgba(0,0,0,1)] leading-snug">
          {hookText}
        </h1>
      </div>

      {/* Layer 4: Meme GIF Overlay */}
      <div className="absolute bottom-16 left-0 w-full flex justify-center pointer-events-none z-10">
        <img
          src={memeGif}
          alt="Meme Reaction"
          className="w-4/5 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
        />
      </div>

      {/* Custom UI: Play Button Overlay to cleanly handle browser autoplay policies */}
      {!isPlaying && (
        <div
          onClick={handlePlay}
          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-all z-50"
        >
          <div className="bg-white/20 p-5 rounded-full backdrop-blur-md">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Custom UI: TikTok/Reels Engagement Buttons */}
      <div className="absolute right-3 bottom-24 flex flex-col gap-4 pointer-events-none z-20">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg text-lg">🤍</div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg text-lg">💬</div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg text-lg">↗️</div>
      </div>
      
    </div>
  );
}