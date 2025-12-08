"use client";

import { useState } from "react";

export default function Chat() {

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    if (!res.body) {
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    let assistantIndex = 0;
    // Setting an empty msg
    setMessages((prev) => {
      const newMessages = [...prev, { role: "assistant", content: "" }];
      assistantIndex = newMessages.length - 1;
      return newMessages;
    });    

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });

      // Progressively add each char
      for (let char of chunkText) {
        assistantMessage += char;

        setMessages((prev) => {
          const msgs = [...prev];
          msgs[assistantIndex].content = assistantMessage;
          return msgs;
        });

        //  Little delay
        await new Promise((resolve) => setTimeout(resolve, 20)); // 20ms par caractère
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex-1 p-4 w-full flex flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto mb-24">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] break-words px-4 py-2 rounded-xl ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && <div className="italic text-gray-500">Gemini is writing…</div>}
      </div>

      <div className="flex-shrink-0 p-4 border-t bg-white">
        <div className="flex gap-2 w-full">
          <textarea
            className="resize-none flex-1 border px-4 py-2 rounded-lg text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );

}
