# Kumbala Cooperative Hospital Appointment System

A modern, multi-step appointment booking system for Kumbala Cooperative Hospital built with React, TypeScript and TailwindCSS.

## Features

- Multi-step appointment booking process
- Doctor selection with specialization filtering
- Real-time availability of time slots based on doctor's working hours
- Token number assignment based on existing appointments
- Google Sheets integration for appointment management
- Printable appointment token/slip

## Setup Instructions

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kumbala-cooperative-hospital.git

# Navigate to the project folder
cd kumbala-cooperative-hospital

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 2. Google Sheets Integration

To set up the Google Sheets integration:

1. Create a new Google Sheet
2. Go to Extensions > Apps Script
3. Paste the code from `google-apps-script.js` in this repository
4. Update the `SHEET_ID` variable with your Google Sheet ID (you can find this in the URL of your sheet)
5. Save the script
6. Deploy it as a web app:
   - Click on "Deploy" > "New deployment"
   - Select "Web app" as the type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone, even anonymous"
   - Click "Deploy"
7. Copy the deployment URL
8. In your project, open `src/context/AppointmentContext.tsx` and update the `GOOGLE_SHEETS_API_URL` constant with your deployment URL

### 3. Configuration

You can customize the application by:

- Updating the doctor information in `src/context/AppointmentContext.tsx`
- Modifying the hospital branding and colors in the Tailwind configuration

## Usage

1. Fill in patient details and select a doctor
2. Choose an available date and time slot
3. Complete the booking with additional information
4. Review and print the appointment token

## Technology Stack

- React 
- TypeScript
- TailwindCSS
- Vite
- Google Apps Script
- Google Sheets API

## Project Structure

- `src/pages/` - Main application pages
- `src/components/` - Reusable UI components
- `src/context/` - React context for state management
- `src/types/` - TypeScript type definitions

## License

This project is licensed under the MIT License.
