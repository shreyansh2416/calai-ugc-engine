export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);

    let responseText = "";

    // ==========================================
    // ROUTE A: UGC GENERATION (Flawless Hooks)
    // ==========================================
    if (match) {
      const rawDomain = match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const brand = rawDomain.toUpperCase();
      
      const themeId = Math.floor(Math.random() * 5) + 1;
      let hook = `POV YOU FINALLY STOPPED GATEKEEPING ${brand}`;

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ 
              role: 'system', 
              content: `You are a witty, unhinged Gen-Z marketing director. Write a clever, highly relatable 8 to 12 word TikTok text hook about this product: ${brand}. 
              CRITICAL RULES:
              - DO NOT mention any celebrities.
              - DO NOT output wrong facts.
              - DO NOT use quotes, emojis, or punctuation.
              - Keep it strictly about the user's POV of using the product.` 
            }]
          })
        });
        const data = await groqRes.json();
        if (data.choices && data.choices[0].message.content) {
          hook = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
        }
      } catch (e) { console.error("Groq text generation failed, using fallback."); }

      const url = `https://ugc-engine.app/render/${brand}?t=${themeId}&h=${encodeURIComponent(hook)}`;
      
      // FIX: Markdown link formatting completely stops text box overflow
      responseText = `I've analyzed the site and organized a custom layout for you. \n\n👉 [Click here to view your generated UGC clip](${url})`;
    } 
    
    // ==========================================
    // ROUTE B: NATURAL SMALL TALK
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
    // LOCAL STREAMER
    // ==========================================
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