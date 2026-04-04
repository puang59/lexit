import { MODEL } from "@/app/consts";
import { rateLimit } from "@/utility/RatelimitSetup";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

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
        For the word "${word}", generate a short "trigger".

        A trigger is a quick mental cue that helps you know when to use the word.

        Rules:
        - describe a common, everyday situation (not a definition)
        - keep it general enough to apply in many contexts
        - avoid very specific scenarios (no airplane, courtroom, etc.)
        - use simple, natural language
        - keep it under 6–8 words
        - make it feel like something you instantly recognize

        Output only the trigger, nothing else.
      `,
    });

    console.log("TRIGGER: ", text);

    return new Response(JSON.stringify({ trigger: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(err);
    return new Response("Bad Request", { status: 400 });
  }
}
