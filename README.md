# CTP Referral Source Finder

Type in a clinic address to find nearby children's hospitals, pediatricians, doctors, and schools that could become referral partners for Children's Therapy Place.

Built with the Google Maps JavaScript API and Places API (New). Add an API key in `index.html` (`GOOGLE_MAPS_API_KEY`).

## Outreach tracker

The "+ Track" button saves a practice, its contact person, status, and notes to the shared Google Sheet
"CTP Referral Outreach Tracker". The sheet is connected through a small Google Apps Script web app:
paste `tracker/Code.gs` into the sheet's Apps Script editor, deploy it as a web app (Execute as: Me,
Access: Anyone), and put the web app URL in `TRACKER_URL` in `index.html`. Team members enter the team
code once in their browser.
