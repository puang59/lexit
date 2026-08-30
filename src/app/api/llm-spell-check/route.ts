import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { rateLimit } from "@/utility/RatelimitSetup";
import { MODEL } from "@/app/consts";
import { z } from "zod";

const spellingSchema = z.object({
  isValid: z.boolean(),
  correctedWord: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

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

    const { output } = await generateText({
      model: groq(MODEL),
      output: Output.object({
        schema: spellingSchema,
      }),
      prompt: `
        Determine whether the following input is a valid English word or
        commonly recognized English term.

        If it is valid:
        - isValid: true
        - correctedWord: null
        - confidence: close to 1

        If it appears to be a misspelling:
        - isValid: false
        - correctedWord: the most likely intended word
        - confidence: your confidence in the correction

        If you cannot confidently determine a correction:
        - isValid: false
        - correctedWord: null
        - confidence: low

        Input: "${word}"
      `,
    });

    return Response.json(output);
  } catch (err) {
    console.error("Error in spellcheck route:", err);
    return new Response("Failed to check spelling", { status: 500 });
  }
}
