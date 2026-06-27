export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase() : "the product";

    const randomSeed = Math.floor(Math.random() * 100000);

    const systemPrompt = `You are an elite, highly creative UGC marketing director. You have TWO distinct modes.

    MODE 1: CONVERSATION (If user says "hi" or asks a general question)
    - Answer naturally and warmly. DO NOT use hyphens. Explain you generate UGC videos if asked.

    MODE 2: VIDEO DIRECTION (If user provides a product URL or description)
    - Analyze the product's value. 
    - Hook Rule 1: Include the brand name "${brand}" in the hook.
    - Hook Rule 2: BE ENDLESSLY CREATIVE. Write a completely unique, witty, positive TikTok caption every single time. DO NOT use templates. Even if asked about the same brand 5 times, invent 5 completely different scenarios (e.g., impressing your boss, feeling like a genius, unlocking a cheat code, solving a massive problem).
    - Hook Rule 3: NEVER use forced slang ("rizz", "fr fr", "cooked"). Keep it universally clever.
    - Hook Rule 4: Replace EVERY space in the hook with a hyphen (-).
    - gifCategory: CHOOSE EXACTLY ONE: "drake", "rock", "shaq", "hart", "spongebob", "speed", "cena", "gordon", "elon", "ronaldo". (Use Random Seed ${randomSeed} to pick randomly).
    - bgCategory: CHOOSE EXACTLY ONE: "gym", "kitchen", "bedroom", "office", "store". Match the environment to the celebrity logically.
    
    OUTPUT EXACTLY THIS JSON SCHEMA:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text (only if intent is chat)",
      "videoBlueprint": {
        "hook": "hyphenated-witty-success-caption",
        "bgCategory": "office",
        "gifCategory": "elon"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 1.2, // High temperature forces the AI to be highly varied and creative
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
        const hook = aiLogic.videoBlueprint?.hook || `me-unlocking-pure-genius-mode-with-${brand}`;
        const bgTerm = aiLogic.videoBlueprint?.bgCategory || "office";
        const gifTerm = aiLogic.videoBlueprint?.gifCategory || "elon";

        // Outputs a clean, professional-looking production URL for the chat
        const url = `https://ugc-video-app.vercel.app/video/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}&t=${Date.now()}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Error:", e);
      responseText = "I'm having a connection hiccup, but I'm ready to chat or generate videos!";
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