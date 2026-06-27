export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);

    let responseText = "";

    // ==========================================
    // ROUTE A: SEMANTIC UGC GENERATION
    // ==========================================
    if (match) {
      const rawDomain = match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const brand = rawDomain.toUpperCase();
      
      let themeId = 4;
      let hook = `LITERAL-CHEAT-CODE-FOR-${brand}-FR`;

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 1.1,
            response_format: { type: "json_object" },
            messages: [{ 
              role: 'system', 
              content: `You are a viral Gen-Z TikTok marketing director. Analyze this product context: "${lastMsg}".
              
              TASK 1: Categorize the product to choose a theme ID:
              1 = Food/Diet/Eating
              2 = Studying/Working/Productivity
              3 = Cooking/Home/Lifestyle
              4 = Gaming/Tech/Software
              5 = Fitness/Sports/Gym
              
              TASK 2: Write ONE highly relatable, incredibly clever 6-10 word text hook for a video ad.
              CRITICAL RULES:
              - YOU MUST INCLUDE THE EXACT BRAND NAME "${brand}" IN THE TEXT. THIS IS MANDATORY.
              - DO NOT use the word "I" or start with "I".
              - Use Gen-Z slang (e.g., W rizz, literally, fr, gatekeeping).
              - Replace EVERY SINGLE SPACE with a hyphen (-). Example: This-feature-on-Nike-is-literally-insane
              
              Output strictly as JSON: {"themeId": number, "hook": "string"}` 
            }]
          })
        });
        const data = await groqRes.json();
        if (data.choices && data.choices[0].message.content) {
          const parsed = JSON.parse(data.choices[0].message.content);
          themeId = parsed.themeId || Math.floor(Math.random() * 5) + 1;
          hook = parsed.hook || hook;
        }
      } catch (e) { console.error("Groq JSON generation failed."); }

      // Expanded Audio Pool Randomizer (1 through 10) to prevent repeating music
      const audioId = Math.floor(Math.random() * 10) + 1;
      
      const url = `https://ugc-engine.app/render/${brand}?t=${themeId}&a=${audioId}&h=${hook}`;
      responseText = `I've analyzed the site and organized the creative assets based on the product. Check out the generated clip here:\n${url}`;
    } 
    
    // ==========================================
    // ROUTE B: NATURAL CHAT
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
                content: `You are a helpful AI assistant. Answer general questions naturally. DO NOT talk about videos UNLESS explicitly asked.` 
              },
              ...messages.map((m: any) => ({ role: m.role, content: m.content })).slice(-4)
            ]
          })
        });
        const data = await groqRes.json();
        responseText = data.choices[0].message.content;
      } catch (e) {
        responseText = "I'm having a connection hiccup, but I'm ready to chat!";
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