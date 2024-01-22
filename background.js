let linkList = [];

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({ url, filename }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve();
      }
    });
  });
}

function sanitizeFilename(filename) {
  // Characters disallowed in Windows and Unix/Linux
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;

  // Replace invalid characters with an empty space
  let sanitized = filename.replace(invalidChars, "");

  // Further handling for Windows filenames
  // Trim spaces and periods at the end of the filename
  sanitized = sanitized.replace(/[\s.]+$/, "");

  return sanitized;
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const link = details.url;
    if (link.includes("zjcdn") && linkList.at(-1) !== link) {
      if (linkList.length > 50) {
        linkList.shift();
      }
      linkList.push(link);
    }
  },
  { urls: ["https://*.zjcdn.com/*"] }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "direct_download") {
    const videoLink =
      request.videoLink ??
      linkList.find((link) => link.includes(request.videoId));

    const fileName = sanitizeFilename(request.fileName);

    downloadFile(videoLink, fileName)
      .then(() => {
        sendResponse({ status: "ok" });
      })
      .catch((error) => {
        console.log("download error", error);
        sendResponse({ status: "failed" });
      });

    // Return true to keep the message channel open
    return true;
  } else if (request.action === "delegate_download") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "delegate_download" });
    });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url && tab.url.includes("douyin.com")) {
    chrome.action.setPopup({ tabId: tabId, popup: "popup.html" });
  } else {
    chrome.action.setPopup({ tabId: tabId, popup: "" }); // No popup for other sites
  }
});
