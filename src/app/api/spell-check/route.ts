import { rateLimit } from "@/utility/RatelimitSetup";
import { checkWord } from "@/lib/spellcheck";

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

    // checking the seplling of the word
    const result = checkWord(word);

    if (!result.isCorrect) {
      return Response.json({
        status: "correction_needed",
        input: word,
        suggestions: result.suggestions.slice(0, 3),
      });
    }

    return Response.json({
      status: "correct",
      input: word,
    });
  } catch (error) {
    return new Response("Bad Request", { status: 400 });
  }
}
