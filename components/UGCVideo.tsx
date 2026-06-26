'use client';

import React, { useRef, useState } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  let videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  if (typeof videoState === 'string' && videoState.includes('http')) {
    videoUrl = videoState;
  } else if (videoState && typeof videoState.url === 'string') {
    videoUrl = videoState.url;
  }

  // 1. Same Audio Track Every Time
  const trendingAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  // 2. Creative Assembly Engine
  let bgPoster = "";
  let memeAsset = "";
  let hookText = "";

  if (videoUrl.includes("v=2")) {
    // VARIANT 2: The "Acting" Guy
    bgPoster = "https://images.pexels.com/photos/373076/pexels-photo-373076.jpeg?auto=compress&cs=tinysrgb&w=800"; // Real Study Room/Office
    memeAsset = "https://media.giphy.com/media/l46CBEVQjSJG6mCnC/giphy.gif?ct=s"; // Transparent "Thinking/Acting" Guy
    hookText = "me acting like i know my macros so i just open calai.app and let it handle it";
  } else if (videoUrl.includes("v=3")) {
    // VARIANT 3: The "Angry" Guy
    bgPoster = "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800"; // Real Messy Gaming Room
    memeAsset = "https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif?ct=s"; // Transparent Raging/Angry Guy
    hookText = "me when i'm still logging calories manually instead of using calai.app";
  } else {
    // VARIANT 1: The "Chill" Guy (Default)
    bgPoster = "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800"; // Real Kitchen/Dining Room
    memeAsset = "https://media.giphy.com/media/3oEdv5S8Th6b9gsNqM/giphy.gif?ct=s"; // Transparent Chill/Nodding Guy (Shaq)
    hookText = "When you're just eating chill but calai.app casually drops your macros anyway";
  }

  const handlePlayToggle = () => {
    if (!videoRef.current || !audioRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log("Video:", err));
      audioRef.current.play().catch(err => console.log("Audio:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full flex justify-center my-6" style={{ isolation: 'isolate' }}>
      <div 
        onClick={handlePlayToggle}
        className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 cursor-pointer select-none group"
      >
        {/* Background Environment */}
        <img 
          src={bgPoster} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        />

        {/* Video feed overlaid at low opacity */}
        <video
          ref={videoRef}
          src={videoUrl.split('?')[0]} // Strip the ?v=X so the video file actually loads
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[1]"
        />

        {/* Unified Audio Track */}
        <audio ref={audioRef} src={trendingAudio} loop />

        {/* True Transparent Character mapped to the background environment */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-24">
          <img 
            src={memeAsset} 
            alt="Meme Layer" 
            className="w-[180px] h-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Dynamic Recruiter Text Hook */}
        <div className="absolute top-12 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
          <h3 className="text-white text-[22px] leading-[1.2] font-black uppercase tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
            {hookText}
          </h3>
        </div>

        {/* Play Button */}
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