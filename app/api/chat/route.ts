export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase() : "the product";

    const randomSeed = Math.floor(Math.random() * 100000);

    const systemPrompt = `You are an elite, highly clever UGC viral marketing director. You have TWO distinct modes.

    MODE 1: CONVERSATION (If user says "hi" or asks a general question)
    - Answer naturally and accurately. DO NOT use hyphens. DO NOT pitch your video generation unless asked.

    MODE 2: VIDEO DIRECTION (If user provides a product URL or description)
    - Analyze the product's actual value and utility.
    - Hook Rule 1: Include the exact brand name "${brand}" in the hook.
    - Hook Rule 2: POSITIVE, "CHEAT CODE" HUMOR. Write a clever, trendy TikTok caption about succeeding, feeling like a genius, or having a massive advantage because of the product. 
    - Hook Rule 3: DO NOT make the user sound foolish, lazy, or stupid. (GOOD Examples: "me unlocking 100% of my brain power using ${brand}", "when they ask how i did it so fast but my secret is just ${brand}", "my boss wondering how i finished a week of work in 2 hours using ${brand}").
    - Hook Rule 4: Replace EVERY space in the hook with a hyphen (-).
    - gifCategory: CHOOSE EXACTLY ONE: "drake", "rock", "shaq", "hart", "spongebob", "speed", "cena", "gordon", "elon", "ronaldo". (Use Random Seed ${randomSeed} to shuffle your choice).
    - bgCategory: CHOOSE EXACTLY ONE: "gym", "kitchen", "bedroom", "office", "store". 
    - COHESION RULE: The bgCategory MUST logically match the gifCategory. (e.g., gordon MUST be in the kitchen, ronaldo/rock/cena MUST be in the gym, elon MUST be in the office).
    
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
          temperature: 1.1, // Forces creative, non-repetitive text
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
        const hook = aiLogic.videoBlueprint?.hook || `me-unlocking-100-percent-of-my-brain-using-${brand}`;
        const bgTerm = aiLogic.videoBlueprint?.bgCategory || "office";
        const gifTerm = aiLogic.videoBlueprint?.gifCategory || "elon";

        const url = `https://ugc-engine.app/render/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}&t=${Date.now()}`;
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