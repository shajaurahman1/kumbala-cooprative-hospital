import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Home, Download, Calendar, Bell, BellOff } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AppointmentData {
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string | number;
  createdAt: string;
}

const ConfirmAppointment = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [showCalendarInstructions, setShowCalendarInstructions] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmTimeLeft, setAlarmTimeLeft] = useState<string | null>(null);
  
  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Load appointment data from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem('currentAppointment');
      if (data) {
        setAppointment(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Setup automatic alarm when appointment data is loaded
  useEffect(() => {
    if (!appointment) return;
    
    // When we have appointment data and notification permission
    if (notificationPermission === 'granted') {
      setupAutomaticAlarm();
    }
  }, [appointment, notificationPermission]);
  
  // Check remaining time until appointment and update UI
  useEffect(() => {
    if (!appointment || !alarmSet) return;
    
    const interval = setInterval(() => {
      const timeUntilAppointment = getTimeUntilAppointment();
      if (timeUntilAppointment) {
        setAlarmTimeLeft(timeUntilAppointment);
      } else {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [appointment, alarmSet]);
  
  // Calculate time until appointment
  const getTimeUntilAppointment = () => {
    if (!appointment) return null;
    
    const [year, month, day] = appointment.appointmentDate.split('-').map(num => parseInt(num));
    const [hour, minute] = appointment.appointmentTime.split(':').map(num => parseInt(num));
    
    const appointmentTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    
    // Get milliseconds until appointment
    const diff = appointmentTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Appointment time has arrived';
    
    // Convert to hours, minutes, seconds
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} until appointment`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m until appointment`;
    }
    
    return `${minutes}m ${seconds}s until appointment`;
  };
  
  // Set up automatic alarm
  const setupAutomaticAlarm = () => {
    if (!appointment) return;
    
    try {
      // Parse appointment date and time
      const [year, month, day] = appointment.appointmentDate.split('-').map(num => parseInt(num));
      const [hour, minute] = appointment.appointmentTime.split(':').map(num => parseInt(num));
      
      // Create appointment time Date object
      const appointmentTime = new Date(year, month - 1, day, hour, minute);
      
      // Calculate reminder time (15 minutes before)
      const reminderTime = new Date(appointmentTime.getTime() - 15 * 60 * 1000);
      const now = new Date();
      
      // Store this in localStorage for persistent alarms across page reloads
      const alarmData = {
        appointmentTime: appointmentTime.toISOString(),
        reminderTime: reminderTime.toISOString(),
        doctor: appointment.doctorName,
        token: appointment.tokenNumber,
        fired: false
      };
      
      localStorage.setItem('appointmentAlarm', JSON.stringify(alarmData));
      
      // If reminder time is in the future, schedule it
      if (reminderTime > now) {
        const timeoutMs = reminderTime.getTime() - now.getTime();
        
        // Set timeout for the notification
        const alarmId = setTimeout(() => {
          // When the time comes, show notification
          new Notification('Appointment Reminder', {
            body: `Your appointment with ${appointment.doctorName} is in 15 minutes. Your token is ${appointment.tokenNumber}.`,
            icon: '/favicon.ico'
          });
          
          // Mark as fired in localStorage
          const updatedAlarmData = { ...alarmData, fired: true };
          localStorage.setItem('appointmentAlarm', JSON.stringify(updatedAlarmData));
          
          // Update state
          setAlarmSet(false);
          setAlarmTimeLeft('Notification sent');
        }, timeoutMs);
        
        // Store timeout ID to allow cancellation
        window.alarmTimeoutId = alarmId;
        setAlarmSet(true);
      } else if (appointmentTime > now) {
        // If we're within 15 minutes of the appointment but before it starts
        new Notification('Appointment Coming Up', {
          body: `Your appointment with ${appointment.doctorName} is coming up soon. Your token is ${appointment.tokenNumber}.`,
          icon: '/favicon.ico'
        });
        setAlarmTimeLeft('Notification sent - appointment is soon');
      } else {
        setAlarmTimeLeft('Appointment time has passed');
      }
    } catch (error) {
      console.error('Error setting up alarm:', error);
    }
  };
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setupAutomaticAlarm();
        
        // Notify user that alarm has been set
        new Notification('Alarm Set', {
          body: 'You will receive a notification 15 minutes before your appointment.',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };
  
  // Cancel the alarm
  const cancelAlarm = () => {
    if (window.alarmTimeoutId) {
      clearTimeout(window.alarmTimeoutId);
      window.alarmTimeoutId = null;
    }
    
    localStorage.removeItem('appointmentAlarm');
    setAlarmSet(false);
    setAlarmTimeLeft(null);
  };
  
  useEffect(() => {
    // If there's no appointment, redirect to booking page
    if (!appointment && !isLoading) {
      console.log("No appointment data found, redirecting to booking page");
      navigate('/book-appointment');
      return;
    }
    
    // Scroll the confirmation card into view
    if (printRef.current) {
      printRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appointment, navigate, isLoading]);

  // Generate Google Calendar event URL
  const getGoogleCalendarUrl = () => {
    if (!appointment) return '#';
    
    // Parse date and time to create start and end times
    const [year, month, day] = appointment.appointmentDate.split('-').map(num => parseInt(num));
    const [hour, minute] = appointment.appointmentTime.split(':').map(num => parseInt(num));
    
    // Create Date objects for start and end (appointments last 30 minutes)
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(year, month - 1, day, hour, minute + 30);
    
    // Format dates for Google Calendar URL
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    // Create event details
    const details = {
      text: `Appointment with ${appointment.doctorName}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Patient: ${appointment.patientName}
Age/Gender: ${appointment.patientAge}/${appointment.patientGender}
Token Number: ${appointment.tokenNumber}
Please arrive 15 minutes before your appointment.`,
      location: "Kumbala Cooperative Hospital, Kasaragod",
      reminders: "DISPLAY=15",
    };
    
    // Build Google Calendar URL
    const url = new URL('https://www.google.com/calendar/render?action=TEMPLATE');
    url.searchParams.append('text', details.text);
    url.searchParams.append('dates', details.dates);
    url.searchParams.append('details', details.details);
    url.searchParams.append('location', details.location);
    url.searchParams.append('sf', 'true');
    url.searchParams.append('output', 'xml');
    
    return url.toString();
  };

  // Handle showing calendar instructions
  const handleCalendarClick = () => {
    setShowCalendarInstructions(true);
    window.open(getGoogleCalendarUrl(), '_blank');
  };

  // Handle downloading the token as PDF
  const handleDownloadPDF = async () => {
    if (!printRef.current || !appointment) return;
    
    try {
      setIsPdfGenerating(true);
      
      // Create a clean version of the card for PDF export
      const pdfContent = `
        <div style="
          width: 800px;
          padding: 40px;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
          background-color: white;
        ">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">Kumbala Cooperative Hospital</h1>
            <p style="color: #666; font-size: 16px; margin: 0;">Appointment Confirmation</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #666; text-transform: uppercase; margin-bottom: 5px;">YOUR TOKEN NUMBER</p>
            <p style="font-size: 72px; font-weight: bold; color: #1e40af; margin: 0;">${appointment.tokenNumber}</p>
          </div>
          
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
          ">
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Patient Name</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${appointment.patientName}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Age / Gender</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${appointment.patientAge} / ${appointment.patientGender}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Doctor</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${appointment.doctorName}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Date & Time</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} at ${appointment.appointmentTime}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px;">Please arrive 15 minutes before your scheduled appointment time.</p>
          </div>
        </div>
      `;
      
      // Create a temporary container to render the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = pdfContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);
      
      // Convert the container to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher resolution
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      
      // Clean up the temporary container
      document.body.removeChild(tempContainer);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate the width and height for the PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download the PDF
      pdf.save(`Appointment_Token_${appointment.tokenNumber}.pdf`);
      
      setIsPdfGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsPdfGenerating(false);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  // Handle printing the token
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print your token');
      return;
    }
    
    const printContent = `
      <html>
        <head>
          <title>Appointment Token - Kumbala Cooperative Hospital</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .card {
              border: 2px solid #1e40af;
              border-radius: 12px;
              padding: 20px;
              max-width: 500px;
              margin: 0 auto;
            }
            .hospital-name {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .token-number {
              text-align: center;
              font-size: 36px;
              font-weight: bold;
              margin: 20px 0;
              color: #1e40af;
            }
            .label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 4px;
            }
            .value {
              font-weight: 600;
              margin-bottom: 12px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="hospital-name">Kumbala Cooperative Hospital, Kasaragod</div>
            <div class="token-number">Token ${appointment?.tokenNumber}</div>
            <div class="grid">
              <div>
                <div class="label">Patient Name</div>
                <div class="value">${appointment?.patientName}</div>
              </div>
              <div>
                <div class="label">Age / Gender</div>
                <div class="value">${appointment?.patientAge} / ${appointment?.patientGender}</div>
              </div>
              <div>
                <div class="label">Doctor</div>
                <div class="value">${appointment?.doctorName}</div>
              </div>
              <div>
                <div class="label">Date</div>
                <div class="value">${appointment?.appointmentDate}</div>
              </div>
              <div>
                <div class="label">Time</div>
                <div class="value">${appointment?.appointmentTime}</div>
              </div>
            </div>
            <div class="footer">Please arrive 15 minutes before your scheduled appointment time.</div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hospital-700 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your appointment details...</p>
        </div>
      </div>
    );
  }

  // If there's no appointment data, show a message
  if (!appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-hospital-700">No Appointment Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your appointment details. Please try booking again.
          </p>
          <Button asChild className="w-full">
            <Link to="/book-appointment">Book an Appointment</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Format the date to be more readable
  const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Token Card - Printable Section */}
      <div ref={printRef} className="w-full max-w-xl mx-auto mb-8">
        <Card className="border-2 border-hospital-300 p-8 shadow-lg bg-white">
          <div className="text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto bg-hospital-50 rounded-full mb-6">
              <svg className="w-12 h-12 text-hospital-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-hospital-700">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your appointment has been confirmed at Kumbala Cooperative Hospital.
            </p>
          </div>
          
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 uppercase font-semibold">YOUR TOKEN NUMBER</p>
            <p className="text-7xl font-bold text-hospital-600 my-4">{appointment.tokenNumber}</p>
            <div className="bg-hospital-50 text-hospital-700 inline-block px-4 py-2 rounded-full text-sm font-medium">
              {formattedDate} at {appointment.appointmentTime}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-8">
            <div>
              <p className="text-gray-500 text-sm font-medium">Patient Name</p>
              <p className="font-semibold text-lg">{appointment.patientName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Age / Gender</p>
              <p className="font-semibold text-lg">{appointment.patientAge} / {appointment.patientGender}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Doctor</p>
              <p className="font-semibold text-lg">{appointment.doctorName}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Please arrive 15 minutes before your scheduled appointment time.
          </div>
          
          <div className="mt-4 text-center text-hospital-700 font-bold">
            Kumbala Cooperative Hospital, Kasaragod
          </div>
        </Card>
      </div>
      
      {/* Automatic Alarm Card */}
      <Card className="p-4 mb-6 border-l-4 border-l-purple-500 max-w-xl w-full bg-purple-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-700" />
              Appointment Reminder
            </h3>
            {notificationPermission === 'granted' ? (
              alarmSet ? (
                <div>
                  <p className="text-sm text-purple-700 mb-1">
                    <span className="font-semibold">Automatic reminder set!</span> You'll receive a notification 15 minutes before your appointment.
                  </p>
                  {alarmTimeLeft && (
                    <p className="text-xs text-purple-600">
                      Status: {alarmTimeLeft}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-purple-700">
                  You'll receive a notification 15 minutes before your appointment.
                </p>
              )
            ) : (
              <p className="text-sm text-purple-700">
                Enable notifications to get an automatic reminder 15 minutes before your appointment.
              </p>
            )}
          </div>
          
          {notificationPermission !== 'granted' ? (
            <Button 
              onClick={requestNotificationPermission} 
              variant="outline"
              className="text-purple-700 border-purple-300 hover:bg-purple-100"
            >
              Enable Reminders
            </Button>
          ) : alarmSet ? (
            <Button 
              onClick={cancelAlarm}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 flex items-center"
              size="sm"
            >
              <BellOff className="h-4 w-4 mr-1" />
              Cancel Reminder
            </Button>
          ) : (
            <Button 
              onClick={setupAutomaticAlarm}
              variant="outline"
              className="text-purple-700 border-purple-300 hover:bg-purple-100"
            >
              Set Reminder
            </Button>
          )}
        </div>
      </Card>
      
      {/* Google Calendar Instructions */}
      {showCalendarInstructions && (
        <Card className="p-4 mb-6 border-l-4 border-l-blue-500 max-w-xl w-full bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Get Appointment Reminders</h3>
          <p className="text-sm text-blue-700 mb-3">
            We've opened Google Calendar for you. Follow these steps to get reminders:
          </p>
          <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-1">
            <li>Click "Add to Calendar" on the Google Calendar page</li>
            <li>Go to the event details and click "Edit"</li>
            <li>Add a notification by clicking "Add notification"</li>
            <li>Select when you want to be reminded (15 minutes, 1 hour, 1 day)</li>
            <li>Save the event</li>
          </ol>
          <p className="text-sm text-blue-700 mt-3">
            You'll receive notifications based on your Google Calendar settings.
          </p>
          <Button onClick={() => setShowCalendarInstructions(false)} variant="ghost" size="sm" className="mt-2 text-blue-700">
            Close Instructions
          </Button>
        </Card>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
        <Button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700"
          size="lg"
        >
          <Printer className="h-5 w-5" />
          Print Token
        </Button>
        
        <Button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-hospital-700 hover:bg-hospital-800"
          size="lg"
          disabled={isPdfGenerating}
        >
          <Download className="h-5 w-5" />
          {isPdfGenerating ? "Generating PDF..." : "Download as PDF"}
        </Button>
        
        <Button 
          onClick={handleCalendarClick}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Calendar className="h-5 w-5" />
          Add to Google Calendar
        </Button>
      </div>
      
      <div className="mt-6 print:hidden">
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Add global type for the alarm timeout ID
declare global {
  interface Window {
    alarmTimeoutId: any;
  }
}

export default ConfirmAppointment; 