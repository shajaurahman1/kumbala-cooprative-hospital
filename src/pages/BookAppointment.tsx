import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// IMPORTANT: Update this with the URL from your Apps Script deployment
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbw2lDK8fZy8EN7kYyGrMClQlrz3pMieZzEd31VpnOlMMGHT1kfp5ulTkSr36iUHpwL3/exec";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('male');
  const [doctorName, setDoctorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Available doctors
  const doctors = [
    { id: 'dr-smith', name: 'Dr. Sarah Smith', department: 'Cardiology' },
    { id: 'dr-johnson', name: 'Dr. Michael Johnson', department: 'Orthopedics' },
    { id: 'dr-patel', name: 'Dr. Neha Patel', department: 'Pediatrics' },
    { id: 'dr-wilson', name: 'Dr. James Wilson', department: 'Neurology' },
    { id: 'dr-chen', name: 'Dr. Li Chen', department: 'Gynecology' },
    { id: 'dr-brown', name: 'Dr. Robert Brown', department: 'General Medicine' }
  ];

  // Direct submission to Google Sheets
  const submitDirectToGoogleSheets = async (data: {
    name: string;
    age: string;
    gender: string;
    doctor: string;
    date: string;
    time: string;
    token: string;
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
    
    // Clear error and set submitting state
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      // Generate token number
      const tokenNumber = Math.floor(Math.random() * 100) + 1;
      
      // Prepare data for submission
      const appointmentData = {
        name: patientName,
        age: patientAge,
        gender: patientGender,
        doctor: doctorName,
        date: appointmentDate,
        time: appointmentTime,
        token: tokenNumber.toString()
      };
      
      // Store in localStorage for the confirmation page
      localStorage.setItem('currentAppointment', JSON.stringify({
        patientName,
        patientAge: parseInt(patientAge),
        patientGender,
        doctorName,
        appointmentDate,
        appointmentTime,
        tokenNumber,
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
              <select
                id="appointmentTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select time --</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Submit Appointment Request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BookAppointment;
