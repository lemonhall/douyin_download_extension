function loadMainScript() {
  localStorage.setItem(
    "downloadIconLink",
    chrome.runtime.getURL("assets/images/download.png")
  );
  localStorage.setItem(
    "loadingdIconLink",
    chrome.runtime.getURL("assets/images/loading.png")
  );

  return new Promise((resolve, reject) => {
    const mainScript = document.createElement("script");
    mainScript.type = "text/javascript";
    mainScript.onload = resolve;
    mainScript.onerror = reject;
    mainScript.src = chrome.runtime.getURL("injection.js");
    document.head.appendChild(mainScript);
  });
}

const init = async () => {
  try {
    // await loadAssetScript();
    await loadMainScript();
  } catch (err) {
    console.log(err);
  }
};

init();
