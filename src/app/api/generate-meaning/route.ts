import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { rateLimit } from "@/utility/RatelimitSetup";
import { MODEL } from "@/app/consts";

export async function POST(request: Request) {
  try {
    const { word } = await request.json();

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { success, reset } = await rateLimit.limit(ip);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          reset,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    const { text } = await generateText({
      model: groq(MODEL),
      prompt: `
        Give a very simple meaning for the word "${word}".

        Rules:
        - use plain everyday English
        - maximum 10–12 words
        - no formal or dictionary-style language
        - focus on clarity, not completeness

        Output only the meaning.
      `,
    });

    return new Response(JSON.stringify({ definition: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Bad Request", { status: 400 });
  }
}
