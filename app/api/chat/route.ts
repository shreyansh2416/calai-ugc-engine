export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    // Extract brand early so we can inject it into the prompt rules
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toUpperCase() : "THE_PRODUCT";

    const systemPrompt = `You are the backend AI for a UGC video engine. You have TWO distinct modes.

    MODE 1: CONVERSATION (If user says "hi", asks a general question, etc.)
    - Answer naturally, conversationally, and accurately.
    - CRITICAL: DO NOT use hyphens instead of spaces. Use normal English.
    - CRITICAL: DO NOT mention that you generate videos UNLESS the user explicitly asks what you do.

    MODE 2: VIDEO DIRECTION (If the user provides a product URL or describes a product to build a video for)
    - Analyze the product. Output a blueprint for a TikTok-style ad.
    - Hook Rule 1: You MUST include the exact word "${brand}" in the hook.
    - Hook Rule 2: Use Gen-Z slang (e.g., POV, cheat code, fr, literal).
    - Hook Rule 3: Replace EVERY space in the hook with a hyphen (-). Example: POV:-USING-${brand}-IS-INSANE
    - BG Search Term: 2-3 words describing a realistic room (e.g., modern-office, messy-bedroom).
    - GIF Search Term: Name of a specific trending celebrity (e.g., Drake, IShowSpeed, Shaq, Kevin-Hart).
    
    OUTPUT EXACTLY THIS JSON SCHEMA:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text (only if intent is chat)",
      "videoBlueprint": {
        "hook": "Hyphenated-Hook-Here-With-Brand-Name",
        "bgSearchTerm": "room-description",
        "gifSearchTerm": "celebrity-name"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.9, // Lowered slightly to ensure instruction adherence
          response_format: { type: "json_object" }, 
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
        const hook = aiLogic.videoBlueprint?.hook || `POV:-USING-${brand}`;
        const bgTerm = aiLogic.videoBlueprint?.bgSearchTerm || "aesthetic-room";
        const gifTerm = aiLogic.videoBlueprint?.gifSearchTerm || "drake-computer";

        const url = `https://ugc-engine.app/render/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Error:", e);
      responseText = "I'm having a quick connection hiccup, but I'm ready to chat or generate videos!";
    }

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