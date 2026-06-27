export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    // The exact system prompt based on the recruiter's evaluation criteria
    const systemPrompt = `You are the AI director for a viral UGC (User Generated Content) video engine. Your job is twofold:

    1. CONVERSATION: Handle greetings ("hi") and capabilities questions ("what can you do?") naturally, warmly, and concisely. Remind users you turn product URLs into hilarious short-form ads.
    
    2. VIDEO DIRECTION: When a user provides a product name or URL, analyze its core utility. You must output the blueprint for a 5-10 second meme-style video. 
    
    Your video text overlays must follow modern TikTok/Reels meme formats:
    - Use hooks like "POV:", "Me when", "Nobody:", "My doctor:".
    - Prioritize high comedy, relatability, and internet sarcasm over corporate advertising.
    - If they provide a URL, tailor the joke to what the product actually does.
    - CRITICAL: Replace EVERY space in your hook with a hyphen (-). Example: POV:-Me-when-I-use-this-app
    
    CRITICAL INSTRUCTION: You MUST output ONLY valid JSON using this exact schema:
    {
      "intent": "chat" or "video",
      "chatResponse": "Your conversational reply (only if intent is chat, otherwise empty string)",
      "videoBlueprint": {
        "themeId": 1 to 5 (1=Food/Diet, 2=Productivity/Work, 3=Home/Life, 4=Tech/Gaming, 5=Fitness),
        "hook": "Trendy-hyphenated-text-hook-here"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 1.0,
          response_format: { type: "json_object" }, // Forces strict JSON output
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content })).slice(-4)
          ]
        })
      });

      const data = await groqRes.json();
      const aiLogic = JSON.parse(data.choices[0].message.content);

      if (aiLogic.intent === "chat") {
        responseText = aiLogic.chatResponse;
      } else {
        // AI decided it's a video. Extract the domain name from the user's message.
        const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
        const match = lastMsg.match(urlRegex);
        const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toUpperCase() : "THIS_PRODUCT";
        
        const themeId = aiLogic.videoBlueprint.themeId || Math.floor(Math.random() * 5) + 1;
        const hook = aiLogic.videoBlueprint.hook || `POV:-WHEN-YOU-USE-${brand}`;
        const audioId = Math.floor(Math.random() * 10) + 1; // Random audio 1-10

        const url = `https://ugc-engine.app/render/${brand}?t=${themeId}&a=${audioId}&h=${hook}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Error:", e);
      responseText = "I'm having a quick connection hiccup, but I'm ready to generate videos!";
    }

    // Smooth Typing Streamer
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + (i === words.length - 1 ? '' : ' ')));
          await new Promise(resolve => setTimeout(resolve, 25)); 
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error: any) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}