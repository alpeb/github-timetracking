// CONSTANTS
var POMODORO_STATUS_WORK = 0;
var POMODORO_STATUS_REST_SHORT = 1;
var POMODORO_STATUS_REST_LONG = 2;
var STATUS_STOPPED = 0;
var STATUS_RUNNING = 1;
var STATUS_PAUSED = 2;

// EXTENSION OPTIONS
var optionsPomodoroDuration = 25;
var optionsShortBreakDuration = 5;
var optionsLongBreaks = true;
var optionsLongBreaksEvery = 4;
var optionsLongBreakDuration = 30;

// TIMESTAMPS
var initialTimestamp;
var currentPomodoroInitialTimestamp;
var originalBreakTimestamp;
var restTimestamp;
var nextBreakTimestamp;
var nextWorkTimestamp;

var intervalId;
var pomodoroEnabled = false;
var waitingAnswer = false;
var pomodoroStatus = POMODORO_STATUS_WORK;
var pomodori = 0;
var pausedAt = null;
var status = STATUS_STOPPED;

function tick() {
  var elapsedTime = getElapsedTime();
  var now = new Date();
  
  // currentPomodoroInitialTimestamp tracks pomodoros without postponed breaks, so it has
  // to be updated rigorously and independently of the rest events.
  if (now >= originalBreakTimestamp) {
    currentPomodoroInitialTimestamp = now;
    originalBreakTimestamp = datePlusMillis(currentPomodoroInitialTimestamp, (parseInt(optionsPomodoroDuration) + parseInt(optionsShortBreakDuration)) * 60000);
  }
  
  if (pomodoroEnabled && !waitingAnswer) {
    switch (pomodoroStatus) {
      case POMODORO_STATUS_WORK:
        showTime(elapsedTime[0], elapsedTime[1]);
        if (now >= nextBreakTimestamp) {
          new Audio('sounds/short-break.mp3').play();
          notification('break_1', isLongBreak()? "Time for a *LONG* break! (" + optionsLongBreakDuration + " mins)" : "Time for a *SHORT* break! (" + optionsShortBreakDuration + " mins)",
            [{title: 'Take a break'}, {title: 'Skip / Postpone'}]);
        }
        break;
      case POMODORO_STATUS_REST_SHORT:
      case POMODORO_STATUS_REST_LONG:
        showTime(elapsedTime[3], elapsedTime[4]);
        if (now >= nextWorkTimestamp) {
          setColor('#CC0000');
          if (pomodoroStatus == POMODORO_STATUS_REST_LONG) {
            // discount long breaks from billable time
            initialTimestamp = datePlusMillis(initialTimestamp, (optionsLongBreakDuration - optionsShortBreakDuration) * 60000)
          }
          pomodoroStatus = POMODORO_STATUS_WORK;
          nextBreakTimestamp = originalBreakTimestamp;
          newPomodoro();
          new Audio('sounds/work.mp3').play();
          break;
        }
    }
  } else {
    showTime(elapsedTime[0], elapsedTime[1]);
  }
}

function startTimer() {
  waitingAnswer = false;
  if (status == STATUS_PAUSED) {
    var pauseDuration = new Date() - pausedAt;
    initialTimestamp = datePlusMillis(initialTimestamp, pauseDuration);
    currentPomodoroInitialTimestamp = datePlusMillis(currentPomodoroInitialTimestamp, pauseDuration);
    originalBreakTimestamp = datePlusMillis(originalBreakTimestamp, pauseDuration);
    restTimestamp = datePlusMillis(restTimestamp, pauseDuration);
    nextBreakTimestamp = datePlusMillis(nextBreakTimestamp, pauseDuration);
    nextWorkTimestamp = datePlusMillis(nextWorkTimestamp, pauseDuration);
  } else {
    initialTimestamp = new Date();
    currentPomodoroInitialTimestamp = new Date();
    originalBreakTimestamp = datePlusMillis(currentPomodoroInitialTimestamp, optionsPomodoroDuration * 60000);
    restTimestamp = new Date();
    nextBreakTimestamp = nowPlusMillis(optionsPomodoroDuration * 60000);
  }
  setColor('#CC0000');
  tick();
  intervalId = setInterval(tick, 1000);
  status = STATUS_RUNNING;
}

function pauseTimer() {
  clearInterval(intervalId);
  pausedAt = new Date();
  setColor('#0066FF');
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
  var elapsedTime = getElapsedTime();
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'COMMIT_TIME',
      time: elapsedTime[0] + ':' + elapsedTime[1]
    });
    initialTimestamp = null;
    restTimestamp = null;
    nextBreakTimestamp = null;
  });
}

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIx){
  chrome.notifications.clear(notificationId, function() {});
  waitingAnswer = false;
  switch (notificationId) {
    case 'break_1':
      if (buttonIx == 0) {
        // ***** Take a break
        restTimestamp = new Date();
        if (isLongBreak()) {
          setColor('#006600');
          pomodoroStatus = POMODORO_STATUS_REST_LONG;
          nextWorkTimestamp = nowPlusMillis(optionsLongBreakDuration * 60000);
        } else {
          setColor('#ff1493');
          pomodoroStatus = POMODORO_STATUS_REST_SHORT;
          nextWorkTimestamp = nowPlusMillis(optionsShortBreakDuration * 60000);
        }
      } else {
        var buttons = [{title: 'Skip'}];
        if (nowPlusMillis(2 * 60000) < originalBreakTimestamp) {
          buttons.push({title: 'Postpone'});
        }
        notification('break_2', 'Do you want to skip or postpone your break?', buttons);
      }
      break;
    case 'break_2':
      if (buttonIx == 0) {
        // ***** Skip break
        nextBreakTimestamp = originalBreakTimestamp;
        newPomodoro();
      } else {
        var buttons = [{title: '2 Minutes'}];
        if (nowPlusMillis(10 * 60000) < originalBreakTimestamp) {
          buttons.push({title: 'More'});
        }
        notification('break_3', 'For how long do you want to postpone your break?', buttons);
      }
      break;
    case 'break_3':
      if (buttonIx == 0) {
        // ***** Postpone break 2 minutes
        nextBreakTimestamp = nowPlusMillis(2 * 60000);
      } else {
        var buttons = [{title: '10 Minutes'}];
        if (nowPlusMillis(30 * 60000) < originalBreakTimestamp) {
          buttons.push({title: '30 Minutes'});
        }
        notification('break_4', 'For how long do you want to postpone your break?', buttons);
      }
      break;
    case 'break_4':
      if (buttonIx == 0) {
        // ***** Postpone break 10 minutes
        nextBreakTimestamp = nowPlusMillis(10 * 60000);
      } else {
        // ***** Postpone break 30 minutes
        nextBreakTimestamp = nowPlusMillis(30 * 60000);
      }
      break;
  }
});

function getElapsedTime() {
  var totalSecs = Math.floor((new Date() - initialTimestamp) / 1000);
  var restTotalSecs = Math.floor((new Date() - restTimestamp) / 1000);
  var totalMins = Math.floor(totalSecs / 60);
  var restTotalMins = Math.floor(restTotalSecs / 60);
  var totalHours = Math.floor(totalMins / 60);
  var restTotalHours = Math.floor(restTotalMins / 60);
  var mins = totalMins % 60;
  var restMins = restTotalMins % 60;
  var hours =  totalHours % 60;
  var restHours =  restTotalHours % 60;
  var seconds = totalSecs % 60;
  if (mins < 10) {
    mins = "0" + mins;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (restMins < 10) {
    restMins = "0" + restMins;
  }
return [hours, mins, seconds, restHours, restMins];
}

function showTime(hours, mins) {
  chrome.browserAction.setBadgeText({
    text: hours + ':' + mins
  });
}

function setColor(color) {
  chrome.browserAction.setBadgeBackgroundColor({
    color: color
  });
}

function notification(id, msg, buttons) {
  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('images/icon-48.png'),
    title: 'Time for a break',
    message: msg,
    priority: 2,
    buttons: buttons
  }, function() {});
  waitingAnswer = true;
}

function newPomodoro() {
  pomodori++;
}

function isLongBreak() {
  return (optionsLongBreaks && ((pomodori + 1 ) % optionsLongBreaksEvery == 0));
}

function datePlusMillis(date, millis) {
  return new Date(date.valueOf() + millis);
}

function nowPlusMillis(millis) {
  return new Date(new Date().valueOf() + millis);
}

// used for testing
function advanceTime(mins, secs) {
  secs = secs || 0;
  var diff = (mins * 60 + secs) * 1000;
  initialTimestamp = datePlusMillis(initialTimestamp, -diff);
  restTimestamp = datePlusMillis(restTimestamp, -diff);
  currentPomodoroInitialTimestamp = datePlusMillis(currentPomodoroInitialTimestamp, -diff);
  originalBreakTimestamp = datePlusMillis(originalBreakTimestamp, -diff);
  if (nextBreakTimestamp) {
    nextBreakTimestamp = datePlusMillis(nextBreakTimestamp, -diff);
  }
  if (nextWorkTimestamp) {
    nextWorkTimestamp = datePlusMillis(nextWorkTimestamp, -diff);
  }

  var t = getElapsedTime();
  console.log('clock: ', t[0], t[1], t[2]);
}
