chrome.runtime.onMessage.addListener(function(req) {
  switch (req.action) {
    case 'COMMIT_TIME':
      document.querySelector('textarea[name=comment\\[body\\]]').value = 'Time spent: ' + req.time;
      document.querySelector('#partial-new-comment-form-actions button').click()
      break;
    case 'SHOW_REPORTS':
      $('.report').remove();
      $('body').append(req.content);
      $('#reports').modal('show');
      $('select[name=milestone]').change(function() {
        var milestoneHref = $(this).val();
        $.get(
          'https://github.com' + milestoneHref,
          function(html) {
            html = $(html);
            $('.time-items').html('');
            $('a.issue-title-link', html).each(function() {
              var issueTitle = $(this).text();
              var issueHref = $(this).attr('href');
              $.get(
                'https://github.com' + issueHref,
                function(html) {
                  var regex = /<p>Time spent: \d+:\d+<\/p>/g
                  var matches = html.match(regex);
                  if (matches) {
                    var totalHours = totalMinutes = 0;
                    $.each(matches, function(index, value) {
                      regex = /Time spent: (\d+):(\d+)/
                      matches2 = value.match(regex);
                      totalHours += parseInt(matches2[1]);
                      totalMinutes += parseInt(matches2[2]);
                    });
                    totalHours += Math.floor(totalMinutes / 60);
                    totalMinutes = totalMinutes % 60;
                    if (totalMinutes < 10) {
                      totalMinutes = "0" + totalMinutes;
                    }
                    $('#reports .time-items').append('<div>' + issueTitle + ': ' + totalHours + ':' + totalMinutes + '</div>');
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
