'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copyText, setCopyText] = useState("Copy");
  const [stickerUrl, setStickerUrl] = useState("https://media.tenor.com/1OcbvYyS13UAAAAi/the-rock-sus.gif"); // Default fallback

  const [videoData, setVideoData] = useState({
    brand: "THE APP",
    bgUrl: "https://image.pollinations.ai/prompt/aesthetic%20modern%20room?width=800&height=1200&nologo=true",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "POV: AUTOMATING VIDEO CREATION 🚀",
    celeb: "The Rock"
  });

  const baseVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Dynamic Audio Pool to prevent repeating music
  const audioPool = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  ];

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      try {
        const urlObj = new URL(rawUrl);
        const hook = urlObj.searchParams.get('hook') || "POV: AUTOMATING VIDEO CREATION";
        const celeb = urlObj.searchParams.get('celeb') || "Drake";
        const bgPrompt = urlObj.searchParams.get('bg') || "cool neon room";
        
        // Randomize Audio
        const randomAudio = audioPool[Math.floor(Math.random() * audioPool.length)];
        
        // Generate AI Background Image on the fly
        const dynamicBg = `https://image.pollinations.ai/prompt/${encodeURIComponent(bgPrompt)}?width=800&height=1200&nologo=true`;

        setVideoData({
          brand: rawUrl.split('/').pop()?.split('?')[0] || "THE APP",
          text: hook,
          celeb: celeb,
          bgUrl: dynamicBg,
          audio: randomAudio
        });

        // Fetch Live Transparent Celebrity Sticker from Tenor API
        fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(celeb + ' transparent sticker')}&key=LIVDSRZULELA&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              setStickerUrl(data.results[0].media[0].gif.url);
            }
          })
          .catch(e => console.error("Tenor API blocked, using fallback."));

      } catch (e) { console.error("URL Parsing Error"); }
    }
  }, [videoState]);

  // Sync mute state with elements
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

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
    setTimeout(() => setCopyText("Copy"), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center my-6" style={{ isolation: 'isolate' }}>
      
      {/* 1. THE VIDEO PLAYER */}
      <div 
        onClick={handlePlayToggle}
        className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 cursor-pointer select-none group"
      >
        {/* Infinite Dynamic AI Background */}
        <img src={videoData.bgUrl} alt="Environment" className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />
        
        {/* Faded Base Video Feed */}
        <video ref={videoRef} src={baseVideo} loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[1]" />
        
        {/* Trending Audio */}
        <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />

        {/* Live Transparent Celebrity API Fetch */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-20">
          <img src={stickerUrl} alt={videoData.celeb} className="w-[200px] h-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,1)]" />
        </div>

        {/* Dynamic AI Hook Text */}
        <div className="absolute top-12 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
          <h3 className="text-white text-[22px] leading-[1.1] font-black uppercase tracking-wide drop-shadow-[0_6px_10px_rgba(0,0,0,1)] text-stroke">
            {videoData.text}
          </h3>
        </div>

        {/* Play State Indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity group-hover:bg-black/50 z-[4]">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transform transition group-hover:scale-110">
              <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE ACTION BAR */}
      <div className="flex w-[280px] sm:w-[320px] justify-between gap-2 mt-4">
        {/* Mute Button */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold py-3 rounded-xl transition shadow-lg border border-zinc-700 flex justify-center items-center gap-2"
        >
          {isMuted ? (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
          {isMuted ? "Unmute" : "Mute"}
        </button>

        {/* Copy Button */}
        <button 
          onClick={handleCopy}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold py-3 rounded-xl transition shadow-lg border border-zinc-700 flex justify-center items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          {copyText}
        </button>
        
        {/* Download Button */}
        <a 
          href={baseVideo} 
          target="_blank" 
          rel="noreferrer"
          download={`UGC_${videoData.brand}.mp4`}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold py-3 rounded-xl transition shadow-lg border border-blue-500 flex justify-center items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Save
        </a>
      </div>

    </div>
  );
}