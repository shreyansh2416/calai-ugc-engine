export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);

    let responseText = "";

    // ==========================================
    // ROUTE A: UGC GENERATION (Context-Aware)
    // ==========================================
    if (match) {
      const rawDomain = match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const brand = rawDomain.toUpperCase();
      
      const themeId = Math.floor(Math.random() * 5) + 1;
      let hook = `LITERAL_CHEAT_CODE_FOR_${brand}`;

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ 
              role: 'system', 
              content: `You are an unhinged Gen-Z marketing director. 
              Analyze this brand/product context from the user: "${lastMsg}".
              Deduce what the product does. Write a 6 to 10 word TikTok text hook specifically about using this product. 
              RULES:
              - DO NOT use the word "I".
              - Use Gen-Z slang (e.g., cheat code, gatekeeping, bro, literal).
              - NO spaces. Replace all spaces with underscores (e.g., Bro_this_app_is_insane).
              - NO punctuation, quotes, or hashtags.
              - Focus on what the product actually does.` 
            }]
          })
        });
        const data = await groqRes.json();
        if (data.choices && data.choices[0].message.content) {
          hook = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
        }
      } catch (e) { console.error("Groq generation failed."); }

      // Underscores allow the browser to break the text cleanly so it doesn't overflow
      const url = `https://ugc-engine.app/render/${brand}?t=${themeId}&h=${hook}`;
      responseText = `I've analyzed the site and organized the creative assets for you. Check out the generated clip here:\n${url}`;
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
              { 
                role: 'system', 
                content: `You are a helpful AI assistant. Answer general questions naturally. DO NOT mention that you generate UGC videos UNLESS explicitly asked.` 
              },
              ...messages.map((m: any) => ({ role: m.role, content: m.content })).slice(-4)
            ]
          })
        });
        const data = await groqRes.json();
        responseText = data.choices[0].message.content;
      } catch (e) {
        responseText = "I'm having a minor connection hiccup, but I'm ready to chat or generate videos!";
      }
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