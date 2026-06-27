'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copyText, setCopyText] = useState("Copy");
  
  const [videoData, setVideoData] = useState({
    brand: "THE APP",
    bg: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800",
    gif: "https://media.tenor.com/x8v1oNUOmg4AAAAi/drake-computer.gif",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "POV: AUTOMATING VIDEO CREATION"
  });

  const baseVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      const urlObj = new URL(rawUrl);
      const brandName = rawUrl.split('/').pop()?.split('?')[0] || "THE APP";
      const themeId = parseInt(urlObj.searchParams.get('t') || "1");
      const hookText = urlObj.searchParams.get('h') || `POV USING ${brandName} FOR THE FIRST TIME`;

      // 5 RELIABLE THEMES: Unsplash (BG) + Tenor (Transparent Sticker) + SoundHelix (Audio)
      const themes: Record<number, any> = {
        1: { // Drake (Smug)
          bg: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800",
          gif: "https://media.tenor.com/x8v1oNUOmg4AAAAi/drake-computer.gif",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        2: { // The Rock (Suspicious)
          bg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800",
          gif: "https://media.tenor.com/1OcbvYyS13UAAAAi/the-rock-sus.gif",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        },
        3: { // IShowSpeed (Rage)
          bg: "https://images.unsplash.com/photo-1598550473950-575fb8629ba8?q=80&w=800",
          gif: "https://media.tenor.com/L-qQf_iKkQ4AAAAi/ishowspeed-speed.gif",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        },
        4: { // Shaq (Vibing)
          bg: "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800",
          gif: "https://media.tenor.com/rN5x6vBv2sQAAAAi/shaq-wiggle.gif",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        },
        5: { // Math Lady (Confused)
          bg: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800",
          gif: "https://media.tenor.com/3Gv2x_BovI4AAAAi/math-calculate.gif",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
        }
      };

      const selectedTheme = themes[themeId] || themes[1];
      setVideoData({ brand: brandName, text: hookText, ...selectedTheme });
    }
  }, [videoState]);

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
        <img src={videoData.bg} alt="Environment" className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" />
        <video ref={videoRef} src={baseVideo} loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[1]" />
        <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />

        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-20">
          <img src={videoData.gif} alt="Celebrity Layer" className="w-[190px] h-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,1)]" />
        </div>

        <div className="absolute top-12 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
          <h3 className="text-white text-[22px] leading-[1.15] font-black uppercase tracking-wide drop-shadow-[0_6px_10px_rgba(0,0,0,1)] text-stroke">
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

      {/* 2. THE ACTION BAR */}
      <div className="flex w-[280px] sm:w-[320px] justify-between gap-2 mt-4">
        <button onClick={() => setIsMuted(!isMuted)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold py-3 rounded-xl transition shadow-lg border border-zinc-700 flex justify-center items-center gap-2">
          {isMuted ? (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button onClick={handleCopy} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold py-3 rounded-xl transition shadow-lg border border-zinc-700 flex justify-center items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          {copyText}
        </button>
        
        {/* FIX: Bypasses CORS by opening securely in a new tab instead of forcing a direct download */}
        <a href={baseVideo} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold py-3 rounded-xl transition shadow-lg border border-blue-500 flex justify-center items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          Open
        </a>
      </div>

    </div>
  );
}