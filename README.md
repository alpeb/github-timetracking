github-timetracking
===================

Chrome extension to add time tracking, reporting and billing (to do) to GitHub issues, with optional Pomodoro time tracking functionality. Also works as a standalone time tracking utility without GitHub.

It runs localy in your browser, and doesn't depend on any external service.

### Instalation

Production version is available from the Chrome Web Store at [pending].

To install the development version:

- Clone this repo
- Go to the extension page in Chrome
- Tick `Developer mode`
- Click `Load unpacked extension`
- Point to the directory where you cloned this repo


### Time Tracking

To start the timer click on the extension icon and press the play button. You can pause to stop the timer. To record the time spent in a Github issue, navigate to the issue in question and press `Record Time`. A new comment will be added to the issue, that will be parsed by the reports (see below).

#### Pomodoro functionality
The [Pomodoro Technique] (http://pomodorotechnique.com/) is a time management method to improve productivity and prevent burnout. Its principle is very simple: you work 25 mins and then take a rest for 5 mins. That's one pomodoro. After every 4 pomodori, take a long break of 30 mins instead of 5 mins.

To use it here, just tick `pomodoro intervals` before starting the timer. After 25 mins you'll see an alert and the counter will turn dark orange, counting the 5 mins short break. After the short break is finished another alert will sound and the red timer will resume. At the end of the 4th pomodori you'll see an alert and a green timer will start tracking the long break. Finally, after the long break is finished, the red timer will resume.

Note that the red timer will track only the billable time which includes the 25 mins of work time plus the 5 mins short breaks, not the long breaks. So after the long break finishes, the red timer will continue counting where it left off before the long break started.

Also note that you can disable the pomodoro intervals at any moment and return to regular time tracking by unticking the `pomodoro intervals` option.

### Reports

To generate a report, navigate first to the desired project in GitHub. Then click on `Project Report`. In the report pop-up select a milestone. You'll see the aggregated times per issue, and a grand total for the milestone.
