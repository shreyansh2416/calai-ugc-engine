'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copyText, setCopyText] = useState("Copy Link");

  // Default Fallback Data
  const [videoData, setVideoData] = useState({
    brand: "THE APP",
    bg: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800",
    gif: "https://media.giphy.com/media/3oEdv5S8Th6b9gsNqM/giphy.gif",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "POV: AUTOMATING VIDEO CREATION"
  });

  const baseVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      const parts = rawUrl.split('/').pop()?.split('-') || [];
      const brandName = parts[0] || "THE APP";
      const themeId = parseInt(parts[1]) || 1;

      // 5 STRICTLY UNIQUE THEMES (Guarantees different music, gif, bg, and text every time)
      const themes = [
        { // 1: The Suspect / Gym Vibe
          bg: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzBqZXJ4YmR4c3Z4am15cTZ0M2p5bDJ1b3V5Z215eDFlOHk1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7qE1YN7aBOFPRw8E/giphy.gif", // Travolta
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          text: `ME ACTING LIKE I KNOW WHAT I'M DOING UNTIL I OPENED ${brandName}`
        },
        { // 2: The Chill / Office Vibe
          bg: "https://images.pexels.com/photos/373076/pexels-photo-373076.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://media.giphy.com/media/3oEdv5S8Th6b9gsNqM/giphy.gif", // Shaq Chill
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          text: `POV: YOU FINALLY STOPPED GATEKEEPING ${brandName}`
        },
        { // 3: The Rage / Gaming Vibe
          bg: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif", // Angry Keyboard Guy
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          text: `WHEN ${brandName} CASUALLY DROPS THE BEST FEATURE OF THE YEAR`
        },
        { // 4: The Approval / Studio Vibe
          bg: "https://images.pexels.com/photos/6954162/pexels-photo-6954162.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://media.giphy.com/media/5wWf7H89XdRvXepbVg/giphy.gif", // Drake Approval
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
          text: `MY THERAPIST TOLD ME TO FIND PEACE SO I LOGGED INTO ${brandName}`
        },
        { // 5: The Confused / Retail Vibe
          bg: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif", // Kevin Hart Confused
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
          text: `HOW IT FEELS TO USE ${brandName} INSTEAD OF DOING IT MANUALLY`
        }
      ];

      setVideoData({ brand: brandName, ...themes[themeId - 1] });
    }
  }, [videoState]);

  const handlePlayToggle = () => {
    if (!videoRef.current || !audioRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.log(e));
      audioRef.current.play().catch(e => console.log(e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://ugc-engine.app/shared/${videoData.brand.toLowerCase()}`);
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy Link"), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center my-6" style={{ isolation: 'isolate' }}>
      
      {/* 1. THE VIDEO PLAYER */}
      <div 
        onClick={handlePlayToggle}
        className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 cursor-pointer select-none group"
      >
        <img src={videoData.bg} alt="Environment" className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" />
        
        <video ref={videoRef} src={baseVideo} loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-[1]" />
        
        <audio ref={audioRef} src={videoData.audio} loop />

        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-20">
          <img src={videoData.gif} alt="Celebrity Layer" className="w-[190px] h-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)]" />
        </div>

        <div className="absolute top-12 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
          <h3 className="text-white text-[20px] leading-[1.2] font-black uppercase tracking-wide drop-shadow-[0_5px_8px_rgba(0,0,0,1)] text-stroke">
            {videoData.text}
          </h3>
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity group-hover:bg-black/50 z-[4]">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transform transition group-hover:scale-110">
              <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE ACTION BAR (Copy & Download) */}
      <div className="flex w-[280px] sm:w-[320px] justify-between gap-3 mt-4">
        <button 
          onClick={handleCopy}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition shadow-lg border border-zinc-700 flex justify-center items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          {copyText}
        </button>
        
        <a 
          href={baseVideo} 
          target="_blank" 
          rel="noreferrer"
          download={`UGC_${videoData.brand}.mp4`}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 px-4 rounded-xl transition shadow-lg border border-blue-500 flex justify-center items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download
        </a>
      </div>

    </div>
  );
}