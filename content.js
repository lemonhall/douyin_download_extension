const loadingdIconLink = chrome.runtime.getURL("assets/images/loading.png");
const downloadIconLink = chrome.runtime.getURL("assets/images/download.png");
const failedIconLink = chrome.runtime.getURL("assets/images/failed.png");

async function sendMessageAsync(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, function (response) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

const sendDownloadMesssage = (targetDivDom, targetImageDom) => {
  let payload = null;
  if (targetDivDom) {
    const videoId = targetDivDom.getAttribute("data-e2e-vid");
    const videoLink = targetDivDom.querySelector("video")?.firstChild?.src;
    const fileName = targetDivDom.querySelector(
      '[data-e2e="video-desc"]'
    )?.innerText;

    payload = {
      action: "direct_download",
      videoId,
      videoLink,
      fileName: `${fileName}.mp4`,
    };
  } else {
    const videoInfo = document.querySelector('[data-e2e="detail-video-info"]');
    const fileName = videoInfo.innerText.split("\n")[0];
    const videoId = videoInfo.getAttribute("data-e2e-aweme-id");
    const videoLink = document.querySelector("video")?.firstChild?.src;
    payload = {
      action: "direct_download",
      videoId,
      videoLink,
      fileName: `${fileName}.mp4`,
    };
  }

  if (!payload.fileName) {
    return;
  }

  chrome.runtime.sendMessage(payload, function (response) {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    } else {
      if (response.status === "ok") {
        targetImageDom && (targetImageDom.src = downloadIconLink);
      } else {
        targetImageDom && (targetImageDom.src = failedIconLink);
      }
    }
  });
};

const addDownloadDiv = () => {
  const targetDiv = document.querySelector('[data-e2e="feed-active-video"]');

  if (!targetDiv) {
    return;
  }

  if (targetDiv?.querySelector(".addon-download")) {
    return;
  }

  const div = document.createElement("div");
  const image = document.createElement("img");
  image.src = downloadIconLink;
  image.style.width = "45px";
  image.style.height = "45px";
  image.className = "addon-download-image";
  div.className = "addon-download";
  div.appendChild(image);

  div.onclick = async () => {
    image.src = loadingdIconLink;
    sendDownloadMesssage(targetDiv, image);
  };

  targetDiv
    ?.querySelector(".immersive-player-switch-on-hide-interaction-area")
    ?.prepend(div);
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "delegate_download") {
    const targetDiv = document.querySelector('[data-e2e="feed-active-video"]');
    sendDownloadMesssage(targetDiv);
  }
});

setInterval(addDownloadDiv, 1000);
