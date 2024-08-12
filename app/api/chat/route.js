import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const data = await req.text(); // Get the prompt

  const result = await model.generateContentStream(
    [...data]
  );

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const encoder = new TextEncoder()
        for await (const chunk of result.stream){
          const content = chunk.text();
          if (content){
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch(err) {
        console.log("scream")
      } finally {
        controller.close()
      }
    }
  })

  return new NextResponse(stream)
}