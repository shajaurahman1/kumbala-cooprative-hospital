// Google Apps Script to handle appointments in Google Sheets
// For deployment as a Web App with the URL:
// https://script.google.com/macros/s/AKfycby8Aivp-kBKg7iusPDnKMXQUQVOPLL-B-egkR2-lIY1zw9WcVp4-YvFdhAxUn45vSo-Dg/exec

// HOW TO USE:
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this code
// 4. Change the SHEET_ID below if needed (get from your spreadsheet URL)
// 5. Deploy as a web app (set access to "Anyone, even anonymous")
// 6. Copy the deployment URL and use it in your React app

// Your Google Sheet should have these columns: name, age, gender, doctor, date, time, token

// Set the ID of your Google Sheet - get this from the URL of your sheet
// The URL format is: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
// Leave this blank to use the active spreadsheet
const SHEET_ID = ''; // Leave blank to use the current sheet this script is bound to
const SHEET_NAME = 'Sheet1';

// Main function to handle GET requests - Returns all appointments
function doGet(e) {
  return getAppointments();
}

// Main function to handle POST requests - Adds a new appointment
function doPost(e) {
  return addAppointment(e.parameter);
}

// Function to get the active sheet
function getSheet() {
  let sheet;
  if (SHEET_ID) {
    // If a specific sheet ID is provided, open that sheet
    sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  } else {
    // Otherwise use the active spreadsheet (the one this script is bound to)
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
      sheet.appendRow(['name', 'age', 'gender', 'doctor', 'date', 'time', 'token']);
    }
  }
  
  return sheet;
}

// Get all appointments
function getAppointments() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Add a new appointment
function addAppointment(data) {
  try {
    const sheet = getSheet();
    
    // Log the received data for debugging
    Logger.log("Received data: " + JSON.stringify(data));
    
    // Extract data from parameters
    const name = data.name || '';
    const age = data.age || '';
    const gender = data.gender || '';
    const doctor = data.doctor || '';
    const date = data.date || '';
    const time = data.time || '';
    const token = data.token || '';
    
    // Add data to sheet
    sheet.appendRow([name, age, gender, doctor, date, time, token]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Appointment added successfully',
      data: {name, age, gender, doctor, date, time, token}
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
} 