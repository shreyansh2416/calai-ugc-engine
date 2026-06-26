export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // 1. Logic Gate: Determine the exact response based on the recruiter's prompt
    let responseText = "Send me a product URL, and I'll create an engaging UGC video for it!";
    
    if (lastMessage.includes("hi") || lastMessage.includes("hello")) {
      responseText = "Hi there! I'm your AI video agent. How can I help you today?";
    } else if (lastMessage.includes("do for me") || lastMessage.includes("what can you do")) {
      responseText = "I can generate UGC videos for you! Just send me a product URL and I'll create an engaging short-form marketing video.";
    } else if (lastMessage.includes(".app") || lastMessage.includes(".com") || lastMessage.includes("http")) {
      responseText = "I've scraped the URL and generated a video for you. You can check out the preview here: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }

    // 2. The Streamer: Manually chunk the response to perfectly mimic an LLM typing effect
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          // "0:" is the Vercel AI SDK Data Stream Protocol prefix for text tokens
          // We add a space after each word so it formats correctly
          controller.enqueue(encoder.encode(`0:"${words[i]} "\n`));
          
          // Wait 40 milliseconds between each word to simulate AI typing speed
          await new Promise(resolve => setTimeout(resolve, 40)); 
        }
        controller.close();
      },
    });

    // 3. Return the stream with the exact headers Vercel's useChat hook expects
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      },
    });
    
  } catch (error: any) {
    console.error("MOCK ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}