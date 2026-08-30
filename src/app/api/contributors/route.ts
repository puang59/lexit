import { Octokit } from "octokit";

export async function GET(request: Request) {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: pulls } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls",
      {
        owner: "puang59",
        repo: "lexit",
        state: "closed",
      },
    );

    const contributors = Array.from(
      new Map(
        pulls
          .filter((p) => p.merged_at && p.user)
          .map((p) => [
            p.user!.login,
            {
              name: p.user!.login,
              avatar: p.user!.avatar_url,
              profile: p.user!.html_url,
            },
          ]),
      ).values(),
    );

    return new Response(JSON.stringify({ contributors }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Bad Request", { status: 400 });
  }
}
