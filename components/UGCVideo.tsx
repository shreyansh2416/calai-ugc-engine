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
    bg: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800",
    gif: "https://c.tenor.com/mOPEt9lB5aUAAAAC/drake-computer.gif", // Changed to c.tenor.com to bypass shields
    gifFallback: "https://i.giphy.com/media/8a6Q4kO7pBwAAAAi/giphy.webp", // Backup if Tenor is blocked
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "LITERAL CHEAT CODE FOR AUTOMATION"
  });

  const baseVideo = "https://raw.githubusercontent.com/mediaelement/mediaelement-files/master/big_buck_bunny.mp4";

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      const urlObj = new URL(rawUrl);
      const brandName = rawUrl.split('/').pop()?.split('?')[0] || "THE APP";
      const themeId = parseInt(urlObj.searchParams.get('t') || "1");
      
      // Parse the AI hook and replace hyphens back with spaces for display
      const rawHook = urlObj.searchParams.get('h') || `BRO-THIS-IS-INSANE`;
      const hookText = rawHook.replace(/-/g, ' ');

      // 5 Themes with Primary and Fallback GIFs to guarantee they load
      const themes: Record<number, any> = {
        1: { 
          bg: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800",
          gif: "https://c.tenor.com/mOPEt9lB5aUAAAAC/drake-computer.gif",
          gifFallback: "https://i.giphy.com/media/8a6Q4kO7pBwAAAAi/giphy.webp",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        2: { 
          bg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800",
          gif: "https://c.tenor.com/1OcbvYyS13UAAAAC/the-rock-sus.gif",
          gifFallback: "https://i.giphy.com/media/1OcbvYyS13UAAAAi/giphy.webp",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        },
        3: { 
          bg: "https://images.unsplash.com/photo-1598550473950-575fb8629ba8?q=80&w=800",
          gif: "https://c.tenor.com/L-qQf_iKkQ4AAAAC/ishowspeed-speed.gif",
          gifFallback: "https://i.giphy.com/media/L-qQf_iKkQ4AAAAi/giphy.webp",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        },
        4: { 
          bg: "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800",
          gif: "https://c.tenor.com/qLhVn0B_n_kAAAAC/shaq-shaquille-o-neal.gif",
          gifFallback: "https://i.giphy.com/media/3oEdv5S8Th6b9gsNqM/giphy.webp",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        },
        5: { 
          bg: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800",
          gif: "https://c.tenor.com/3Gv2x_BovI4AAAAC/math-calculate.gif",
          gifFallback: "https://i.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.webp",
          audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
        }
      };

      const selectedTheme = themes[themeId] || themes[1];
      
      setVideoData({ 
        brand: brandName, 
        text: hookText, 
        ...selectedTheme 
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
    <div className="w-full flex flex-col items-center my-8" style={{ isolation: 'isolate' }}>
      
      {/* GLOWING PREMIUM UI WRAPPER */}
      <div className="relative p-[2px] rounded-[20px] bg-gradient-to-b from-blue-500/50 to-purple-600/50 shadow-[0_0_30px_rgba(139,92,246,0.2)] group hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-500">
        <div 
          onClick={handlePlayToggle}
          className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-black rounded-[18px] overflow-hidden cursor-pointer select-none"
        >
          {/* Background */}
          <img 
            src={videoData.bg} 
            alt="" 
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none filter contrast-125" 
          />
          
          {/* Video */}
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

          {/* CELEBRITY GIF WITH FALLBACK */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-24">
            <img 
              src={videoData.gif} 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-[190px] h-auto object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)]" 
              onError={(e) => {
                // If the primary Tenor link gets blocked by your browser, it instantly swaps to Giphy!
                const target = e.currentTarget;
                if (target.src !== videoData.gifFallback) {
                  target.src = videoData.gifFallback;
                } else {
                  target.style.display = 'none';
                }
              }}
            />
          </div>

          {/* DYNAMIC TRENDY TEXT */}
          <div className="absolute top-14 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
            <h3 className="text-white text-[22px] sm:text-[24px] leading-[1.1] font-black uppercase tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-stroke-sm" style={{ wordBreak: 'break-word' }}>
              {videoData.text}
            </h3>
          </div>

          {/* PREMIUM GLOWING PLAY BUTTON */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity z-[4]">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)] transform transition group-hover:scale-110">
                <svg className="w-8 h-8 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PREMIUM ACTION BAR */}
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
  );
}