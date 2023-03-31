const reelUrlInput = document.getElementById("reelUrl");
const downloadButton = document.getElementById("downloadButton");

const updateReelUrl = (reelUrl) => {
  reelUrlInput.value = reelUrl || "No Reel found.";
  downloadButton.disabled = !reelUrl;
};

const blobUrlToDataUrl = async (blobUrl) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "reelUrlUpdate") {
    updateReelUrl(request.reelUrl);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getReelUrl" }, (response) => {
      if (response && response.reelUrl) {
        updateReelUrl(response.reelUrl);
      } else {
        updateReelUrl(null);
      }
    });
  });

  downloadButton.addEventListener("click", async () => {
    const reelUrl = reelUrlInput.value;
    if (reelUrl) {
      const dataUrl = await blobUrlToDataUrl(reelUrl);
      chrome.downloads.download({
        url: dataUrl,
        filename: "instagram_reel.mp4",
        conflictAction: "uniquify",
        saveAs: true,
      });
    }
  });
});
