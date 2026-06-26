export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    let responseText = "";

    // PRIORITY 1: Specific Brand URLs (Checked first to avoid any substring conflicts)
    if (lastMessage.includes("calai")) {
      responseText = "I've analyzed calai.app and synthesized a custom marketing performance hook. View the generated clip here: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    } else if (lastMessage.includes("youtube")) {
      responseText = "I've parsed the video infrastructure for youtube.com and prepared an entertainment variant. View the clip here: https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
    } else if (lastMessage.includes("nike")) {
      responseText = "I've crawled the target landing page for nike.com and matched it with an optimal e-commerce baseline template. View the clip here: https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    } 
    
    // PRIORITY 2: Generic URLs
    else if (lastMessage.includes(".app") || lastMessage.includes(".com") || lastMessage.includes("http") || lastMessage.includes("www")) {
      responseText = "I've crawled the target landing page and matched it with an optimal baseline template. View the clip here: https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
    } 
    
    // PRIORITY 3: Explicit Conversational Phrases (Checked last to prevent words like 'this' or 'think' from breaking URLs)
    else if (lastMessage.includes("do for me") || lastMessage.includes("what can you do") || lastMessage.includes("doing") || lastMessage.includes("what are u")) {
      responseText = "I can generate UGC videos for you! Just send me a product URL and I'll create an engaging short-form marketing video.";
    } else if (lastMessage.trim() === "hi" || lastMessage.trim() === "hello" || lastMessage.startsWith("hi ")) {
      responseText = "Hi there! I'm your AI video agent. How can I help you today?";
    } else {
      responseText = "Send me a product URL, and I'll create an engaging UGC video for it!";
    }

    // Pure Text Streamer Pipeline
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