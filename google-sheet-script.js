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
    var phone = e.parameter.phone || "";
    var sms = e.parameter.sms || "no";
    
    // Log what we're about to save
    Logger.log("About to append row with: " + name + ", " + age + ", " + gender + ", " + doctor + ", " + date + ", " + time + ", " + token + ", " + phone + ", " + sms);
    
    // Append data to the sheet (make sure column order matches your sheet)
    sheet.appendRow([name, age, gender, doctor, date, time, token, phone, sms, new Date()]);
    
    // If SMS reminder is requested, schedule it
    if (sms === "yes" && phone) {
      scheduleSMSReminder(name, doctor, date, time, token, phone);
    }
    
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
          "token": token,
          "smsSent": (sms === "yes" && phone) ? "yes" : "no"
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

/**
 * Schedule SMS reminders to be sent 15 minutes before the appointment
 * This function uses a trigger to schedule the SMS
 */
function scheduleSMSReminder(patientName, doctor, date, time, token, phone) {
  try {
    // Parse appointment date and time
    var [hours, minutes] = time.split(':').map(Number);
    var appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0);
    
    // Set reminder time to 15 minutes before appointment
    var reminderTime = new Date(appointmentDate.getTime() - 15 * 60 * 1000);
    
    // Current time
    var now = new Date();
    
    // If reminder time is in the future
    if (reminderTime > now) {
      // Store the reminder information in a separate sheet for the trigger to use
      var reminderSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reminders");
      if (!reminderSheet) {
        reminderSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Reminders");
        reminderSheet.appendRow(["name", "doctor", "date", "time", "token", "phone", "reminder_time", "sent"]);
      }
      
      // Add reminder to the sheet
      reminderSheet.appendRow([
        patientName,
        doctor,
        date,
        time,
        token,
        phone,
        reminderTime.toISOString(),
        "no"
      ]);
      
      // Create a trigger to run the sendPendingReminders function
      // The function will run every 10 minutes to check for reminders that need to be sent
      var existingTriggers = ScriptApp.getProjectTriggers();
      var hasReminderTrigger = false;
      
      for (var i = 0; i < existingTriggers.length; i++) {
        if (existingTriggers[i].getHandlerFunction() === "sendPendingReminders") {
          hasReminderTrigger = true;
          break;
        }
      }
      
      if (!hasReminderTrigger) {
        ScriptApp.newTrigger("sendPendingReminders")
          .timeBased()
          .everyMinutes(10)
          .create();
      }
      
      Logger.log("SMS reminder scheduled for " + patientName + " at " + reminderTime.toISOString());
      return true;
    } else {
      Logger.log("Reminder time has already passed for " + patientName);
      return false;
    }
  } catch (error) {
    Logger.log("Error scheduling SMS reminder: " + error.toString());
    return false;
  }
}

/**
 * Send pending SMS reminders
 * This function is triggered every 10 minutes to check and send scheduled reminders
 */
function sendPendingReminders() {
  try {
    var reminderSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reminders");
    if (!reminderSheet) return;
    
    var data = reminderSheet.getDataRange().getValues();
    if (data.length <= 1) return; // Only header row exists
    
    var now = new Date();
    var anyRemindersProcessed = false;
    
    // Loop through all reminders (skip header row)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var name = row[0];
      var doctor = row[1];
      var date = row[2];
      var time = row[3];
      var token = row[4];
      var phone = row[5];
      var reminderTime = new Date(row[6]);
      var sent = row[7];
      
      // If reminder has not been sent and the time has come to send it
      if (sent === "no" && reminderTime <= now) {
        // Send the SMS
        var success = sendSMS(name, doctor, date, time, token, phone);
        
        // Mark as sent
        if (success) {
          reminderSheet.getRange(i + 1, 8).setValue("yes");
          anyRemindersProcessed = true;
          Logger.log("SMS reminder sent to " + name + " for appointment at " + time);
        }
      }
    }
    
    // If we processed any reminders, clean up the sheet
    if (anyRemindersProcessed) {
      cleanupReminders();
    }
    
  } catch (error) {
    Logger.log("Error sending pending reminders: " + error.toString());
  }
}

/**
 * Send an SMS using a third-party SMS gateway API
 * You'll need to configure this with your preferred SMS service
 */
function sendSMS(patientName, doctor, date, time, token, phone) {
  try {
    // Format the date and time for better readability
    var formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Prepare the message
    var message = "Reminder: Your appointment with " + doctor + " is in 15 minutes.\n" +
                  "Date: " + formattedDate + "\n" +
                  "Time: " + time + "\n" +
                  "Your token number: " + token + "\n" +
                  "Please arrive at Kumbala Cooperative Hospital soon.";
    
    // OPTION 1: Using Twilio SMS API
    /*
    var twilioAccountSid = "YOUR_TWILIO_SID"; // Replace with your Twilio SID
    var twilioAuthToken = "YOUR_TWILIO_AUTH_TOKEN"; // Replace with your Twilio Auth Token
    var twilioPhoneNumber = "+1234567890"; // Replace with your Twilio phone number
    
    var twilioEndpoint = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
    
    var options = {
      "method": "post",
      "headers": {
        "Authorization": "Basic " + Utilities.base64Encode(twilioAccountSid + ":" + twilioAuthToken)
      },
      "payload": {
        "To": phone,
        "From": twilioPhoneNumber,
        "Body": message
      }
    };
    
    UrlFetchApp.fetch(twilioEndpoint, options);
    */
    
    // OPTION 2: Using Fast2SMS (popular in India)
    /*
    var apiKey = "YOUR_FAST2SMS_API_KEY"; // Replace with your Fast2SMS API key
    
    var fast2smsEndpoint = "https://www.fast2sms.com/dev/bulkV2";
    
    var options = {
      "method": "post",
      "headers": {
        "authorization": apiKey,
        "Content-Type": "application/json"
      },
      "payload": JSON.stringify({
        "route": "q",
        "message": message,
        "language": "english",
        "flash": 0,
        "numbers": phone.replace(/\+91/g, "")
      })
    };
    
    UrlFetchApp.fetch(fast2smsEndpoint, options);
    */
    
    // OPTION 3: Using Message Bird
    /*
    var messageBirdKey = "YOUR_MESSAGEBIRD_KEY"; // Replace with your MessageBird API key
    
    var messageBirdEndpoint = "https://rest.messagebird.com/messages";
    
    var options = {
      "method": "post",
      "headers": {
        "Authorization": "AccessKey " + messageBirdKey,
        "Content-Type": "application/json"
      },
      "payload": JSON.stringify({
        "recipients": phone,
        "originator": "Hospital",
        "body": message
      })
    };
    
    UrlFetchApp.fetch(messageBirdEndpoint, options);
    */
    
    // For now, just log that we would send an SMS
    Logger.log("Would send SMS to " + phone + ": " + message);
    
    return true;
    
  } catch (error) {
    Logger.log("Error sending SMS: " + error.toString());
    return false;
  }
}

/**
 * Clean up old reminders that have been sent
 */
function cleanupReminders() {
  try {
    var reminderSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reminders");
    if (!reminderSheet) return;
    
    var data = reminderSheet.getDataRange().getValues();
    if (data.length <= 1) return; // Only header row exists
    
    // Keep track of rows to delete (in reverse order to avoid shifting issues)
    var rowsToDelete = [];
    
    // Find rows where reminders have been sent
    for (var i = 1; i < data.length; i++) {
      if (data[i][7] === "yes") { // If the reminder has been sent
        rowsToDelete.push(i + 1); // +1 because rows are 1-indexed
      }
    }
    
    // Delete rows in reverse order
    for (var j = rowsToDelete.length - 1; j >= 0; j--) {
      reminderSheet.deleteRow(rowsToDelete[j]);
    }
    
  } catch (error) {
    Logger.log("Error cleaning up reminders: " + error.toString());
  }
}

// Run this function once to initialize 
function initialize() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  // If there are no headers, add them
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["name", "age", "gender", "doctor", "date", "time", "token", "phone", "sms", "timestamp"]);
  }
  
  // Create the reminders sheet if it doesn't exist
  var reminderSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reminders");
  if (!reminderSheet) {
    reminderSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Reminders");
    reminderSheet.appendRow(["name", "doctor", "date", "time", "token", "phone", "reminder_time", "sent"]);
  }
  
  Logger.log("Initialization complete");
}

// This function can be used to manually clear all data except headers
function clearData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  
  // Also clear the reminders sheet
  var reminderSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reminders");
  if (reminderSheet && reminderSheet.getLastRow() > 1) {
    reminderSheet.deleteRows(2, reminderSheet.getLastRow() - 1);
  }
  
  Logger.log("Data cleared");
} 