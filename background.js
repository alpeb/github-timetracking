var timestamp;
var pausedAt = null;
var intervalId;

// 0: stopped
// 1: running
// 2: paused
var status = 0;

function tick() {
  var totalSecs = Math.floor((new Date() - timestamp) / 1000);
  var totalMins = Math.floor(totalSecs / 60);
  var totalHours = Math.floor(totalMins / 60);
  var mins = totalMins % 60;
  var hours =  totalHours % 60;
  if (mins < 10) {
    mins = "0" + mins;
  }
  var badge = hours + ":" + mins;
  chrome.browserAction.setBadgeText({
    text: badge
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
  timestamp = null;
  status = 0;
  chrome.browserAction.setBadgeText({
    text: ''
  });
}
