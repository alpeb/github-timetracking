github-timetracking
===================

Chrome extension to add time tracking and reporting to GitHub issues.

This works solely localy in your browser, and doesn't depend on any external service.

### Instalation (to-do)

Go to the Chrome Web Store and install the extension. Once installed, you'll see a couple of new icons to the right of the address bar:
  - Time tracking (start/pause/stop): only actionable when viewing a GitHub issue
  - Other ops:
    - View report for current project (only actionable when browsing a GitHub project)
    - Enter estimate for current issue (only actionable when viewing a GitHub issue)
    - Settings

### Entering an estimate (to-do)

When viewing a GitHub issue, press the extension's Ops icon and select `Estimate`. Enter the estimate in hours and minutes in the appearing popup. A new comment will be added to the issue, specially encoded for the extension to parse it when generating reports. You can also set the estimate as part of a commit message linked to this issue. Entering estimates is completely optional.

### Time Tracking (done)

To start working on an issue, press the Play button. You can pause to stop the timer. To signal you're done with the issue, press Stop. Like with estimates, a new comment will be added, which you can also set through a commit message.

### Reports (to-do)

To generate a report, the extension parses all issue and commit comments and shows estimates vs real times, with totals per milestone and per user.

### Settings (to-do)

Ability to set rate per hour for each project
