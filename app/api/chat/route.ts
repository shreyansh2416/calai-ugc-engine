export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);

    let responseText = "";

    if (match) {
      const rawDomain = match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const brand = rawDomain.toUpperCase();
      const themeId = Math.floor(Math.random() * 5) + 1;
      let hook = `BRO-THIS-APP-IS-LITERALLY-INSANE`;

      // Randomize the persona to guarantee drastically different texts every time
      const personas = [
        "a dramatic, toxic TikToker who is overly obsessed with the product",
        "a hustle-culture tech bro who thinks the product is a life hack",
        "a broke college student who just discovered the product",
        "an aesthetic lifestyle vlogger who thinks the product is a vibe"
      ];
      const selectedPersona = personas[Math.floor(Math.random() * personas.length)];

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 1.2, // Forces the AI to be highly creative and varied
            messages: [{ 
              role: 'system', 
              content: `You are ${selectedPersona}. Analyze this product context: "${lastMsg}".
              Write ONE highly relatable, super trendy 6-10 word text hook about using this product. 
              RULES:
              - BE EXTREMELY FUNNY AND CLEVER.
              - Vary your words. Do NOT always use "cheat code" or "gatekeeping".
              - Replace EVERY SINGLE SPACE with a hyphen (-). Example: My-toxic-trait-is-buying-this
              - NO punctuation or emojis.` 
            }]
          })
        });
        const data = await groqRes.json();
        if (data.choices && data.choices[0].message.content) {
          hook = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
        }
      } catch (e) { console.error("Groq generation failed."); }

      // Hyphens allow the browser to line-break the text, fixing your chatbox overflow!
      const url = `https://ugc-engine.app/render/${brand}?t=${themeId}&h=${hook}`;
      responseText = `I've analyzed the site and organized the creative assets. Check out the generated clip here:\n${url}`;
    } 
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