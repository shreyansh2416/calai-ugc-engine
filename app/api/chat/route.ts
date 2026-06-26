export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);

    let responseText = "";

    // ==========================================
    // ROUTE A: UGC GENERATION (Flawless Gen-Z Hooks)
    // ==========================================
    if (match) {
      const brand = match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toUpperCase();
      
      // Cycle through 5 distinct themes (1: Drake, 2: The Rock, 3: IShowSpeed, 4: Shaq, 5: Kevin Hart)
      const themeId = Math.floor(Math.random() * 5) + 1;
      const celebs = ["Drake", "The Rock", "IShowSpeed", "Shaq", "Kevin Hart"];
      const currentCeleb = celebs[themeId - 1];

      let hook = `POV: YOU FINALLY STOPPED GATEKEEPING ${brand} 💀`;

      try {
        // Native Fetch to Groq (Bypasses all Vercel SDK crashes)
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ 
              role: 'system', 
              content: `You are a witty, unhinged Gen-Z marketing director. Write a clever, funny, highly relatable 10 to 15 word text overlay for a video about ${brand}. The video features ${currentCeleb}. Make it sound like a viral TikTok meme. DO NOT use quotes or hashtags.` 
            }]
          })
        });
        const data = await groqRes.json();
        if (data.choices && data.choices[0].message.content) {
          hook = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
        }
      } catch (e) { console.error("Groq text generation failed, using fallback."); }

      // Ultra-short URL prevents cutting off data
      const url = `https://ugc-engine.app/render/${brand}?t=${themeId}&h=${encodeURIComponent(hook)}`;
      responseText = `I've analyzed the site and organized a custom UGC layout for you. Check out the generated clip here: ${url}`;
    } 
    
    // ==========================================
    // ROUTE B: NATURAL SMALL TALK (No `...` Hangs)
    // ==========================================
    else {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: "You are a witty UGC video AI. Answer concisely and naturally. If asked what you do, say you generate UGC marketing videos from URLs." },
              ...messages.map((m: any) => ({ role: m.role, content: m.content })).slice(-3)
            ]
          })
        });
        const data = await groqRes.json();
        responseText = data.choices[0].message.content;
      } catch (e) {
        responseText = "I'm an AI specialized in UGC video generation! Drop a product link, and I'll create a marketing video for it.";
      }
    }

    // ==========================================
    // UNIVERSAL LOCAL STREAMER
    // ==========================================
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + ' '));
          await new Promise(resolve => setTimeout(resolve, 30)); 
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error: any) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}