'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasInitialized = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shareText, setShareText] = useState("Share Link");
  
  const [videoData, setVideoData] = useState({
    brand: "the app",
    // Base64 Dark Grey Image (Prevents black screens before load)
    bg: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M+AAQABAQEBKocL/wAAAABJRU5ErkJggg==",
    // Base64 Transparent Image (Prevents broken icon before load)
    gif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", 
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
    if (hasInitialized.current) return;

    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      hasInitialized.current = true;

      const urlObj = new URL(rawUrl);
      const brandName = urlObj.pathname.split('/').pop()?.toLowerCase() || "the app";
      
      const rawHook = urlObj.searchParams.get('h') || `me using ${brandName}`;
      const hookText = rawHook.replace(/-/g, ' ');

      const bgKey = urlObj.searchParams.get('b') || "bedroom";
      const gifSearchTerm = urlObj.searchParams.get('g') || "drake";

      // BULLETPROOF DICTIONARY: Unsplash is rate-limiting you. We are using Pexels, routed through your proxy.
      const bgDict: Record<string, string> = {
        gym: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
        kitchen: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800",
        bedroom: "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800",
        office: "https://images.pexels.com/photos/289814/pexels-photo-289814.jpeg?auto=compress&cs=tinysrgb&w=800",
        store: "https://images.pexels.com/photos/1036857/pexels-photo-1036857.jpeg?auto=compress&cs=tinysrgb&w=800"
      };

      const rawBgUrl = bgDict[bgKey] || bgDict.bedroom;
      const proxyBgUrl = `/api/proxy?url=${encodeURIComponent(rawBgUrl)}`;
      const randomAudio = audios[Math.floor(Math.random() * 6) + 1];

      // Instantly load text and proxy background
      setVideoData(prev => ({
        ...prev,
        brand: brandName,
        text: hookText.toLowerCase(),
        bg: proxyBgUrl,
        audio: randomAudio
      }));

      // THE GHOST ARCHITECTURE: Route the Tenor API Search through the proxy to blind the adblocker
      const tenorApiUrl = `https://g.tenor.com/v1/search?q=${encodeURIComponent(gifSearchTerm)}&key=LIVDSRZULELA&searchfilter=sticker&limit=10`;
      const proxyApiUrl = `/api/proxy?url=${encodeURIComponent(tenorApiUrl)}`;

      fetch(proxyApiUrl)
        .then(res => res.json())
        .then(data => {
          if (data && data.results && data.results.length > 0) {
            // Randomize from the top 5 true transparent stickers
            const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
            const stickerUrl = data.results[randomIndex].media[0].gif.url;
            
            // Route the final image fetch through the proxy as well
            setVideoData(prev => ({ ...prev, gif: `/api/proxy?url=${encodeURIComponent(stickerUrl)}` }));
          }
        })
        .catch(err => console.error("Ghost Proxy Search Failed:", err));
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
            className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-zinc-900 rounded-[18px] overflow-hidden cursor-pointer select-none"
          >
            {/* BACKGROUND LAYER */}
            <img 
              src={videoData.bg} 
              alt="Environment" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity filter contrast-125 pointer-events-none"
              // Fallback to dark grey pixel if Vercel proxy times out
              onError={(e) => { e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M+AAQABAQEBKocL/wAAAABJRU5ErkJggg=="; }}
            />
            
            <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />

            {/* TEXT LAYER */}
            <div className="absolute top-[12%] left-0 right-0 px-6 text-center pointer-events-none z-[20]">
              <h3 className="tiktok-text text-white text-[20px] sm:text-[22px] leading-[1.25] font-bold tracking-tight" style={{ wordBreak: 'break-word' }}>
                {videoData.text}
              </h3>
            </div>

            {/* CELEBRITY LAYER */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none z-[10]">
              <img 
                src={videoData.gif} 
                alt="" 
                className="w-[90%] max-h-[60%] object-contain object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
                // Fallback to transparent pixel if Vercel proxy times out
                onError={(e) => { e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; }}
              />
            </div>

            {/* PLAY BUTTON */}
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