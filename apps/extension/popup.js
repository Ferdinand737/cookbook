const APP_ORIGIN = "http://localhost:3000";
const IMPORT_PATH = "/ext/import";

const saveBtn = document.getElementById("save");
const openBtn = document.getElementById("open");
const statusEl = document.getElementById("status");
const pageEl = document.getElementById("page");

function setStatus(text, cls) {
  statusEl.textContent = text ?? "";
  statusEl.className = "status " + (cls ?? "");
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function extractFromTab(tabId) {
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const title = document.title || "";
      const main =
        document.querySelector("article") ||
        document.querySelector("main") ||
        document.querySelector('[role="main"]') ||
        document.body;
      const text = (main?.innerText || document.body?.innerText || "").trim();
      return { title, text, url: location.href };
    },
  });
  return res?.result ?? null;
}

async function refreshOpenButton() {
  const { lastSavedRecipeId, savedAt } = await chrome.storage.local.get([
    "lastSavedRecipeId",
    "savedAt",
  ]);
  if (lastSavedRecipeId && savedAt && Date.now() - savedAt < 1000 * 60 * 10) {
    openBtn.dataset.id = lastSavedRecipeId;
    openBtn.disabled = false;
  } else {
    openBtn.disabled = true;
  }
}

saveBtn.addEventListener("click", async () => {
  saveBtn.disabled = true;
  setStatus("reading page…");
  try {
    const tab = await getActiveTab();
    if (!tab?.id) throw new Error("no active tab");
    if (tab.url && tab.url.startsWith(APP_ORIGIN)) {
      setStatus("open a recipe page, not the app", "bad");
      saveBtn.disabled = false;
      return;
    }
    pageEl.textContent = tab?.title || tab?.url || "";
    const extracted = await extractFromTab(tab.id);
    if (!extracted?.text) throw new Error("could not read page text");

    await chrome.storage.local.set({
      pendingImport: { text: extracted.text, sourceUrl: extracted.url },
    });

    setStatus("opening cookbook…");
    await chrome.tabs.create({ url: APP_ORIGIN + IMPORT_PATH });
    setStatus("converting in app tab… see you there", "ok");
    // poll for the saved recipe so the "open in app" button lights up
    const poll = setInterval(refreshOpenButton, 1500);
    setTimeout(() => clearInterval(poll), 30000);
  } catch (e) {
    setStatus("error: " + (e?.message ?? "unknown"), "bad");
    saveBtn.disabled = false;
  }
});

openBtn.addEventListener("click", async () => {
  const id = openBtn.dataset.id;
  if (!id) return;
  await chrome.tabs.create({ url: `${APP_ORIGIN}/recipes/${id}` });
  window.close();
});

(async function init() {
  const tab = await getActiveTab();
  pageEl.textContent = tab?.title || tab?.url || "(no active tab)";
  await refreshOpenButton();
  saveBtn.disabled = false;
})();
