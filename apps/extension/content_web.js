// Runs on the Cookbook web app origin. When the user opens /ext/import
// (triggered by the popup), this script reads the pending recipe text from
// chrome.storage and POSTs it to the same-origin /api/convert — the session
// cookie is sent automatically because the request is same-origin.

const APP_ORIGIN = "http://localhost:3000";

(async () => {
  if (!location.pathname.startsWith("/ext/import")) return;

  const root = document.getElementById("ext-import-root");
  function show(html) {
    if (root) root.innerHTML = html;
    document.title = "importing…";
  }

  const { pendingImport } = await chrome.storage.local.get("pendingImport");
  if (!pendingImport) {
    show('<p class="muted">Nothing to import. Use the Cookbook popup on a recipe page.</p>');
    return;
  }
  await chrome.storage.local.remove("pendingImport");

  show('<p>compiling → <code>.food</code> …</p>');

  try {
    const res = await fetch(`${APP_ORIGIN}/api/convert`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: pendingImport.text, url: pendingImport.sourceUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        show('<p class="bad">Not logged in.</p><p><a href="' + APP_ORIGIN + '/login">Open login →</a></p>');
      } else {
        show('<p class="bad">Error: ' + (data.error ?? "conversion failed") + "</p>");
      }
      return;
    }
    await chrome.storage.local.set({ lastSavedRecipeId: data.id, savedAt: Date.now() });
    location.href = `${APP_ORIGIN}/recipes/${data.id}`;
  } catch (e) {
    show('<p class="bad">Error: ' + (e?.message ?? "unknown") + "</p>");
  }
})();
