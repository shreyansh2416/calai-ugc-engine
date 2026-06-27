export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    // Exact System Prompt derived from the Recruiter's Rubric
    const systemPrompt = `You are the AI director for a viral UGC (User Generated Content) video engine. Your job is twofold:

    1. CONVERSATION: Handle greetings ("hi") and capabilities questions ("what can you do?") naturally, warmly, and concisely. Remind users you turn product URLs into hilarious short-form ads.
    
    2. VIDEO DIRECTION: When a user provides a product name or URL, switch to director mode. Analyze its core utility. You must output the blueprint for a meme-style video. 
    
    CRITICAL RULES:
    - Hook: Use hooks like "POV:", "Me when", "Nobody:". Prioritize high comedy and internet sarcasm. Replace EVERY space with a hyphen (-).
    - BG Search Term: A 2-4 word description of a realistic room matching the vibe. Replace spaces with hyphens.
    - GIF Search Term: Name of a trending celebrity or meme character expressing the emotion. Replace spaces with hyphens.
    
    OUTPUT EXACTLY THIS JSON SCHEMA AND NOTHING ELSE:
    {
      "intent": "chat" or "video",
      "chatResponse": "Your conversational reply (only if intent is chat)",
      "videoBlueprint": {
        "hook": "POV:-WHEN-YOU-USE-...",
        "bgSearchTerm": "messy-bedroom",
        "gifSearchTerm": "drake-computer"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 1.1,
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
        const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
        const match = lastMsg.match(urlRegex);
        const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toUpperCase() : "THE_PRODUCT";
        
        const hook = aiLogic.videoBlueprint.hook || `POV:-USING-${brand}`;
        const bgTerm = aiLogic.videoBlueprint.bgSearchTerm || "aesthetic-room";
        const gifTerm = aiLogic.videoBlueprint.gifSearchTerm || "drake-computer";

        // Hyphens ensure the URL can wrap to the next line in your chatbox!
        const url = `https://ugc-engine.app/render/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Error:", e);
      responseText = "I'm having a quick connection hiccup, but I'm ready to generate videos!";
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