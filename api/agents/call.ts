
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { agentId, agentName, prompt, data } =
      await request.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { success: false, error: "Agent prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: "GEMINI_API_KEY is missing" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents:
        "DATA INPUT:\n" +
        JSON.stringify(data ?? null) +
        "\n\nReturn valid JSON only.",
      config: {
        systemInstruction: prompt,
        responseMimeType: "application/json"
      }
    });

    const raw = response.text?.trim();
    if (!raw) throw new Error("Gemini returned an empty response");

    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    const result = JSON.parse(cleaned);

    return Response.json({
      success: true,
      agentId,
      agentName,
      durationMs: Date.now() - startTime,
      result
    });
  } catch (error) {
    console.error("Agent execution error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Agent execution failed"
      },
      { status: 500 }
    );
  }
}
