export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase() : "the product";

    const randomSeed = Math.floor(Math.random() * 100000);

    const systemPrompt = `You are a highly creative UGC marketing director.

    MODE 1: CONVERSATION
    - Answer naturally, conversationally, and accurately. DO NOT pitch video generation unless asked.

    MODE 2: VIDEO DIRECTION (If user provides a product URL)
    - Analyze the product's actual, real-world utility.
    - Hook Rule 1: Include the exact brand name "${brand}" in the hook.
    - Hook Rule 2: AUTHENTIC, RELATABLE WINS. Write about a realistic, genuine positive outcome from using the product. Focus on small daily victories, saving time, solving a real problem, or feeling good.
    - Hook Rule 3: STRICTLY NO ABSURD LIES OR HYPERBOLE. Do NOT say you became a billionaire, bought a yacht, or cured a disease. Ground the text in everyday reality. (GOOD EXAMPLES: "finally hitting my protein goals without stressing thanks to ${brand}", "my morning runs feel amazing now that i switched to ${brand}").
    - Hook Rule 4: NO CRINGE SLANG. (no "rizz", "fr fr", "cooked"). Keep it universally relatable.
    - Hook Rule 5: Replace EVERY space in your final hook string with a single hyphen (-). Keep it entirely lowercase.
    - gifCategory: CHOOSE EXACTLY ONE: "drake", "rock", "shaq", "hart", "spongebob", "speed", "cena", "gordon", "elon", "ronaldo". (Use Random Seed ${randomSeed} to heavily vary your selection).
    - bgCategory: CHOOSE EXACTLY ONE: "gym", "kitchen", "bedroom", "office", "store". Match it logically to the product context.
    
    OUTPUT STRUCTURE: You MUST output ONLY a valid JSON object matching this schema:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text",
      "videoBlueprint": {
        "hook": "hyphenated-witty-lowercase-caption",
        "bgCategory": "office",
        "gifCategory": "elon"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 1.1, // Adjusted for creative realism
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
        const hook = aiLogic.videoBlueprint?.hook || `having-the-best-day-ever-thanks-to-${brand}`;
        const bgTerm = aiLogic.videoBlueprint?.bgCategory || "office";
        const gifTerm = aiLogic.videoBlueprint?.gifCategory || "elon";

        const url = `${protocol}://${host}/video/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}&t=${Date.now()}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Error:", e);
      responseText = "I encountered a minor connection hiccup, but my creative engines are ready!";
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + (i === words.length - 1 ? '' : ' ')));
          await new Promise(resolve => setTimeout(resolve, 20)); 
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error: any) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}