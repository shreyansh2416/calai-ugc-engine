'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function StandaloneVideoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const brandName = (params?.brand as string) || "the app";
  const rawHook = searchParams?.get('h') || `me using ${brandName}`;
  const bgKey = (searchParams?.get('b') || "office") as string;
  const gifKey = (searchParams?.get('g') || "elon") as string;

  const hookText = rawHook.replace(/-/g, ' ');

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

  const [videoData, setVideoData] = useState({
    bg: assetLibrary.backgrounds.office[0],
    gif: assetLibrary.stickers.elon,
    audio: assetLibrary.audio[0]
  });

  useEffect(() => {
    const validBgKey = (bgKey in assetLibrary.backgrounds) ? bgKey : 'office';
    const bgArray = assetLibrary.backgrounds[validBgKey as keyof typeof assetLibrary.backgrounds];
    const selectedBg = bgArray[Math.floor(Math.random() * bgArray.length)];
    
    const validGifKey = (gifKey in assetLibrary.stickers) ? gifKey : 'elon';
    const selectedGif = assetLibrary.stickers[validGifKey as keyof typeof assetLibrary.stickers];
    
    const randomAudio = assetLibrary.audio[Math.floor(Math.random() * assetLibrary.audio.length)];

    setVideoData({ bg: selectedBg, gif: selectedGif, audio: randomAudio });
    setIsLoaded(true);
  }, [bgKey, gifKey]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const handlePlayToggle = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(e => console.log(e));
    setIsPlaying(!isPlaying);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center py-10 font-sans selection:bg-purple-500/30">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap');
        .tiktok-text { font-family: 'Inter', sans-serif !important; text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
      `}} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative p-[2px] rounded-[24px] bg-gradient-to-b from-blue-500/50 to-purple-600/50 shadow-[0_0_50px_rgba(139,92,246,0.2)] z-10">
        <div onClick={handlePlayToggle} className="relative w-[320px] h-[568px] sm:w-[360px] sm:h-[640px] bg-zinc-900 rounded-[22px] overflow-hidden cursor-pointer select-none">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: `url('${videoData.bg}')` }} />
          <audio ref={audioRef} src={videoData.audio} loop muted={isMuted} />
          <div className="absolute top-[12%] left-0 right-0 px-6 text-center pointer-events-none z-[20]">
            <h3 className="tiktok-text text-white text-[22px] sm:text-[24px] leading-[1.2] font-bold tracking-tight" style={{ wordBreak: 'break-word' }}>{hookText}</h3>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none z-[10]">
            <img src={videoData.gif} alt="Celebrity" className="w-[90%] max-h-[60%] object-contain object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]" />
          </div>
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity z-[30]">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <svg className="w-10 h-10 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex w-[320px] sm:w-[360px] justify-between gap-4 mt-8 z-10">
        <button onClick={() => setIsMuted(!isMuted)} className="flex-1 bg-zinc-800/80 hover:bg-zinc-700 text-white/90 text-sm font-medium py-3.5 rounded-xl border border-white/10 transition-colors flex justify-center items-center gap-2 backdrop-blur-md">
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <Link href="/" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex justify-center items-center gap-2 text-center">
          Create Your Own
        </Link>
      </div>
    </div>
  );
}