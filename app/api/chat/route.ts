export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // 1. Logic Gate
    let responseText = "Send me a product URL, and I'll create an engaging UGC video for it!";
    
    if (lastMessage.includes("hi") || lastMessage.includes("hello")) {
      responseText = "Hi there! I'm your AI video agent. How can I help you today?";
    } else if (lastMessage.includes("do for me") || lastMessage.includes("what can you do")) {
      responseText = "I can generate UGC videos for you! Just send me a product URL and I'll create an engaging short-form marketing video.";
    } else if (lastMessage.includes(".app") || lastMessage.includes(".com") || lastMessage.includes("http")) {
      responseText = "I've scraped the URL and generated a video for you. You can check out the preview here: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }

    // 2. The Streamer (Now sending pure text)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          // FIX: Just sending the raw text with a space, no '0:"' wrapper
          controller.enqueue(encoder.encode(words[i] + ' '));
          await new Promise(resolve => setTimeout(resolve, 40)); 
        }
        controller.close();
      },
    });

    // 3. Return a standard text response so older SDKs parse it cleanly
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
    
  } catch (error: any) {
    console.error("MOCK ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}