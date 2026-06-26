'use client';

import React, { useRef, useState } from 'react';

interface UGCVideoProps {
  videoUrl: string;
}

export default function UGCVideo({ videoUrl }: UGCVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Layer 4 Asset: Classic transparent background meme cutout
  const memeGif = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Bnd2NndXZ4YW15d2g1ZXE2Z3B6cHd5ZW15b2t1ZnB4bm92bTA0diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/jWexZylOmfadO/giphy.gif";
  
  // Layer 1 Asset: Static Background Context 
  const backgroundPoster = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop";

  const handlePlayToggle = () => {
    if (!videoRef.current || !audioRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log("Video playback interrupted:", err));
      audioRef.current.play().catch(err => console.log("Audio playback interrupted:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full flex justify-center my-6">
      {/* CRITICAL FIX: Added 'relative' and 'overflow-hidden' explicitly to this frame.
        This forces all absolute sub-elements (like the meme) to remain trapped inside the boundaries 
        of the card layout, preventing leaks when scrolling the parent chat window.
      */}
      <div 
        onClick={handlePlayToggle}
        className="relative w-[320px] h-[568px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 cursor-pointer select-none group"
      >
        {/* LAYER 1: Base Ambient Background */}
        <img 
          src={backgroundPoster} 
          alt="UGC Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity pointer-events-none"
        />

        {/* LAYER 2: Live Continuous Video Feed */}
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        {/* LAYER 3: Hidden Audio Track */}
        <audio 
          ref={audioRef}
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          loop
        />

        {/* LAYER 4: The Contained Transparent Meme Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <img 
            src={memeGif} 
            alt="Meme Overlay" 
            className="w-[200px] h-auto object-contain transform translate-y-12"
          />
        </div>

        {/* LAYER 5: Dynamic Text Overlay Hook */}
        <div className="absolute bottom-12 left-0 right-0 px-4 text-center pointer-events-none z-30">
          <h3 className="text-white text-xl font-black uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-stroke">
            POV: Automating Video Creation 🚀
          </h3>
        </div>

        {/* INTERACTION COMPONENT: Overlay Play Button Indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/40 z-40">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-lg transform transition group-hover:scale-110">
              <svg className="w-8 h-8 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}