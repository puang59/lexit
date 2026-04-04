import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
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
        Write 2 natural, real-life sentences using the word "${word}".

        Sentence requirements:
        1. First sentence → general real-life example
        2. Second sentence → personal-style example (use "I" or "my")

        Rules:
        - keep sentences short and simple
        - use everyday situations (friends, college, work, conversations)
        - avoid formal or textbook tone
        - make it feel like something someone would actually say

        Return JSON only:
        {
          "examples": ["...", "..."]
        }
      `,
    });

    const cleaned = text.replace(/^```json\s*/, "").replace(/```$/, "");
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ examples: parsed.examples }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Bad Request", { status: 400 });
  }
}
