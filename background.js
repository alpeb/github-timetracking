var timestamp;

function tick() {
  var totalSecs = Math.floor((new Date() - timestamp) / 1000);
  console.log("totalSecs: ", totalSecs);
  var totalMins = Math.floor(totalSecs / 60);
  var totalHours = Math.floor(totalMins / 60);
  var mins = totalMins % 60;
  console.log("mins: ", mins);
  var hours =  totalHours % 60;
  console.log("hours: ", hours);
  if (mins < 10) {
    mins = "0" + mins;
  }
  var badge = hours + ":" + mins;
  chrome.browserAction.setBadgeText({
    text: badge
  });
}

function startTimer() {
  timestamp = new Date();
  setInterval(tick, 1000);
}
