var issueName = document.querySelector('.js-issue-title').childNodes[0].nodeValue;
chrome.runtime.sendMessage({
  type: 'ISSUE_NAME',
  text: issueName
});

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
      break;
  }
});
