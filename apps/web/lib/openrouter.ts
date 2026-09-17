import type { AiRecipeJsonEnvelope } from "@cookbook/food-lang";

const ENDPOINT = `${process.env.OPENROUTER_BASE_URL ?? "http://ai.netbird.selfhosted:4000/v1"}/chat/completions`;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletionJson(
  messages: ChatMessage[],
  opts: { model: string; apiKey: string; temperature?: number; maxTokens?: number },
): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.apiKey}`,
      "HTTP-Referer": process.env.APP_ORIGIN ?? "http://localhost:3000",
      "X-Title": "Cookbook",
    },
    body: JSON.stringify({
      model: opts.model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text}`);
  }
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export type { AiRecipeJsonEnvelope };
