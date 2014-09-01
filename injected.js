var issueName = document.querySelector('.js-issue-title').childNodes[0].nodeValue;
chrome.runtime.sendMessage({
  type: 'ISSUE_NAME',
  text: issueName
});
