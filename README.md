github-timetracking
===================

Chrome extension to add time tracking, reporting and billing to GitHub issues, with Pomodoro time tracking functionality. Also works as a standalone time tracking utility without GitHub.

It runs localy in your browser, and doesn't depend on any external service.

### Instalation (to-do)

Go to the Chrome Web Store and install the extension. Once installed, you'll see a couple of new icons to the right of the address bar:
  - Time tracking (start/pause/stop): only actionable when viewing a GitHub issue
  - Other ops:
    - View report for current project (only actionable when browsing a GitHub project)
    - Settings

### Time Tracking (to-do)

To start working on an issue, press the Play button. You can pause to stop the timer. To signal you're done with the issue, press Stop. A new comment will be added, which you can also set through a commit message.

#### Pomodoro functionality
The [Pomodoro Technique] (http://pomodorotechnique.com/) is a time management method to improve productivity and prevent burnout. I highly recommend it.

Before starting the timer, you can tick the `pomodoro intervals` option to have time be split into pomodoros (or should I say *pomodori*): 25 mins of work + 5 mins break. After 2 hours (that's 4 pomodori), the regular red timer will be paused and a new blue one will start tracking a 30 mins break. When finished, the regular red timer will resume (you can resume work earlier if you want, by pressing the `Resume Work` button). You will hear a distinctive alarm at the end of all of these intervals.

Note that can disable the pomodoro intervals at any moment and return to regular time tracking by unticking the `pomodoro intervals` option.

### Reports (to-do)

To generate a report, the extension parses all issue and commit comments and shows estimates vs real times, with totals per milestone and per user.

### Settings (to-do)

Ability to set rate per hour for each project
