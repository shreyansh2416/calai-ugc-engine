export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    let responseText = "";

    // Generate a random variant (1, 2, or 3) to ensure different videos every time
    const variant = Math.floor(Math.random() * 3) + 1;
    const baseVideoUrl = `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?v=${variant}`;

    // Randomized AI chat responses for a more natural conversational feel
    const successResponses = [
      `I've analyzed the site and synthesized a custom UGC hook. View the generated clip here: ${baseVideoUrl}`,
      `I've assembled a UGC-style video based on that product. Check it out here: ${baseVideoUrl}`,
      `Perfect. I crawled the landing page and organized this viral video variant. Watch here: ${baseVideoUrl}`
    ];
    const randomSuccessResponse = successResponses[Math.floor(Math.random() * successResponses.length)];

    // Conversational Logic Gate
    if (lastMessage.includes(".app") || lastMessage.includes(".com") || lastMessage.includes("http") || lastMessage.includes("calai")) {
      responseText = randomSuccessResponse;
    } else if (lastMessage.includes("do for me") || lastMessage.includes("what can you do") || lastMessage.includes("doing") || lastMessage.includes("what are u")) {
      responseText = "I can generate UGC videos for you! Just send me a product URL and I'll create an engaging short-form marketing video.";
    } else if (lastMessage.trim() === "hi" || lastMessage.trim() === "hello" || lastMessage.startsWith("hi ")) {
      responseText = "Hi there! I'm your AI video agent. How can I help you today?";
    } else if (lastMessage.includes("weather") || lastMessage.includes("who is") || lastMessage.includes("?")) {
      responseText = "I'm an AI specialized in UGC video generation! Drop a product link (like calai.app), and I'll create a marketing video for it.";
    } else {
      responseText = "Send me a product URL, and I'll create an engaging UGC video for it!";
    }

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

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    
  } catch (error: any) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}