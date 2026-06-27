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
    bg: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800",
    gif: "/api/proxy?url=" + encodeURIComponent("https://media.tenor.com/L-qQf_iKkQ4AAAAi/ishowspeed-speed.gif"),
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "POV: AUTOMATING VIDEO CREATION"
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

  // Helper function to force the GIF through the backend proxy you built
  const withProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`;

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) rawUrl = videoState;
    else if (videoState && typeof videoState.url === 'string') rawUrl = videoState.url;

    if (rawUrl && rawUrl.includes('/render/')) {
      const urlObj = new URL(rawUrl);
      const brandName = rawUrl.split('/').pop()?.split('?')[0] || "THE APP";
      
      const themeId = parseInt(urlObj.searchParams.get('t') || "4");
      const audioId = parseInt(urlObj.searchParams.get('a') || "1");
      
      const rawHook = urlObj.searchParams.get('h') || `POV:-USING-${brandName}`;
      const hookText = rawHook.replace(/-/g, ' ');

      // Every single GIF is now routed through your API proxy
      const themes: Record<number, any> = {
        1: { 
          bg: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: withProxy("https://media.tenor.com/qLhVn0B_n_kAAAAi/shaq-shaquille-o-neal.gif") 
        },
        2: { 
          bg: "https://images.pexels.com/photos/289814/pexels-photo-289814.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: withProxy("https://media.tenor.com/mOPEt9lB5aUAAAAi/drake-computer.gif")
        },
        3: { 
          bg: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: withProxy("https://media.tenor.com/3Gv2x_BovI4AAAAi/math-calculate.gif")
        },
        4: { 
          bg: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: withProxy("https://media.tenor.com/L-qQf_iKkQ4AAAAi/ishowspeed-speed.gif")
        },
        5: { 
          bg: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
          gif: withProxy("https://media.tenor.com/1OcbvYyS13UAAAAi/the-rock-sus.gif")
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
      <div className="w-full flex flex-col items-center my-8" style={{ isolation: 'isolate' }}>
        <div className="relative p-[2px] rounded-[20px] bg-gradient-to-b from-blue-500/50 to-purple-600/50 shadow-[0_0_30px_rgba(139,92,246,0.2)] group hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-500">
          
          <div 
            onClick={handlePlayToggle}
            className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-[#111] rounded-[18px] overflow-hidden cursor-pointer select-none"
          >
            <img 
              src={videoData.bg} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity filter contrast-125 pointer-events-none" 
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

            {/* THE RETURN OF THE GIF LAYER */}
            {/* Z-index increased, positioned dead center */}
            <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-[10]">
              <img 
                src={videoData.gif} 
                alt="Celebrity Overlay" 
                className="w-[220px] h-auto object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)]" 
                // Hail-Mary fallback: If the proxy somehow fails, it attempts to load the URL directly
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('/api/proxy')) {
                    target.src = decodeURIComponent(videoData.gif.split('?url=')[1]);
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </div>

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