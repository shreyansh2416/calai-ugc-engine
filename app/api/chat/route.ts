export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toUpperCase() : "THE_PRODUCT";

    const systemPrompt = `You are a highly clever, witty viral marketing director. You have TWO distinct modes.

    MODE 1: CONVERSATION (If user says "hi" or asks a general question)
    - Answer naturally, helpfully, and accurately.
    - DO NOT use hyphens instead of spaces. 
    - DO NOT pitch your video generation unless asked.

    MODE 2: VIDEO DIRECTION (If user provides a product URL or description)
    - Analyze the product. Output a blueprint for a highly relatable, clever meme ad.
    - Hook Rule 1: Include the exact word "${brand}" in the hook.
    - Hook Rule 2: Use clever, observational humor (e.g., "My bank account watching me buy...", "Me trying to justify...", "That one friend who..."). 
    - Hook Rule 3: DO NOT use forced internet slang like "rizz", "fr fr", "cooked", or "mewing". Make it genuinely witty and shareable.
    - Hook Rule 4: Replace EVERY space in the hook with a hyphen (-).
    - bgSearchTerm: A 2-3 word description of a photorealistic empty room matching the product vibe (e.g., luxury-kitchen, modern-gym, aesthetic-bedroom). Replace spaces with hyphens.
    - gifSearchTerm: MUST BE A SPECIFIC, FAMOUS CELEBRITY NAME plus an emotion (e.g., drake-laughing, kevin-hart-staring, shaq-surprised, the-rock-confused). ABSOLUTELY NO generic terms or objects. Replace spaces with hyphens.
    
    OUTPUT EXACTLY THIS JSON SCHEMA:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text (only if intent is chat)",
      "videoBlueprint": {
        "hook": "Hyphenated-Witty-Hook-With-Brand-Name",
        "bgSearchTerm": "luxury-closet",
        "gifSearchTerm": "kevin-hart-crying"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.9, 
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
        const hook = aiLogic.videoBlueprint?.hook || `ME-TRYING-TO-JUSTIFY-BUYING-FROM-${brand}`;
        const bgTerm = aiLogic.videoBlueprint?.bgSearchTerm || "photorealistic-modern-room";
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