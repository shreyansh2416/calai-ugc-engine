'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoData, setVideoData] = useState({
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    bg: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800",
    gif: "https://media.giphy.com/media/3oEdv5S8Th6b9gsNqM/giphy.gif?ct=s",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    text: "POV: AUTOMATING VIDEO CREATION"
  });

  useEffect(() => {
    let rawUrl = "";
    if (typeof videoState === 'string' && videoState.includes('http')) {
      rawUrl = videoState;
    } else if (videoState && typeof videoState.url === 'string') {
      rawUrl = videoState.url;
    }

    if (rawUrl) {
      try {
        // Decode the magical query parameters injected by the backend AI
        const urlObj = new URL(rawUrl);
        setVideoData({
          url: rawUrl.split('?')[0], // The actual video file
          bg: urlObj.searchParams.get('bg') || videoData.bg,
          gif: urlObj.searchParams.get('gif') || videoData.gif,
          audio: urlObj.searchParams.get('audio') || videoData.audio,
          text: urlObj.searchParams.get('text') || videoData.text,
        });
      } catch (e) {
        console.error("Failed to parse UGC data from URL");
      }
    }
  }, [videoState]);

  const handlePlayToggle = () => {
    if (!videoRef.current || !audioRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log("Video:", err));
      audioRef.current.play().catch(err => console.log("Audio:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full flex justify-center my-6" style={{ isolation: 'isolate' }}>
      <div 
        onClick={handlePlayToggle}
        className="relative w-[280px] h-[496px] sm:w-[320px] sm:h-[568px] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 cursor-pointer select-none group"
      >
        {/* Layer 1: Thematic Environment Background */}
        <img 
          src={videoData.bg} 
          alt="Environment" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        />

        {/* Layer 2: Base Video (dimmed) */}
        <video
          ref={videoRef}
          src={videoData.url}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[1]"
        />

        {/* Layer 3: Dynamic Audio */}
        <audio ref={audioRef} src={videoData.audio} loop />

        {/* Layer 4: Transparent Hyped Celebrity Cutout */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-[2] pb-24">
          <img 
            src={videoData.gif} 
            alt="Celebrity Cutout" 
            className="w-[180px] h-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Layer 5: Dynamic POV Text (Custom to the URL) */}
        <div className="absolute top-12 left-0 right-0 px-6 text-center pointer-events-none z-[3]">
          <h3 className="text-white text-[22px] leading-[1.2] font-black uppercase tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
            {videoData.text}
          </h3>
        </div>

        {/* UI: Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity group-hover:bg-black/50 z-[4]">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transform transition group-hover:scale-110">
              <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}