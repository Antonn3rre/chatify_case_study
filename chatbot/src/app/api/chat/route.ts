// /app/api/chat/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {

    const { messages } = await req.json();

    // console.log("Messages recus cote backend :", messages);

    // Init IA Client with API key
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!});

    // Create a prompt (string) with all messages
    const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    // console.log("Prompt :", prompt);

    // Streaming call
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    // Create stream ReadableStream for the client
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          // console.log("Chunk recu :", chunk);

          const text = chunk.text;
          
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (err) {
    console.error("Error backend /api/chat :", err);
    return NextResponse.json({ error: "Error server" }, { status: 500 });
  }
}