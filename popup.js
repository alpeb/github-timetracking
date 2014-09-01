var background = chrome.runtime.getBackgroundPage(function(background) {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
     function(tabs){
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
                console.log("CLICK");
                background.startTimer();
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

