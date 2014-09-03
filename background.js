var timestamp;
var pausedAt = null;
var intervalId;

// 0: stopped
// 1: running
// 2: paused
var status = 0;

function getElapsedTime() {
  var totalSecs = Math.floor((new Date() - timestamp) / 1000);
  var totalMins = Math.floor(totalSecs / 60);
  var totalHours = Math.floor(totalMins / 60);
  var mins = totalMins % 60;
  var hours =  totalHours % 60;
  if (mins < 10) {
    mins = "0" + mins;
  }
  return hours + ":" + mins;
}

function tick() {
  chrome.browserAction.setBadgeText({
    text: getElapsedTime()
  });
}

function startTimer() {
  if (status == 2) {
    var now = new Date();
    timestamp = new Date(timestamp.valueOf() + (now - pausedAt));
  } else {
    timestamp = new Date();
  }

  intervalId = setInterval(tick, 1000);
  status = 1;
}

function pauseTimer() {
  clearInterval(intervalId);
  pausedAt = new Date();
  status = 2;
}

function stopTimer() {
  clearInterval(intervalId);
  status = 0;
  chrome.browserAction.setBadgeText({
    text: ''
  });

  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'COMMIT_TIME',
      time: getElapsedTime()
    });
    timestamp = null;
  });
}
