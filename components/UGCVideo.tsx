'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copyText, setCopyText] = useState("Copy Link");
  const [bgFailed, setBgFailed] = useState(false);
  
  const [videoData, setVideoData] = useState({
    brand: "the app",
    bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    gif: "/stickers/elon.gif", 
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "loading creative assets...",
    rawUrl: ""
  });

  const assetLibrary = {
    backgrounds: {
      gym: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80"
      ],
      kitchen: [
        "https://images.unsplash.com/photo-1556910103-1c02745a872f?w=800&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
        "https://images.unsplash.com/photo-1524859330668-c357331384f5?w=800&q=80"
      ],
      bedroom: [
        "https://images.unsplash.com/photo-1598550473950-575fb8629ba8?w=800&q=80",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
        "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80"
      ],
      office: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
        "https://images.unsplash.com/photo-1520607162513-3d70747a9f7d?w=800&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80"
      ],
      store: [
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80",
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80",
        "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=800&q=80",
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
      ]
    },
    stickers: {
      cena: "/stickers/cena.gif", drake: "/stickers/drake.gif", elon: "/stickers/elon.gif",
      gordon: "/stickers/gordon.gif", hart: "/stickers/hart.gif", rock: "/stickers/rock.gif",
      ronaldo: "/stickers/ronaldo.gif", shaq: "/stickers/shaq.gif", speed: "/stickers/speed.gif", spongebob: "/stickers/spongebob.gif"
    },
    audio: Array.from({length: 15}, (_, i) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`)
  };

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && (rawUrl.includes('/render/') || rawUrl.includes('/video/'))) {
      const urlObj = new URL(rawUrl);
      const brandName = urlObj.pathname.split('/').pop()?.toLowerCase() || "the app";
      
      const rawHook = urlObj.searchParams.get('h') || `me using ${brandName}`;
      const hookText = rawHook.replace(/-/g, ' ');

      const bgKey = (urlObj.searchParams.get('b') || "office") as keyof typeof assetLibrary.backgrounds;
      const gifKey = (urlObj.searchParams.get('g') || "elon") as keyof typeof assetLibrary.stickers;

      // Because the component re-runs on every new videoState, this randomizer will properly execute every time!
      const bgArray = assetLibrary.backgrounds[bgKey] || assetLibrary.backgrounds.office;
      const selectedBg = bgArray[Math.floor(Math.random() * bgArray.length)];
      
      const selectedGif = assetLibrary.stickers[gifKey] || assetLibrary.stickers.elon;
      const randomAudio = assetLibrary.audio[Math.floor(Math.random() * assetLibrary.audio.length)];

      setBgFailed(false); // Reset fail state on new video

      setVideoData({ 
        brand: brandName, 
        text: hookText.toLowerCase(), 
        bg: selectedBg,
        gif: selectedGif,
        audio: randomAudio,
        rawUrl: rawUrl 
      });
    }
  }, [videoState]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const handlePlayToggle = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(e => console.log(e));
    setIsPlaying(!isPlaying);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(videoData.rawUrl);
    setCopyText("Copied! ✓");
    setTimeout(() => setCopyText("Copy Link"), 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap');
        body, p, span, div, input, button { font-family: 'Inter', -apple-system, sans-serif !important; }
        .tiktok-text { text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
      `}} />

      <div className="w-full flex flex-col items-center my-8" style={{ isolation: 'isolate' }}>
        <div className="relative p-[2px] rounded-[20px] bg-gradient-to-b from-blue-500/50 to-purple-600/50 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
          <div onClick={handlePlayToggle} className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-gradient-to-br from-slate-700 to-slate-900 rounded-[18px] overflow-hidden cursor-pointer select-none">
            
            {/* If Unsplash rate-limits, bgFailed becomes true, and the sleek slate background remains visible */}
            {!bgFailed && (
              <img 
                src={videoData.bg} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity filter contrast-125 opacity-60"
                onError={() => setBgFailed(true)}
              />
            )}
            
            <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />
            <div className="absolute top-[12%] left-0 right-0 px-6 text-center pointer-events-none z-[20]">
              <h3 className="tiktok-text text-white text-[20px] sm:text-[22px] leading-[1.25] font-bold tracking-tight" style={{ wordBreak: 'break-word' }}>{videoData.text}</h3>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none z-[10]">
              <img src={videoData.gif} alt="" className="w-[90%] max-h-[60%] object-contain object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]" />
            </div>
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity z-[30]">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <svg className="w-8 h-8 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-[280px] sm:w-[320px] justify-between gap-3 mt-5">
          <button onClick={() => setIsMuted(!isMuted)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white/90 text-sm font-medium py-3 rounded-xl border border-white/10 transition-colors flex justify-center items-center gap-2">
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button onClick={handleCopy} className={`flex-1 text-sm font-semibold py-3 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 ${copyText.includes("Copied") ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {copyText}
          </button>
        </div>
      </div>
    </>
  );
}