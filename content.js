const script = document.createElement("script");
script.src = chrome.runtime.getURL("script.js");
document.documentElement.appendChild(script);
