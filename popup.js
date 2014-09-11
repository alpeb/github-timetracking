var background = chrome.runtime.getBackgroundPage(function(background) {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
      $('#no-project').show();
      $('#no-issue').show();
      $('#reports-show').attr('disabled', 'true');
      $('#record').attr('disabled', 'true');

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

      if (background.status == 1) {
        $('#start').hide();
        $('#pause').show();
        $('#stop').show();
        $('#record').show();
      } else if (background.status == 2) {
        $('#start').show();
        $('#pause').hide();
        $('#stop').show();
        $('#record').show();
      }

      $('input[name=pomodoro-intervals]').change(function() {
        background.setPomodoroEnabled(this.checked);
        $('#pomodoros').show();
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

