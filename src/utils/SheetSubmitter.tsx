import React, { useState, useEffect } from 'react';

// Google Sheets API URL 
// IMPORTANT: After deploying your Apps Script, replace this URL with your new deployment URL
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbw2lDK8fZy8EN7kYyGrMClQlrz3pMieZzEd31VpnOlMMGHT1kfp5ulTkSr36iUHpwL3/exec";

interface AppointmentData {
  name: string;
  age: string;
  gender: string;
  doctor: string;
  date: string;
  time: string;
  token: string;
}

export const submitToGoogleSheets = async (data: AppointmentData): Promise<boolean> => {
  try {
    // Use XMLHttpRequest which has better CORS handling in some cases
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      // Add all data to form
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Log what we're sending
      console.log("Sending data to Google Sheets:", data);
      
      xhr.open('POST', GOOGLE_SHEETS_API_URL);
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          console.log("Google Sheets response:", xhr.responseText);
          resolve(true);
        } else {
          console.error("Error response from Google Sheets:", xhr.status, xhr.responseText);
          reject(new Error(`Failed with status ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        console.error("Network error when submitting to Google Sheets");
        reject(new Error('Network error'));
      };
      
      xhr.send(formData);
    });
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    return false;
  }
};

// Component for iframe submission method (alternative approach)
export const GoogleSheetsSubmitter: React.FC<{
  data: AppointmentData;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ data, onSuccess, onError }) => {
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    if (!submitted) {
      try {
        // Create a form element
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_SHEETS_API_URL;
        form.target = 'submissionFrame'; // Target the iframe
        form.style.display = 'none';
        
        // Add form fields
        Object.entries(data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        
        // Append form to document and submit
        document.body.appendChild(form);
        form.submit();
        
        // Clean up form
        setTimeout(() => {
          document.body.removeChild(form);
        }, 500);
        
        setSubmitted(true);
        onSuccess();
      } catch (error) {
        console.error("Error in iframe submission:", error);
        onError("Failed to submit the form. Please try again.");
      }
    }
  }, [data, onSuccess, onError, submitted]);
  
  return <iframe name="submissionFrame" style={{ display: 'none' }} />;
};

export default GoogleSheetsSubmitter; 