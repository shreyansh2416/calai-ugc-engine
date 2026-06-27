'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copyText, setCopyText] = useState("Copy");
  const [downloadText, setDownloadText] = useState("Download");
  
  const [videoData, setVideoData] = useState({
    brand: "THE APP",
    bg: "https://images.pexels.com/photos/6954162/pexels-photo-6954162.jpeg?auto=compress&cs=tinysrgb&w=800",
    gif: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Exploding%20Head.png",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "LITERAL CHEAT CODE FOR AUTOMATION"
  });

  const baseVideo = "https://www.w3schools.com/html/mov_bbb.mp4";

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      const urlObj = new URL(rawUrl);
      const brandName = rawUrl.split('/').pop()?.split('?')[0] || "THE APP";
      const hookText = urlObj.searchParams.get('h') || `LITERAL CHEAT CODE FOR USING ${brandName}`;

      // Reliable transparent assets (Animated Emojis via GitHub Raw - Unblockable)
      const themes = [
        { 
          bg: "https://images.pexels.com/photos/6954162/pexels-photo-6954162.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hot%20Face.png"
        },
        { 
          bg: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Mind%20Blown.png"
        },
        { 
          bg: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Peeking%20Eye.png"
        }
      ];

      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      setVideoData({ 
        brand: brandName, 
        text: hookText, 
        bg: randomTheme.bg,
        gif: randomTheme.gif,
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      });
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

  // SMART DOWNLOADER: Blob fetch with window.open fallback for CORS
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloadText("Wait...");
    try {
      const response = await fetch(baseVideo);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `UGC_${videoData.brand}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setDownloadText("Done!");
    } catch (error) {
      window.open(baseVideo, '_blank');
      setDownloadText("Opened");
    }
    setTimeout(() => setDownloadText("Download"), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center my-6" style={{ isolation: 'isolate' }}>
      
      {/* 1. THE VIDEO PLAYER */}
      <div 
        onClick={handlePlayToggle}
        className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 cursor-pointer select-none group"
      >
        <img 
          src={videoData.bg} 
          alt="Environment" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" 
          onError={(e) => e.currentTarget.style.display = 'none'} 
        />
        
        <video 
          ref={videoRef} 
          src={baseVideo} 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[1]" 
          crossOrigin="anonymous" 
        />
        
        <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />

        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-20">
          <img 
            src={videoData.gif} 
            alt="Meme" 
            className="w-[190px] h-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,1)]" 
            onError={(e) => e.currentTarget.style.display = 'none'} 
          />
        </div>

        <div className="absolute top-12 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
          <h3 className="text-white text-[20px] sm:text-[22px] leading-[1.15] font-black uppercase tracking-wide drop-shadow-[0_6px_10px_rgba(0,0,0,1)] text-stroke" style={{ wordBreak: 'break-word' }}>
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
        
        <button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold py-3 rounded-xl transition shadow-lg border border-blue-500 flex justify-center items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          {downloadText}
        </button>
      </div>

    </div>
  );
}