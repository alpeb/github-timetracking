var titleNodes = document.querySelector('.js-issue-title');
if (titleNodes) {
  var issueName = titleNodes.childNodes[0].nodeValue;
  chrome.runtime.sendMessage({
    type: 'ISSUE_NAME',
    text: issueName
  });
}

chrome.runtime.onMessage.addListener(function(req) {
  switch (req.action) {
    case 'COMMIT_TIME':
      document.querySelector('textarea[name=comment\\[body\\]]').value = 'Time spent: ' + req.time;
      document.querySelector('#partial-new-comment-form-actions button').click()
      break;
    case 'COMMIT_ESTIMATE':
      document.querySelector('textarea[name=comment\\[body\\]]').value = 'Estimate: ' + req.time;
      document.querySelector('#partial-new-comment-form-actions button').click()
      break;
    case 'SHOW_REPORTS':
      $('body').append(req.content);
      $('#reports').modal('show');
      $('select[name=milestone]').change(function() {
        var milestoneHref = $(this).val();
        $.get(
          'https://github.com' + milestoneHref,
          function(html) {
            html = $(html);
            $('a.issue-title-link', html).each(function() {
              var issueTitle = $(this).text();
              var issueHref = $(this).attr('href');
              $.get(
                'https://github.com' + issueHref,
                function(html) {
                  var regex = /Time spent: (\d+):(\d+)/
                  var matches = html.match(regex);
                  if (matches) {
                    var hours = matches[1];
                    var minutes = matches[2];
                    $('#reports .modal-body').append('<div>' + issueTitle + ': ' + hours + ':' + minutes + '</div>');
                  }
                }
              );
            });
          }
        );
      });
      break;
  }
});
