import React, { useEffect, useRef } from 'react';

export default function UGCPlayer({ videoState }: { videoState: any }) {
  const finalVideoUrl = videoState?.videoUrl || videoState?.url || videoState?.src;
  const finalHookText = videoState?.hookText || "CalAI: AI Calorie Tracker";
  
  // THE FIX: We create a direct reference to the video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // THE FIX: The moment the component loads, we force the video to play
  useEffect(() => {
    if (videoRef.current && finalVideoUrl) {
      videoRef.current.play().catch(err => {
        console.log("Browser strictly blocked autoplay. User must click play.", err);
      });
    }
  }, [finalVideoUrl]);

  if (!finalVideoUrl) return null;

  return (
    <div className="w-[300px] h-[533px] relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl mt-4 bg-black">
      
      <video 
        ref={videoRef}
        key={finalVideoUrl}
        src={finalVideoUrl}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
        loop
        playsInline
        controls 
        muted 
      />
      
      <div className="absolute top-1/4 left-0 w-full flex justify-center pointer-events-none">
        <h1 className="text-white text-4xl font-black text-center px-6 drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-in zoom-in duration-700">
          {finalHookText}
        </h1>
      </div>
      
    </div>
  );
}