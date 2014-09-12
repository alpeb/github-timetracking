var STATUS_STOPPED = 0;
var STATUS_RUNNING = 1;
var STATUS_PAUSED = 2;
var POMODORO_STATUS_WORK = 0;
var POMODORO_STATUS_REST_SHORT = 1;
var POMODORO_STATUS_REST_LONG = 2;
var POMODORO_WORK = 25;
var POMODORO_REST_SHORT = 5;
var POMODORO_REST_LONG = 30;
var POMODORO_POMODORI_BEFORE_REST_LONG = 4;

var timestamp;
var pomodoroTimestamp;
var pomodoroMins = 0;
var pausedAt = null;
var pomodoroPausedAt = null;
var intervalId;
var pomodoroEnabled = false;
var pomodoroStatus = POMODORO_STATUS_WORK;
var pomodori = 0;
var status = STATUS_STOPPED;

function getElapsedTime() {
  var totalSecs = Math.floor((new Date() - timestamp) / 1000);
  var pomodoroTotalSecs = Math.floor((new Date() - pomodoroTimestamp) / 1000);
  var totalMins = Math.floor(totalSecs / 60);
  pomodoroMins = Math.floor(pomodoroTotalSecs / 60);
  var totalHours = Math.floor(totalMins / 60);
  var mins = totalMins % 60;
  var hours =  totalHours % 60;
  if (mins < 10) {
    mins = "0" + mins;
  }
  return [hours,  mins];
}

function tick() {
  var elapsedTime = getElapsedTime();
  chrome.browserAction.setBadgeText({
    text: elapsedTime[0] + ':' + elapsedTime[1]
  });

  if (pomodoroEnabled) {
    switch (pomodoroStatus) {
      case POMODORO_STATUS_WORK:
        if (pomodoroMins >= POMODORO_WORK) {
          pomodoroTimestamp = new Date();
          pomodoroMins = 0;
          pomodori++;
          if (pomodori % POMODORO_POMODORI_BEFORE_REST_LONG == 0) {
            pomodoroStatus = POMODORO_STATUS_REST_LONG;
            setTimeout(function() {
              alert("Take a LONG break! (" + POMODORO_REST_LONG + " mins)");
            }, 500);
          } else {
            pomodoroStatus = POMODORO_STATUS_REST_SHORT;
            setTimeout(function() {
              alert("Take a SHORT break! (" + POMODORO_REST_SHORT + " mins)");
            }, 500);
          }

          chrome.browserAction.setBadgeBackgroundColor({
            color: '#006600'
          });
          var audio = new Audio('sounds/short-break.mp3');
          audio.play();
        }
        break;
      case POMODORO_STATUS_REST_SHORT:
      case POMODORO_STATUS_REST_LONG:
        if (pomodoroMins >= (pomodoroStatus == POMODORO_STATUS_REST_SHORT? POMODORO_REST_SHORT : POMODORO_REST_LONG)) {
          pomodoroTimestamp = new Date();
          pomodoroMins = 0;
          pomodoroStatus = POMODORO_STATUS_WORK;

          chrome.browserAction.setBadgeBackgroundColor({
            color: '#CC0000'
          });
          var audio = new Audio('sounds/work.mp3');
          audio.play();
        }
        break;
    }
  }
}

function startTimer() {
  if (status == STATUS_PAUSED) {
    var now = new Date();
    timestamp = new Date(timestamp.valueOf() + (now - pausedAt));
    pomodoroTimestamp = new Date(pomodoroTimestamp.valueOf() + (now - pomodoroPausedAt));
  } else {
    timestamp = new Date();
    pomodoroTimestamp = new Date();
  }

  chrome.browserAction.setBadgeBackgroundColor({
    color: '#CC0000'
  });

  tick();
  intervalId = setInterval(tick, 1000);
  status = STATUS_RUNNING;
}

function pauseTimer() {
  clearInterval(intervalId);
  pausedAt = new Date();
  pomodoroPausedAt = new Date();
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#0066FF'
  });
  status = STATUS_PAUSED;
}

function stopTimer() {
  clearInterval(intervalId);
  status = STATUS_STOPPED;
  pomodori = 0;
  chrome.browserAction.setBadgeText({
    text: ''
  });
}

function recordTime() {
  if (status > STATUS_STOPPED) {
    stopTimer();
  }
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'COMMIT_TIME',
      time: elapsedTime[0] + ':' + elapsedTime[1]
    });
    timestamp = null;
    pomodoroTimestamp = null;
  });
}
