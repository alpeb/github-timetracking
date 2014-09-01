var timestamp;

function tick() {
  chrome.browserAction.setBadgeText({
    text: (Math.floor((new Date() - timestamp) / 1000)).toString()
  });
}

function startTimer() {
  timestamp = new Date();
  setInterval(tick, 1000);
}
