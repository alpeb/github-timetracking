$(function() {
  $('a.link').click(function() {
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
  });
});

var background = chrome.runtime.getBackgroundPage(function(background) {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
      $('#no-project').show();
      $('#no-issue').show();
      $('#reports-show').attr('disabled', 'true');
      $('#record').attr('disabled', 'true');

      if (background.pomodoroEnabled) {
        $('input[name=pomodoro-intervals]').prop('checked', true);
        $('#pomodoros span').text(background.pomodori || "0");
        $('#pomodoros').show();
      } else {
        $('#pomodoros').hide();
      }

      var githubRe = /https:\/\/github.com\/([\w]+)\/([\w]+)(\/issues\/(\d+))?/;
      var currentUrl = tabs[0].url;
      var matches = currentUrl.match(githubRe);
      if (matches) {
        var account = matches[1];
        var project = matches[2];
        var issue = matches[4];
        
        if (typeof project != 'undefined') {
          chrome.tabs.executeScript({
            file: 'js/jquery-2.1.1.min.js'
          });
          chrome.tabs.executeScript({
            file: 'injected.js'
          });
          chrome.tabs.executeScript({
            file: 'js/bootstrap.js'
          });

          $('#no-project').hide();
          $('#project-name').html(project);
          $('#reports-show').removeAttr('disabled');

          if (issue) {
            $('#no-issue').hide();
            $('#issue').show();
            $('#record').removeAttr('disabled');
          } else {
            $('#issue').hide();
          }

          $('#reports-show').click(function() {
            $.get(
              'https://github.com/' + account + '/' + project + '/milestones',
              function(html) {
                html = $(html);
                $('select[name=milestone] option:not(:first)').remove();
                $('.milestone-title-link a', html).each(function() {
                  var href = $(this).attr('href');
                  $('select[name=milestone]')
                    .append($('<option value="' + href + '">' + $(this).text() + '</option>'));
                });

                chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'SHOW_REPORTS',
                  content: $('#reports-wrapper').html()
                });
              }
            );
          });
        }
      }

      if (background.status == background.STATUS_RUNNING) {
        $('#start').hide();
        $('#pause').show();
        $('#stop').show();
        $('#record').show();
      } else if (background.status == background.STATUS_PAUSED) {
        $('#start').show();
        $('#pause').hide();
        $('#stop').show();
        $('#record').show();
      }

      $('input[name=pomodoro-intervals]').change(function() {
        background.pomodoroEnabled = this.checked;
        if (this.checked) {
          $('#pomodoros').show();
        } else {
          $('#pomodoros').hide();
        }
      });

      $('#start').click(function() {
        background.startTimer();
        $('#start').hide();
        $('#pause').show();
        $('#stop').show();
        $('#record').show();
      });

      $('#pause').click(function() {
        background.pauseTimer();
        $('#start').show();
        $('#pause').hide();
      });

      $('#stop').click(function() {
        background.stopTimer();
        $('#start').show();
        $('#pause').hide();
        $('#stop').hide();
        $('#record').hide();
        $('#pomodoros span').text("0");
      });

      $('#record').click(function() {
        background.recordTime();
        $('#start').show();
        $('#pause').hide();
        $('#stop').hide();
        $('#record').hide();
      });
     }
  );

  function log(msg, arg) {
    if (typeof arg == 'undefined') {
      background.console.log(msg);
    } else {
      background.console.log(msg, arg);
    }
  }
});

