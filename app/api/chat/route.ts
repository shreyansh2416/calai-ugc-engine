export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase() : "the product";

    const systemPrompt = `You are a highly clever viral marketing director. You have TWO distinct modes.

    MODE 1: CONVERSATION (If user says "hi" or asks a general question)
    - Answer naturally and accurately. DO NOT use hyphens. DO NOT pitch your video generation unless asked.

    MODE 2: VIDEO DIRECTION (If user provides a product URL or description)
    - Analyze the product (e.g., Nike = shoes, CalAI = tracking macros/diet, YouTube = getting distracted).
    - Hook Rule 1: Include the exact brand name "${brand}" in the hook.
    - Hook Rule 2: ROTATE BETWEEN THESE 4 JOKE STYLES for variety:
        1. "me realizing i can use ${brand} to..."
        2. "my fbi agent watching me open ${brand} again..."
        3. "how i sleep knowing ${brand} handles my..."
        4. "when everyone asks how i did it but it was just ${brand}..."
    - Hook Rule 3: NEVER use the phrase "not even mad" or "not even sorry". Make the jokes unique!
    - Hook Rule 4: Replace EVERY space in the hook with a hyphen (-).
    - gifSearchTerm: CHOOSE EXACTLY ONE FROM THIS LIST ONLY: "drake", "the-rock", "shaq", "kevin-hart", "spongebob". (Do not add actions or extra words).
    - bgSearchTerm: A highly specific room that logically matches the product (e.g., "luxury-gym-weights", "modern-kitchen-island", "messy-gaming-bedroom"). Replace spaces with hyphens.
    
    OUTPUT EXACTLY THIS JSON SCHEMA:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text (only if intent is chat)",
      "videoBlueprint": {
        "hook": "hyphenated-tiktok-caption-with-brand",
        "bgSearchTerm": "luxury-kitchen",
        "gifSearchTerm": "the-rock"
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
        const hook = aiLogic.videoBlueprint?.hook || `me-using-${brand}`;
        const bgTerm = aiLogic.videoBlueprint?.bgSearchTerm || "modern-living-room";
        const gifTerm = aiLogic.videoBlueprint?.gifSearchTerm || "the-rock";

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