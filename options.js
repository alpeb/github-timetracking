  var form = document.forms["settings"];

function save_options() {
  chrome.storage.sync.set({
    pomodoroDuration: form["pomodoroDuration"].value,
    shortBreakDuration: form["shortBreakDuration"].value,
    longBreaks: form["longBreaks"].checked,
    longBreaksEvery: form["longBreaksEvery"].value,
    longBreakDuration: form["longBreakDuration"].value
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreaks: true,
    longBreaksEvery: 4,
    longBreakDuration: 30
  }, function(items) {
    form["pomodoroDuration"].value = items.pomodoroDuration;
    form["shortBreakDuration"].value = items.shortBreakDuration;
    form["longBreaks"].checked = items.longBreaks;
    form["longBreaksEvery"].value = items.longBreaksEvery;
    form["longBreakDuration"].value = items.longBreakDuration;

    if (items.longBreaks) {
      document.getElementById('liLongBreaksEvery').style.display = 'list-item';
      document.getElementById('liLongBreaksDuration').style.display = 'list-item';
    }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

form["longBreaks"].addEventListener('click', function() {
  if (this.checked) {
    document.getElementById('liLongBreaksEvery').style.display = 'list-item';
    document.getElementById('liLongBreaksDuration').style.display = 'list-item';
  } else {
    document.getElementById('liLongBreaksEvery').style.display = 'none';
    document.getElementById('liLongBreaksDuration').style.display = 'none';
  }
});
