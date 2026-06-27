'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shareText, setShareText] = useState("Share Link");
  const [bgLoaded, setBgLoaded] = useState(false);
  
  const [videoData, setVideoData] = useState({
    brand: "THE APP",
    bg: "https://image.pollinations.ai/prompt/modern%20office?width=800&height=1200&nologo=true",
    gif: "https://media.tenor.com/mOPEt9lB5aUAAAAi/drake-computer.gif", 
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "LOADING CREATIVE ASSETS..."
  });

  const baseVideo = "https://raw.githubusercontent.com/mediaelement/mediaelement-files/master/big_buck_bunny.mp4";

  const audios: Record<number, string> = {
    1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    4: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    5: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    6: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    7: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    8: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    9: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    10: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
  };

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      setBgLoaded(false); // Reset loader

      const urlObj = new URL(rawUrl);
      const brandName = rawUrl.split('/').pop()?.split('?')[0] || "THE APP";
      
      const rawHook = urlObj.searchParams.get('h') || `POV:-USING-${brandName}`;
      const bgSearchTerm = urlObj.searchParams.get('b') || "modern-office";
      const gifSearchTerm = urlObj.searchParams.get('g') || "drake";

      const hookText = rawHook.replace(/-/g, ' ');
      const cleanBgQuery = bgSearchTerm.replace(/-/g, ' ');
      const cleanGifQuery = gifSearchTerm.replace(/-/g, ' ');

      const dynamicBg = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanBgQuery)}?width=800&height=1200&nologo=true`;
      const randomAudio = audios[Math.floor(Math.random() * 10) + 1];

      setVideoData(prev => ({ 
        ...prev, 
        brand: brandName, 
        text: hookText, 
        bg: dynamicBg,
        audio: randomAudio
      }));

      // STRICT TRANSPARENCY FILTER: Added &searchfilter=sticker
      fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(cleanGifQuery)}&key=LIVDSRZULELA&searchfilter=sticker&limit=3`)
        .then(res => res.json())
        .then(data => {
          if (data && data.results && data.results.length > 0) {
            setVideoData(prev => ({ ...prev, gif: data.results[0].media[0].gif.url }));
          } else {
            // Unblockable fallback if search yields nothing
            setVideoData(prev => ({ ...prev, gif: "https://media.tenor.com/mOPEt9lB5aUAAAAi/drake-computer.gif" }));
          }
        })
        .catch(() => {
          setVideoData(prev => ({ ...prev, gif: "https://media.tenor.com/mOPEt9lB5aUAAAAi/drake-computer.gif" }));
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

  const handleShare = () => {
    navigator.clipboard.writeText(`https://ugc-engine.app/shared/${videoData.brand.toLowerCase()}`);
    setShareText("Link Copied!");
    setTimeout(() => setShareText("Share Link"), 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body, p, span, div, input, button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}} />

      <div className="w-full flex flex-col items-center my-8" style={{ isolation: 'isolate' }}>
        <div className="relative p-[2px] rounded-[20px] bg-gradient-to-b from-blue-500/50 to-purple-600/50 shadow-[0_0_30px_rgba(139,92,246,0.2)] group hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-500">
          
          <div 
            onClick={handlePlayToggle}
            // Added bg-zinc-800 animate-pulse to show a loading skeleton before the BG image arrives
            className={`relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] rounded-[18px] overflow-hidden cursor-pointer select-none ${bgLoaded ? 'bg-[#111]' : 'bg-zinc-800 animate-pulse'}`}
          >
            {/* BACKGROUND */}
            <img 
              src={videoData.bg} 
              alt="" 
              onLoad={() => setBgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity filter contrast-125 pointer-events-none transition-opacity duration-500 ${bgLoaded ? 'opacity-50' : 'opacity-0'}`} 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800"; setBgLoaded(true); }} 
            />
            
            <video 
              ref={videoRef} 
              src={baseVideo} 
              loop 
              muted 
              playsInline 
              crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[1] mix-blend-screen" 
            />
            
            <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />

            {/* TRUE TRANSPARENT STICKER */}
            <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-[10]">
              <img 
                src={videoData.gif} 
                alt="" 
                className="w-[220px] h-auto object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)]" 
                onError={(e) => { e.currentTarget.src = "https://media.tenor.com/mOPEt9lB5aUAAAAi/drake-computer.gif"; }} 
              />
            </div>

            {/* DYNAMIC HOOK WITH BRAND */}
            <div className="absolute top-14 left-0 right-0 px-6 text-center pointer-events-none z-[20]">
              <h3 className="text-white text-[24px] sm:text-[26px] leading-[1.1] font-black uppercase tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-stroke-sm" style={{ wordBreak: 'break-word' }}>
                {videoData.text}
              </h3>
            </div>

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity z-[30]">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)] transform transition group-hover:scale-110">
                  <svg className="w-8 h-8 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-[280px] sm:w-[320px] justify-between gap-3 mt-5">
          <button onClick={() => setIsMuted(!isMuted)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium py-3 rounded-xl transition-all duration-300 border border-white/10 backdrop-blur-sm flex justify-center items-center gap-2">
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button onClick={handleShare} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold py-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.4)] flex justify-center items-center gap-2">
            {shareText}
          </button>
        </div>
      </div>
    </>
  );
}