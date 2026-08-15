import puppeteer, { type Browser } from "puppeteer";

export interface PdfRecipeInput {
  title: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  /** Already highlighted HTML (from Shiki) for the .food code. */
  highlightedFoodHtml: string;
}

export interface PdfOptions {
  /** "single" renders one recipe; "multi" renders many pages back-to-back. */
  mode: "single" | "multi";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function recipeBlock(r: PdfRecipeInput): string {
  const meta: string[] = [];
  if (r.servings) meta.push(`<span>Servings: ${escapeHtml(r.servings)}</span>`);
  if (r.prepTime) meta.push(`<span>Prep: ${escapeHtml(r.prepTime)}</span>`);
  if (r.cookTime) meta.push(`<span>Cook: ${escapeHtml(r.cookTime)}</span>`);
  return `
    <section class="recipe">
      <h1>${escapeHtml(r.title)}</h1>
      ${r.description ? `<p class="desc">${escapeHtml(r.description)}</p>` : ""}
      ${meta.length ? `<div class="meta">${meta.join(" • ")}</div>` : ""}
      <pre class="code"><code>${r.highlightedFoodHtml}</code></pre>
    </section>`;
}

const CSS = `
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "JetBrains Mono", "Fira Code", ui-monospace, Menlo, monospace; color: #e6e6e6; background: #0d1117; margin: 0; }
  .recipe { padding: 0 0 24px 0; page-break-after: always; }
  .recipe:last-child { page-break-after: avoid; }
  h1 { font-size: 22pt; margin: 0 0 6px 0; color: #fff; border-bottom: 2px solid #30363d; padding-bottom: 6px; }
  .desc { color: #8b949e; font-size: 10pt; margin: 0 0 10px 0; font-style: italic; }
  .meta { color: #79c0ff; font-size: 9pt; margin: 0 0 14px 0; }
  .meta span { margin-right: 10px; }
  pre.code { background: #010409; border: 1px solid #30363d; border-radius: 8px; padding: 14px 16px;
             font-size: 9pt; line-height: 1.5; overflow-wrap: normal; white-space: pre; }
  .meta { color: #79c0ff; }
  /* shiki classes pass through with inline styles; ensure dark readable */
  .shiki, .shiki span { background: transparent !important; }
`;

export async function renderRecipesToPdf(recipes: PdfRecipeInput[], _opts?: PdfOptions): Promise<Buffer> {
  if (!recipes.length) throw new Error("No recipes to render");
  const body = recipes.map(recipeBlock).join("\n");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}
