/**
 * CTP Referral Outreach Tracker – Google Apps Script
 *
 * Connects the "CTP Referral Outreach Tracker" Google Sheet to the
 * CTP Referral Source Finder website, so the team can log outreach from the site.
 *
 * Setup (one time):
 *   1. Open the tracker sheet → Extensions → Apps Script.
 *   2. Replace everything in Code.gs with this file and click Save.
 *   3. Deploy → New deployment → type "Web app"
 *        Execute as: Me      Who has access: Anyone
 *   4. Click Deploy, approve the permissions, and copy the Web app URL.
 *
 * Only people who know TEAM_CODE can read or write the tracker from the website.
 */
const TEAM_CODE = "ctp-fd4798";

const HEADERS = ["Key","Updated","CTP Location","Name","Type","Priority","Address","Phone",
  "Contact Person","Contact Title","Contact Phone","Status","Owner","Last Contact Date",
  "Next Step","Notes","Google Maps"];

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const first = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (first.join("|") !== HEADERS.join("|")) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function cellText_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return v === null || v === undefined ? "" : String(v);
}

// GET: return all tracked places (used to show status badges on the site)
function doGet(e) {
  if ((e.parameter.code || "") !== TEAM_CODE) return json_({ error: "Wrong team code" });
  const values = sheet_().getDataRange().getValues();
  const head = values.shift();
  const rows = values.filter(r => r[0]).map(r => {
    const o = {};
    head.forEach((h, i) => o[h] = cellText_(r[i]));
    return o;
  });
  return json_({ ok: true, rows });
}

// POST: add a place, or update it if its Key is already in the sheet
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ error: "Bad request" }); }
  if ((d.code || "") !== TEAM_CODE) return json_({ error: "Wrong team code" });
  if (!d.Key) return json_({ error: "Missing Key" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    d.Updated = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
    const row = HEADERS.map(h => d[h] === undefined ? "" : String(d[h]));
    const keys = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(r => r[0]) : [];
    const i = keys.indexOf(d.Key);
    if (i >= 0) sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    return json_({ ok: true, updated: d.Updated });
  } finally {
    lock.releaseLock();
  }
}
