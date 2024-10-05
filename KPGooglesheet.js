// fetch and update SERP ranking for each keyword
function updateSERPRankings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    const keyword = sheet.getRange(i, 1).getValue();
    const domain = sheet.getRange(i, 2).getValue();
    
    // Rank of domain 
    const rank = getGoogleSERPPosition(keyword, domain);
    
    if (rank !== -1) {
      // Update the current rank and timestamp
      sheet.getRange(i, 3).setValue(rank);
      sheet.getRange(i, 4).setValue(new Date());
    } else {
      // Domain not found within the first 100 results
      sheet.getRange(i, 3).setValue("Not in Top 100");
      sheet.getRange(i, 4).setValue(new Date());
    }
  }
}

function getGoogleSERPPosition(keyword, domain) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100`;
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
  
  const urls = response.match(/<a href="\/url\?q=(.*?)&amp;sa=U&amp;ved=/g);
  
  if (urls) {
    for (let i = 0; i < urls.length; i++) {
      const resultURL = urls[i].match(/<a href="\/url\?q=(.*?)&amp;sa=U/)[1];
      if (resultURL.includes(domain)) {
        return i + 1; // Return the 1-based position
      }
    }
  }
  
  return -1; 
}

function createTrigger() {
  ScriptApp.newTrigger('updateSERPRankings')
    .timeBased()
    .everyWeeks(1)
    .create();
}
