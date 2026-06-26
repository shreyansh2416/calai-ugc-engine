'use client';

import { useState } from 'react';
import UGCPlayer from '@/components/UGCVideo';

export default function Chat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const safeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setIsLoading(true);

    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages([...newHistory, { role: 'assistant', content: '...' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Server Error");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content = fullText;
            return updated;
          });
        }
      }
    } catch (err: any) {
      setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = `⚠️ System Error: ${err.message}`;
          return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl py-24 mx-auto stretch text-white min-h-screen bg-black">
      <div className="flex-1 overflow-y-auto mb-20 px-4">
        {messages.map((m, idx) => {
          
          // Regex catches standard URLs or our Base64 data URI
          const urlMatch = m.role === 'assistant' ? m.content.match(/(https?:\/\/[^\s)"]+|data:video\/mp4;base64,[^\s)"]+)/) : null;
          
          // Hide the massive base64 string from the user's view
          const displayText = urlMatch && urlMatch[0].startsWith('data:') 
            ? m.content.replace(urlMatch[0], '[Video Generated Successfully]') 
            : m.content;

          return (
            <div key={idx} className="whitespace-pre-wrap my-6 p-4 rounded-xl bg-gray-900 border border-gray-800">
              <strong className="block mb-1 text-sm text-gray-400">
                {m.role === 'user' ? 'User:' : 'AI Assistant:'}
              </strong>
              <span className="text-gray-100">{displayText}</span>
              
              {/* THIS IS THE MISSING COMPONENT: It mounts the player when a URL is found */}
              {urlMatch && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <UGCPlayer videoState={{ 
                    url: urlMatch[0], 
                    videoUrl: urlMatch[0], 
                    src: urlMatch[0],
                    hookText: "CalAI: AI Calorie Tracker"
                  }} />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && messages.length > 0 && (
          <div className="my-6 p-4 rounded-xl bg-gray-900 border border-gray-800">
            <div className="text-sm text-blue-400 animate-pulse flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Autonomously scraping URL and generating video assets...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={safeSubmit} className="fixed bottom-0 left-0 w-full p-4 bg-black border-t border-gray-800">
        <div className="flex max-w-2xl mx-auto gap-2">
          <input
            className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none text-white placeholder-gray-500"
            value={input}
            placeholder="Send a message or share a product link..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-6 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}