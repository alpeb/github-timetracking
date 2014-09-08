var background = chrome.runtime.getBackgroundPage(function(background) {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
      $('#no-project').show();
      $('#found-project').hide();

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
          $('#found-project').show();
          $('#project-name').html(project);

          if (issue) {
            if (background.status == 1) {
              $('#start').hide();
              $('#pause').show();
              $('#stop').show();
            } else if (background.status == 2) {
              $('#start').show();
              $('#pause').hide();
              $('#stop').show();
            }

            chrome.runtime.onMessage.addListener(function (evt) {
              if (evt.type && (evt.type == "ISSUE_NAME")) {
                $('#issue-name').text(evt.text);
              }
            });
            $('#issue-number').html(issue);
            $('#issue').show();

            $('#estimate-show').click(function() {
              $('#estimate-form').show(400);
            });

            $('#estimate-submit').click(function() {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'COMMIT_ESTIMATE',
                time: $(this).siblings('input[name=estimate-hours]').val() + ':'
                  + $(this).siblings('input[name=estimate-minutes]').val()
              });
              $('#estimate-form').hide();
            });

            $('#start').click(function() {
              background.startTimer();
              $('#start').hide();
              $('#pause').show();
              $('#stop').show();
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
            });
          } else {
            $('#no-issue').show();
            $('#issue').hide();
          }

          $('#reports-show').click(function() {
            $.get(
              'https://github.com/' + account + '/' + project + '/milestones',
              function(html) {
                html = $(html);
                $('.milestone-title-link a', html).each(function() {
                  $('select[name=milestone]')
                    .append($('<option>' + $(this).text() + '</option>'));
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

