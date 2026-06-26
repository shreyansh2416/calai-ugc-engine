'use client';

import React, { useRef, useState } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Safely extract the URL
  let videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  if (typeof videoState === 'string' && videoState.includes('http')) {
    videoUrl = videoState;
  } else if (videoState && typeof videoState.url === 'string') {
    videoUrl = videoState.url;
  }

  // DYNAMIC THEME ENGINE: Match the background and meme to the specific video
  let bgPoster = "";
  let memeAsset = "";
  let hookText = "";

  if (videoUrl.includes("BigBuckBunny")) {
    // THEME 1: CalAI -> Gym Background + The Rock (Transparent)
    bgPoster = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"; 
    memeAsset = "https://media.tenor.com/1OcbvYyS13UAAAAi/the-rock-sus.gif"; 
    hookText = "ME ACTING LIKE I KNOW MY MACROS SO I JUST OPEN CALAI";
  } else if (videoUrl.includes("ElephantsDream")) {
    // THEME 2: YouTube -> Gaming/Study Room + IShowSpeed (Transparent)
    bgPoster = "https://images.unsplash.com/photo-1598550473950-575fb8629ba8?q=80&w=1000&auto=format&fit=crop"; 
    memeAsset = "https://media.tenor.com/L-qQf_iKkQ4AAAAi/ishowspeed-speed.gif"; 
    hookText = "WHEN I FIND A HIDDEN GEM ON YOUTUBE";
  } else {
    // THEME 3: Generic/Nike -> Retail Store + Drake (Transparent)
    bgPoster = "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1000&auto=format&fit=crop"; 
    memeAsset = "https://media.tenor.com/8a6Q4kO7pBwAAAAi/drake-yes.gif"; 
    hookText = "POV: FINDING THE PERFECT PRODUCT ONLINE";
  }

  const handlePlayToggle = () => {
    if (!videoRef.current || !audioRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log("Video playback interrupted:", err));
      audioRef.current.play().catch(err => console.log("Audio playback interrupted:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full flex justify-center my-6" style={{ isolation: 'isolate' }}>
      <div 
        onClick={handlePlayToggle}
        className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 cursor-pointer select-none group"
      >
        {/* LAYER 1: Dynamic Background Image */}
        <img 
          src={bgPoster} 
          alt="UGC Context Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity pointer-events-none"
        />

        {/* LAYER 2: Live Video Feed */}
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]"
        />

        {/* LAYER 3: Audio Track */}
        <audio 
          ref={audioRef}
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          loop
        />

        {/* LAYER 4: Famous Transparent Meme Cutout with drop-shadow for 3D depth */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-24">
          <img 
            src={memeAsset} 
            alt="Hyped Meme Cutout" 
            className="w-[180px] h-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* LAYER 5: Dynamic Text Hook */}
        <div className="absolute bottom-8 left-0 right-0 px-4 text-center pointer-events-none z-[3]">
          <h3 className="text-white text-lg sm:text-xl font-black uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] text-stroke">
            {hookText} 🚀
          </h3>
        </div>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity group-hover:bg-black/50 z-[4]">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transform transition group-hover:scale-110">
              <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}