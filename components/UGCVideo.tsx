'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shareText, setShareText] = useState("Share Link");
  
  const [videoData, setVideoData] = useState({
    brand: "THE APP",
    bg: "https://images.unsplash.com/photo-1598550473950-575fb8629ba8?q=80&w=800",
    gif: "https://media.giphy.com/media/Mhwkr651ANpjJY3xNt/giphy.gif",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "LITERAL CHEAT CODE FOR AUTOMATION"
  });

  const baseVideo = "https://raw.githubusercontent.com/mediaelement/mediaelement-files/master/big_buck_bunny.mp4";

  // Unique Audio Pool
  const audios: Record<number, string> = {
    1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    4: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    5: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  };

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      const urlObj = new URL(rawUrl);
      const brandName = rawUrl.split('/').pop()?.split('?')[0] || "THE APP";
      
      const themeId = parseInt(urlObj.searchParams.get('t') || "4");
      const audioId = parseInt(urlObj.searchParams.get('a') || "1");
      
      const rawHook = urlObj.searchParams.get('h') || `BRO-THIS-IS-INSANE`;
      const hookText = rawHook.replace(/-/g, ' ');

      // STRICT SEMANTIC MATCHING: Background explicitly matches the GIF's activity
      const themes: Record<number, any> = {
        1: { // Food/Eating -> Shaq Eating + Dining Table
          bg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800",
          gif: "https://media.giphy.com/media/1wXdllYv2D0Q/giphy.gif"
        },
        2: { // Studying/Work -> Drake Laptop + Study Room/Library
          bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800",
          gif: "https://media.giphy.com/media/800iiDTaNNFOwytONV/giphy.gif"
        },
        3: { // Cooking/Home -> Gordon Ramsay + Kitchen
          bg: "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800",
          gif: "https://media.giphy.com/media/103t71VKmtY1UY/giphy.gif"
        },
        4: { // Gaming/Tech -> IShowSpeed + RGB Gaming Room
          bg: "https://images.unsplash.com/photo-1598550473950-575fb8629ba8?q=80&w=800",
          gif: "https://media.giphy.com/media/Mhwkr651ANpjJY3xNt/giphy.gif"
        },
        5: { // Fitness/Gym -> The Rock + Gym/Locker Room
          bg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800",
          gif: "https://media.giphy.com/media/14smAwp2uHM3Di/giphy.gif"
        }
      };

      const selectedTheme = themes[themeId] || themes[4];
      
      setVideoData({ 
        brand: brandName, 
        text: hookText, 
        bg: selectedTheme.bg,
        gif: selectedTheme.gif,
        audio: audios[audioId] || audios[1]
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
      {/* GLOBAL OPENAI CHAT FONT OVERRIDE */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body, p, span, div, input, button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}} />

      <div className="w-full flex flex-col items-center my-8" style={{ isolation: 'isolate' }}>
        
        {/* PREMIUM GLOWING UI */}
        <div className="relative p-[2px] rounded-[20px] bg-gradient-to-b from-blue-500/50 to-purple-600/50 shadow-[0_0_30px_rgba(139,92,246,0.2)] group hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-500">
          <div 
            onClick={handlePlayToggle}
            className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-[#111] rounded-[18px] overflow-hidden cursor-pointer select-none"
          >
            {/* BACKGROUND */}
            <img 
              src={videoData.bg} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity filter contrast-125 pointer-events-none" 
            />
            
            {/* BASE VIDEO */}
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

            {/* CELEBRITY GIF (Rendered as an IMG tag to guarantee visibility) */}
            <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-[2]">
              <img 
                src={videoData.gif} 
                alt="Reaction" 
                className="w-[200px] h-auto object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)]" 
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>

            {/* TRENDY TEXT */}
            <div className="absolute top-14 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
              <h3 className="text-white text-[24px] sm:text-[26px] leading-[1.1] font-black uppercase tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-stroke-sm" style={{ wordBreak: 'break-word' }}>
                {videoData.text}
              </h3>
            </div>

            {/* PLAY BUTTON */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity z-[4]">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)] transform transition group-hover:scale-110">
                  <svg className="w-8 h-8 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex w-[280px] sm:w-[320px] justify-between gap-3 mt-5">
          <button onClick={() => setIsMuted(!isMuted)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium py-3 rounded-xl transition-all duration-300 border border-white/10 backdrop-blur-sm flex justify-center items-center gap-2">
            {isMuted ? (
               <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
            {isMuted ? "Unmute" : "Mute"}
          </button>

          <button onClick={handleShare} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold py-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.4)] flex justify-center items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            {shareText}
          </button>
        </div>
      </div>
    </>
  );
}