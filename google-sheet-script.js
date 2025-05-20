/**
 * This Google Apps Script should be added to your Google Sheet:
 * https://docs.google.com/spreadsheets/d/1odKQw8ZpVbbsdF7DrIaq-J8YKHNyBql-LS9B66S5POQ/edit
 * 
 * How to set up:
 * 1. Open your Google Sheet
 * 2. Click on Extensions > Apps Script
 * 3. Delete any code in the editor 
 * 4. Paste this entire script
 * 5. Save the script (File > Save)
 * 6. Run initialize() function once to set up permissions
 * 7. Deploy: Click Deploy > New deployment
 * 8. Select type: Web app
 * 9. Set "Who has access" to "Anyone"
 * 10. Click Deploy and copy the URL
 */

// This function runs when receiving GET requests
function doGet(e) {
  return handleResponse(e);
}

// This function runs when receiving POST requests (form submissions)
function doPost(e) {
  return handleResponse(e);
}

// Handle both GET and POST requests
function handleResponse(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  // Log the parameters received for debugging
  Logger.log("Received parameters: " + JSON.stringify(e.parameter));
  
  try {
    // If no parameters received, return error message
    if (!e.parameter) {
      return ContentService
        .createTextOutput(JSON.stringify({ "result": "error", "message": "No data received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the data from the request
    var name = e.parameter.name || "";
    var age = e.parameter.age || "";
    var gender = e.parameter.gender || "";
    var doctor = e.parameter.doctor || "";
    var date = e.parameter.date || "";
    var time = e.parameter.time || "";
    var token = e.parameter.token || "";
    
    // Log what we're about to save
    Logger.log("About to append row with: " + name + ", " + age + ", " + gender + ", " + doctor + ", " + date + ", " + time + ", " + token);
    
    // Append data to the sheet (make sure column order matches your sheet)
    sheet.appendRow([name, age, gender, doctor, date, time, token, new Date()]);
    
    // Return success message
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "success", 
        "data": {
          "name": name,
          "age": age,
          "gender": gender,
          "doctor": doctor,
          "date": date,
          "time": time,
          "token": token
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error
    Logger.log("Error: " + error.toString());
    
    // Return error message
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this function once to initialize 
function initialize() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  // If there are no headers, add them
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["name", "age", "gender", "doctor", "date", "time", "token", "timestamp"]);
  }
  
  Logger.log("Initialization complete");
}

// This function can be used to manually clear all data except headers
function clearData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  
  Logger.log("Data cleared");
} 