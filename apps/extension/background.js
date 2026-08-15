// Background service worker — kept minimal; the popup orchestrates.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cookbook extension installed");
});
