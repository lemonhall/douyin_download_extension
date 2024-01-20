const linkList = [];
const loadingdIconLink =
  "https://imagedelivery.net/5MYSbk45M80qAwecrlKzdQ/d3a4e948-8c81-4c46-01ac-1330dffe8b00/preview";
const downloadIconLink = "https://cdn-icons-png.flaticon.com/512/0/532.png";
// const loadingdIconLink = chrome.runtime.getURL("assets/images/loading.png");
// const downloadIconLink = chrome.runtime.getURL("assets/images/download.png");

const downloadVideo = () => {
  const targetDiv = document.querySelector('[data-e2e="feed-active-video"]');

  async function fetchVideoAsBlob(videoUrl) {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  }

  function downloadVideo(blobUrl, fileName) {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl); // Free up memory
  }

  async function downloadVideoFromUrl(videoUrl) {
    try {
      targetDiv.querySelector(".addon-download-image").src = loadingdIconLink;
      const blob = await fetchVideoAsBlob(videoUrl);
      const blobUrl = URL.createObjectURL(blob);
      const fileName = targetDiv.querySelector(
        '[data-e2e="video-desc"]'
      ).innerText;
      downloadVideo(blobUrl, `${fileName}.mp4`);
      targetDiv.querySelector(".addon-download-image").src = downloadIconLink;
    } catch (err) {
      console.log(err);
    }
  }

  const findLink = () => {
    let currentId = targetDiv.getAttribute("data-e2e-vid");
    let targetLink = linkList.find((link) => link.includes(currentId));
    if (!targetLink) {
      return targetDiv.querySelector("video").firstChild?.src;
    }
    return "https:" + targetLink;
  };

  downloadVideoFromUrl(findLink());
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

  targetDiv
    ?.querySelector(".immersive-player-switch-on-hide-interaction-area")
    ?.prepend(div);
  div.onclick = downloadVideo;
};

const init = () => {
  const originalFetch = window.fetch;
  window.fetch = function () {
    const link = arguments[0];
    if (link.includes("zjcdn") && linkList.at(-1) !== link) {
      console.log("Fetch request made:", link);
      linkList.push(link);
    }
    return originalFetch.apply(this, arguments);
  };
  setInterval(addDownloadDiv, 1000);
};

init();
