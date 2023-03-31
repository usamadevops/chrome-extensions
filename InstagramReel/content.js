const getReelUrl = () => {
  const videoElement = document.querySelector("video");
  if (videoElement) {
    return videoElement.src;
  }
  return null;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getReelUrl") {
    const reelUrl = getReelUrl();
    sendResponse({ reelUrl });
  }
});

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.target.matches(".PdwC2") || mutation.target.matches("._5wCQW")) {
      chrome.runtime.sendMessage({ action: "reelUrlUpdate", reelUrl: getReelUrl() });
      break;
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
