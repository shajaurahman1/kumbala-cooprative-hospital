import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

// IMPORTANT: Update this with the URL from your Apps Script deployment
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbw2lDK8fZy8EN7kYyGrMClQlrz3pMieZzEd31VpnOlMMGHT1kfp5ulTkSr36iUHpwL3/exec";

// Define doctor available time slots (morning and afternoon)
const DOCTOR_TIME_SLOTS = {
  morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
  afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']
};

// Map for doctor token prefixes
const DOCTOR_TOKEN_PREFIXES = {
  'Dr. Sarah Smith': 'S',
  'Dr. Michael Johnson': 'M',
  'Dr. Neha Patel': 'N',
  'Dr. James Wilson': 'J',
  'Dr. Li Chen': 'L',
  'Dr. Robert Brown': 'R'
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [setReminder, setSetReminder] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<{[key: string]: string[]}>({});
  const [doctorTokens, setDoctorTokens] = useState<{[key: string]: number}>({});

  // Available doctors
  const doctors = [
    { id: 'dr-smith', name: 'Dr. Sarah Smith', department: 'Cardiology' },
    { id: 'dr-johnson', name: 'Dr. Michael Johnson', department: 'Orthopedics' },
    { id: 'dr-patel', name: 'Dr. Neha Patel', department: 'Pediatrics' },
    { id: 'dr-wilson', name: 'Dr. James Wilson', department: 'Neurology' },
    { id: 'dr-chen', name: 'Dr. Li Chen', department: 'Gynecology' },
    { id: 'dr-brown', name: 'Dr. Robert Brown', department: 'General Medicine' }
  ];

  // Fetch booked appointments when component loads
  useEffect(() => {
    const fetchBookedAppointments = async () => {
      try {
        const response = await fetch(GOOGLE_SHEETS_API_URL);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 1) {
            // Skip the header row and process the appointments
            const appointments = data.slice(1).reduce((acc: {[key: string]: string[]}, row: any) => {
              const doctor = row[3] || '';
              const date = row[4] || '';
              const time = row[5] || '';
              
              if (doctor && date && time) {
                const key = `${doctor}-${date}`;
                if (!acc[key]) {
                  acc[key] = [];
                }
                acc[key].push(time);
              }
              
              return acc;
            }, {});
            
            // Also track the tokens per doctor per date
            const tokens = data.slice(1).reduce((acc: {[key: string]: number}, row: any) => {
              const doctor = row[3] || '';
              const date = row[4] || '';
              const token = row[6] || '';
              
              if (doctor && date && token) {
                // Extract the token number from the format "X#" (e.g., "S1", "L2")
                const tokenNumber = parseInt(token.substring(1));
                const doctorDateKey = `${doctor}-${date}`;
                
                // Keep track of highest token number for each doctor on each date
                if (!acc[doctorDateKey] || tokenNumber > acc[doctorDateKey]) {
                  acc[doctorDateKey] = tokenNumber;
                }
              }
              
              return acc;
            }, {});
            
            setBookedAppointments(appointments);
            setDoctorTokens(tokens);
          }
        }
      } catch (error) {
        console.error('Error fetching booked appointments:', error);
      }
    };
    
    fetchBookedAppointments();
  }, []);

  // Update available times when doctor or date changes
  useEffect(() => {
    if (doctorName && appointmentDate) {
      // Create key to look up booked appointments
      const key = `${doctorName}-${appointmentDate}`;
      const bookedTimes = bookedAppointments[key] || [];
      
      // Combine all possible time slots
      const allSlots = [...DOCTOR_TIME_SLOTS.morning, ...DOCTOR_TIME_SLOTS.afternoon];
      
      // Filter out already booked times
      const available = allSlots.filter(time => !bookedTimes.includes(time));
      
      // If all slots are booked, inform the user
      if (available.length === 0) {
        setErrorMessage('All appointments for this doctor on this date are booked. Please select another date.');
        setAvailableTimes([]);
        setAppointmentTime('');
      } else {
        setErrorMessage('');
        setAvailableTimes(available);
        
        // Auto-select the first available time slot
        setAppointmentTime(available[0]);
      }
    } else {
      setAvailableTimes([]);
      setAppointmentTime('');
    }
  }, [doctorName, appointmentDate, bookedAppointments]);

  // Set browser reminder notification
  const setAppointmentReminder = (date: string, time: string, doctor: string, token: string) => {
    if (!setReminder) return;
    
    try {
      // Parse appointment time
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(hours, minutes, 0);
      
      // Set reminder time to 15 minutes before appointment
      const reminderTime = new Date(appointmentDateTime.getTime() - 15 * 60 * 1000);
      
      // Create calendar event data for the appointment
      const eventData = {
        title: `Appointment with ${doctor}`,
        description: `Token: ${token}\nPhone: ${phoneNumber}`,
        startTime: appointmentDateTime.toISOString(),
        reminderMinutes: 15
      };
      
      // Store the reminder data in localStorage
      localStorage.setItem('appointmentReminder', JSON.stringify(eventData));
      
      // If the appointment is today, set up a browser notification
      const today = new Date();
      if (appointmentDateTime.toDateString() === today.toDateString()) {
        const notifyInMs = reminderTime.getTime() - today.getTime();
        if (notifyInMs > 0) {
          setTimeout(() => {
            // Request notification permission if needed
            if (Notification.permission !== "granted") {
              Notification.requestPermission();
            }
            
            // Create notification if permission granted
            if (Notification.permission === "granted") {
              new Notification("Appointment Reminder", {
                body: `Your appointment with ${doctor} is in 15 minutes. Token: ${token}`,
                icon: "/favicon.ico"
              });
            }
          }, notifyInMs);
        }
      }
    } catch (error) {
      console.error("Error setting notification reminder:", error);
    }
  };

  // Direct submission to Google Sheets
  const submitDirectToGoogleSheets = async (data: {
    name: string;
    age: string;
    gender: string;
    doctor: string;
    date: string;
    time: string;
    token: string;
    phone?: string;
    reminder?: string;
  }) => {
    return new Promise<boolean>((resolve, reject) => {
      // Create a direct form post element
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_SHEETS_API_URL;
      form.target = '_blank';
      document.body.appendChild(form);
      
      // Add data as hidden form fields
      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // Create an iframe to handle the response
      const iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Set the form target to the iframe
      form.target = 'hidden_iframe';
      
      // Submit the form and handle success/failure
      form.submit();
      
      // Consider it successful after a delay
      setTimeout(() => {
        // Clean up
        try {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        } catch (e) {
          console.error("Cleanup error:", e);
        }
        resolve(true);
      }, 2000);
    });
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!patientName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    
    if (!patientAge || parseInt(patientAge) <= 0) {
      setErrorMessage('Please enter a valid age');
      return;
    }

    if (!doctorName) {
      setErrorMessage('Please select a doctor');
      return;
    }

    if (!appointmentDate) {
      setErrorMessage('Please select a date');
      return;
    }

    if (!appointmentTime) {
      setErrorMessage('Please select a time');
      return;
    }
    
    // Validate phone number if reminder notification is requested
    if (setReminder) {
      if (!phoneNumber || phoneNumber.trim().length < 10) {
        setErrorMessage('Please enter a valid phone number for contact purposes');
        return;
      }
    }
    
    // Double-check if time slot is still available (prevents race conditions)
    const key = `${doctorName}-${appointmentDate}`;
    const bookedTimes = bookedAppointments[key] || [];
    if (bookedTimes.includes(appointmentTime)) {
      setErrorMessage('This time slot has just been booked by someone else. Please select another time.');
      // Refresh available times
      const allSlots = [...DOCTOR_TIME_SLOTS.morning, ...DOCTOR_TIME_SLOTS.afternoon];
      const available = allSlots.filter(time => !bookedTimes.includes(time));
      setAvailableTimes(available);
      if (available.length > 0) {
        setAppointmentTime(available[0]);
      }
      return;
    }
    
    // Clear error and set submitting state
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      // Get doctor's token prefix (or use first letter if not defined)
      const doctorPrefix = DOCTOR_TOKEN_PREFIXES[doctorName] || doctorName.charAt(0).toUpperCase();
      
      // Get last token number for this doctor on this date
      const doctorDateKey = `${doctorName}-${appointmentDate}`;
      const lastTokenNumber = doctorTokens[doctorDateKey] || 0;
      
      // Increment token number
      const nextTokenNumber = lastTokenNumber + 1;
      
      // Create token in format "X#" (e.g., "S1", "L2")
      const tokenCode = `${doctorPrefix}${nextTokenNumber}`;
      
      // Update local state to prevent duplicate tokens
      setDoctorTokens(prev => ({
        ...prev,
        [doctorDateKey]: nextTokenNumber
      }));
      
      // Update local state to prevent double booking
      setBookedAppointments(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), appointmentTime]
      }));
      
      // If reminder is enabled, set up the notification
      if (setReminder) {
        setAppointmentReminder(appointmentDate, appointmentTime, doctorName, tokenCode);
      }
      
      // Prepare data for submission
      const appointmentData: any = {
        name: patientName,
        age: patientAge,
        gender: patientGender,
        doctor: doctorName,
        date: appointmentDate,
        time: appointmentTime,
        token: tokenCode
      };
      
      // Add reminder info if enabled
      if (setReminder && phoneNumber) {
        appointmentData.phone = phoneNumber;
        appointmentData.reminder = "yes";
      }
      
      // Store in localStorage for the confirmation page
      localStorage.setItem('currentAppointment', JSON.stringify({
        patientName,
        patientAge: parseInt(patientAge),
        patientGender,
        doctorName,
        appointmentDate,
        appointmentTime,
        tokenNumber: tokenCode,
        phoneNumber: setReminder ? phoneNumber : '',
        reminderSet: setReminder,
        createdAt: new Date().toISOString()
      }));
      
      console.log("Submitting data:", appointmentData);
      
      // Submit directly to Google Sheets
      await submitDirectToGoogleSheets(appointmentData);
      
      // Navigation happens after form submission
      console.log("Form submitted successfully");
      navigate('/confirm-appointment');
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      setErrorMessage('Failed to save appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-hospital-700">Book Your Appointment</h1>
        <p className="text-gray-600">
          Schedule a visit with our healthcare professionals at Kumbala Cooperative Hospital.
        </p>
      </div>

      <Card className="p-6 shadow-md">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
            {errorMessage}
          </div>
        )}
        
        {isSubmitting && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
            Processing your appointment... Please wait.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patientName">Full Name</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="patientAge">Age</Label>
              <Input
                id="patientAge"
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Enter your age"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="patientGender">Gender</Label>
              <select
                id="patientGender"
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="reminderOpt" 
                  checked={setReminder} 
                  onCheckedChange={(checked) => setSetReminder(checked === true)}
                />
                <Label htmlFor="reminderOpt" className="cursor-pointer">
                  Set a 15-minute reminder before appointment (optional)
                </Label>
              </div>
              
              {setReminder && (
                <div>
                  <Label htmlFor="phoneNumber">Contact Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for appointment reminders
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="doctorName">Select Doctor</Label>
              <select
                id="doctorName"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a doctor --</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name} - {doctor.department}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="appointmentDate">Appointment Date</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={getTodayDate()}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="appointmentTime">Appointment Time</Label>
              {availableTimes.length > 0 ? (
                <div className="mt-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Available time slots:
                  </p>
                  <select
                    id="timeSelect"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {availableTimes.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Please select your preferred time slot from available options.
                  </p>
                </div>
              ) : (
                doctorName && appointmentDate ? (
                  <div className="mt-1 p-3 border border-amber-200 bg-amber-50 rounded-md">
                    <p className="text-sm text-amber-700">
                      No available time slots for this doctor on this date. Please select another date.
                    </p>
                  </div>
                ) : (
                  <div className="mt-1 p-3 border border-gray-200 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      Please select a doctor and date to see available time slots.
                    </p>
                  </div>
                )
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting || availableTimes.length === 0}>
              {isSubmitting ? "Processing..." : "Submit Appointment Request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BookAppointment;
