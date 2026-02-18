import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "No API key found in .env.local" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert student assistant at an engineering college. 
Write an honest, helpful, and catchy marketplace description for: "${title}". 
Mention that it's perfect for a student's budget. Keep it under 3 sentences. No hashtags.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ description: text.trim() });
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);
    // Properly extract the error message for TypeScript
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Google Error: ${errorMessage}` },
      { status: 500 },
    );
  }
}
