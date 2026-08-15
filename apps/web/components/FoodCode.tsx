import { highlightFood } from "@/lib/shiki";

export default async function FoodCode({ code }: { code: string }) {
  try {
    const html = await highlightFood(code);
    return <div className="shiki" dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e) {
    console.error("[FoodCode] highlighting failed:", e);
    return (
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    );
  }
}
