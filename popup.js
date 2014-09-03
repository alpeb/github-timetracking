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

            chrome.tabs.executeScript({
              file: 'injected.js'
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

