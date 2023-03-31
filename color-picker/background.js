let lastSelectedColor = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "storeColor") {
    lastSelectedColor = request.color;
  } else if (request.action === "getLastSelectedColor") {
    sendResponse(lastSelectedColor);
  }
});
