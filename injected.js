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
      var milestoneTotalHours = milestoneTotalMinutes = 0;
      $('select[name=milestone]').change(function() {
        var milestoneHref = $(this).val();
        $.get(
          'https://github.com' + milestoneHref,
          function(html) {
            html = $(html);
            $('.time-items').html('');
            $('.milestoneTotal').text('');
            milestoneTotalHours = milestoneTotalMinutes = 0;
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
                    milestoneTotalHours += totalHours;
                    milestoneTotalMinutes = parseInt(milestoneTotalMinutes) + totalMinutes;
                    if (totalMinutes < 10) {
                      totalMinutes = "0" + totalMinutes;
                    }
                    $('#reports .time-items').append('<tr><td>' + issueTitle + '</td><td style="width:100px" class="text-right">' + totalHours + ':' + totalMinutes + '</td></tr>');
                    milestoneTotalHours += Math.floor(milestoneTotalMinutes / 60);
                    milestoneTotalMinutes = milestoneTotalMinutes % 60;
                    if (milestoneTotalMinutes < 10) {
                      milestoneTotalMinutes = "0" + milestoneTotalMinutes;
                    }
                    $('.milestoneTotal').text(milestoneTotalHours + ':' + milestoneTotalMinutes);
                  }
                }
              );
            });
          }
        );
      });

      $('#sendBill').click(function() {
        var rate = window.prompt('Please enter hourly rate for this project:');
        var recipient = window.prompt('Please enter email recipient:');
        var subject = "Invoice for project " + req.project;
        var amount = milestoneTotalHours * rate + milestoneTotalMinutes / 60 * rate;
        $('#reports .milestoneAmount').text("$" + parseFloat(amount).toFixed(2));

        var body = '';
        $('#reports tbody tr').each(function() {
          body += 'Task: "' + $('td:first', this).text().trim() + '"\r\n'
               + 'Time spent: ' + $('td:nth-child(2)', this).text().trim() + "\r\n\r\n";
        });

        body += '\r\nTotal Time: ' + $('#reports .milestoneTotal').text().trim();
        body += '\r\n\r\nAmount Due: ' + $('#reports .milestoneAmount').text().trim();

        body = "Reference milestone: " + $('select[name=milestone] option:selected').text()
          + "\r\n\r\n"
          + body;

        window.location.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      });

      break;
  }
});
