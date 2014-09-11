var timestamp;
var pausedAt = null;
var intervalId;
var pomodoroEnabled = false;
var resting = false;
var POMODORO_WORK = 2;
var POMODORO_REST_SHORT = 1;
var POMODORO_REST_LONG = 3;

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
  return [hours,  mins];
}

function setPomodoroEnabled(enabled) {
  pomodoroEnabled = enabled;
}

function tick() {
  var elapsedTime = getElapsedTime();
  chrome.browserAction.setBadgeText({
    text: elapsedTime[0] + ':' + elapsedTime[1]
  });

  if (pomodoroEnabled && elapsedTime[1] > 0) {
    if (!resting && (elapsedTime[1] + POMODORO_REST_SHORT )% (POMODORO_WORK + POMODORO_REST_SHORT) == 0) {
      chrome.browserAction.setBadgeBackgroundColor({
        color: '#006600'
      });
      var audio = new Audio('sounds/short-break.mp3');
      audio.play();
      resting = true;
      alert("TAKE A SHORT BREAK! (" + POMODORO_REST_SHORT + " mins)");
    } else if (resting && elapsedTime[1] % (POMODORO_WORK + POMODORO_REST_SHORT) == 0) {
      chrome.browserAction.setBadgeBackgroundColor({
        color: '#CC0000'
      });
      var audio = new Audio('sounds/work.mp3');
      audio.play();
      resting = false;
    }
  }
}

function startTimer() {
  if (status == 2) {
    var now = new Date();
    timestamp = new Date(timestamp.valueOf() + (now - pausedAt));
  } else {
    timestamp = new Date();
  }

  chrome.browserAction.setBadgeBackgroundColor({
    color: '#CC0000'
  });

  tick();
  intervalId = setInterval(tick, 1000);
  status = 1;
}

function pauseTimer() {
  clearInterval(intervalId);
  pausedAt = new Date();
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#0066FF'
  });
  status = 2;
}

function stopTimer() {
  clearInterval(intervalId);
  status = 0;
  chrome.browserAction.setBadgeText({
    text: ''
  });
}

function recordTime() {
  if (status > 0) {
    stopTimer();
  }
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'COMMIT_TIME',
      time: elapsedTime[0] + ':' + elapsedTime[1]
    });
    timestamp = null;
  });
}
