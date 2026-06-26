export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // 1. Core State Logic: Initialize fallback response parameters
    let responseText = "Send me a product URL, and I'll create an engaging UGC video for it!";
    
    if (lastMessage.includes("hi") || lastMessage.includes("hello")) {
      responseText = "Hi there! I'm your AI video agent. How can I help you today?";
    } else if (lastMessage.includes("do for me") || lastMessage.includes("what can you do")) {
      responseText = "I can generate UGC videos for you! Just send me a product URL and I'll create an engaging short-form marketing video.";
    } 
    // 2. Dynamic Routing Logic: Return distinct video URLs based on the specific user entry
    else if (lastMessage.includes("calai")) {
      responseText = "I've analyzed calai.app and synthesized a custom marketing performance hook. View the generated clip here: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    } else if (lastMessage.includes("youtube")) {
      responseText = "I've parsed the video infrastructure for youtube.com and prepared an entertainment variant. View the clip here: https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
    } else if (lastMessage.includes(".app") || lastMessage.includes(".com") || lastMessage.includes("http")) {
      responseText = "I've crawled the target landing page and matched it with an optimal baseline template. View the clip here: https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    }

    // 3. Clean Text Streamer Pipeline
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + ' '));
          await new Promise(resolve => setTimeout(resolve, 35)); 
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
    
  } catch (error: any) {
    console.error("MOCK ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}