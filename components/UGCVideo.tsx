'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State Locks to prevent re-renders wiping out old videos
  const hasInitialized = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shareText, setShareText] = useState("Share Link");
  
  const [videoData, setVideoData] = useState({
    brand: "the app",
    bg: "https://image.pollinations.ai/prompt/modern%20living%20room?width=800&height=1200&nologo=true",
    gif: "https://media.giphy.com/media/26FPOvJzkuh3S/giphy.gif", 
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "loading creative assets..."
  });

  const audios: Record<number, string> = {
    1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    4: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    5: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    6: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  };

  useEffect(() => {
    // PREVENTS BUG: If this video component already loaded its specific data, do not let React reset it!
    if (hasInitialized.current) return;

    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      hasInitialized.current = true; // Lock the component state

      const urlObj = new URL(rawUrl);
      const brandName = urlObj.pathname.split('/').pop()?.toLowerCase() || "the app";
      
      const rawHook = urlObj.searchParams.get('h') || `me using ${brandName}`;
      const bgSearchTerm = urlObj.searchParams.get('b') || "modern-living-room";
      const gifSearchTerm = urlObj.searchParams.get('g') || "the-rock";

      const hookText = rawHook.replace(/-/g, ' ');
      const cleanBgQuery = bgSearchTerm.replace(/-/g, ' ') + " photorealistic 4k interior"; 
      
      // Seed ensures Pollinations caches the image so it loads instantly next time
      const seed = Math.floor(Math.random() * 100000);
      const dynamicBg = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanBgQuery)}?width=800&height=1200&nologo=true&seed=${seed}`;
      const randomAudio = audios[Math.floor(Math.random() * 6) + 1];

      setVideoData(prev => ({ 
        ...prev, 
        brand: brandName, 
        text: hookText.toLowerCase(), 
        bg: dynamicBg,
        audio: randomAudio
      }));

      // DIRECT GIPHY STICKER API: Bypasses the proxy to prevent Vercel IP blocking. Exclusively returns transparent cutouts.
      const fetchUrl = `https://api.giphy.com/v1/stickers/search?api_key=GlVGYHqc3SyCEGpoJCj7A5bXzD09s8Wf&q=${encodeURIComponent(gifSearchTerm)}&limit=10`;

      fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
          if (data && data.data && data.data.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(data.data.length, 5));
            const stickerUrl = data.data[randomIndex].images.fixed_height.url;
            setVideoData(prev => ({ ...prev, gif: stickerUrl }));
          }
        })
        .catch(console.error);
    }
  }, [videoState]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const handlePlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap');
        body, p, span, div, input, button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
        .tiktok-text {
          text-shadow: 
            2px 2px 0 #000, 
           -1px -1px 0 #000,  
            1px -1px 0 #000,
           -1px  1px 0 #000,
            1px  1px 0 #000;
        }
      `}} />

      <div className="w-full flex flex-col items-center my-8" style={{ isolation: 'isolate' }}>
        <div className="relative p-[2px] rounded-[20px] bg-gradient-to-b from-blue-500/50 to-purple-600/50 shadow-[0_0_30px_rgba(139,92,246,0.2)] group hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-500">
          
          <div 
            onClick={handlePlayToggle}
            className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-[#111] rounded-[18px] overflow-hidden cursor-pointer select-none"
          >
            {/* ONLY BACKGROUND LAYER. <video> tag is completely deleted. */}
            <img 
              src={videoData.bg} 
              alt="Environment" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity filter contrast-125 pointer-events-none" 
            />
            
            <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />

            {/* TIKTOK TEXT */}
            <div className="absolute top-[12%] left-0 right-0 px-6 text-center pointer-events-none z-[20]">
              <h3 className="tiktok-text text-white text-[20px] sm:text-[22px] leading-[1.25] font-bold tracking-tight" style={{ wordBreak: 'break-word' }}>
                {videoData.text}
              </h3>
            </div>

            {/* TRANSPARENT GIPHY STICKER */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none z-[10]">
              <img 
                src={videoData.gif} 
                alt="Celebrity" 
                className="w-[90%] max-h-[60%] object-contain object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]" 
              />
            </div>

            {/* PLAY BUTTON OVERLAY */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity z-[30]">
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