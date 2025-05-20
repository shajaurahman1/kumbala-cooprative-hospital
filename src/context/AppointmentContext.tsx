import React, { createContext, useContext, useState, useEffect } from "react";
import { Doctor, Appointment, TimeSlot } from "../types";

// Sample doctors data - in a real app this would come from an API
const DOCTORS: Doctor[] = [
  {
    id: "dr-smith",
    name: "Dr. Sarah Smith",
    specialization: "Cardiologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070",
    department: "Cardiology",
    workingHours: [
      { start: "10:00", end: "13:00" },
      { start: "17:00", end: "20:00" }
    ]
  },
  {
    id: "dr-johnson",
    name: "Dr. Michael Johnson",
    specialization: "Orthopedic Surgeon",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964",
    department: "Orthopedics",
    workingHours: [
      { start: "09:00", end: "12:00" },
      { start: "16:00", end: "19:00" }
    ]
  },
  {
    id: "dr-patel",
    name: "Dr. Neha Patel",
    specialization: "Pediatrician",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974",
    department: "Pediatrics",
    workingHours: [
      { start: "11:00", end: "14:00" },
      { start: "18:00", end: "21:00" }
    ]
  },
  {
    id: "dr-wilson",
    name: "Dr. James Wilson",
    specialization: "Neurologist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070",
    department: "Neurology",
    workingHours: [
      { start: "08:00", end: "11:00" },
      { start: "15:00", end: "18:00" }
    ]
  },
  {
    id: "dr-chen",
    name: "Dr. Li Chen",
    specialization: "Gynecologist",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=1974",
    department: "Gynecology",
    workingHours: [
      { start: "09:30", end: "12:30" },
      { start: "16:30", end: "19:30" }
    ]
  },
  {
    id: "dr-brown",
    name: "Dr. Robert Brown",
    specialization: "General Practitioner",
    image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?q=80&w=1974",
    department: "General Medicine",
    workingHours: [
      { start: "10:30", end: "13:30" },
      { start: "17:30", end: "20:30" }
    ]
  }
];

// Update the Google Sheets API URL to the correct one from the user
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycby8Aivp-kBKg7iusPDnKMXQUQVOPLL-B-egkR2-lIY1zw9WcVp4-YvFdhAxUn45vSo-Dg/exec";

// Get appointments from Google Sheets
const getAppointmentsFromGoogleSheets = async (): Promise<Appointment[]> => {
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments from Google Sheets');
    }
    
    const data = await response.json();
    
    // Convert the data format from the Google Sheet to our Appointment type
    const appointments: Appointment[] = Array.isArray(data) ? data.slice(1).map((row: any, index) => {
      return {
        id: `appointment-${index}`,
        doctorId: row[3] || "",
        doctorName: row[3] || "",
        patientName: row[0] || "",
        patientAge: parseInt(row[1]) || 0,
        patientPhone: "",
        patientGender: row[2] || "other",
        problem: "",
        department: "",
        appointmentDate: row[4] || "",
        appointmentTime: row[5] || "",
        tokenNumber: parseInt(row[6]) || (index + 1),
        createdAt: new Date().toISOString()
      };
    }) : [];
    
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments from Google Sheets:", error);
    // Fallback to localStorage if API fails
    const storedAppointments = localStorage.getItem('appointments');
    return storedAppointments ? JSON.parse(storedAppointments) : [];
  }
};

// Save appointment to Google Sheets
const saveAppointmentToGoogleSheets = async (appointment: Appointment): Promise<Appointment> => {
  try {
    // First get all appointments to calculate the correct token number
    const allAppointments = await getAppointmentsFromGoogleSheets();
    
    // Filter appointments by doctor and date
    const matchingAppointments = allAppointments.filter(app => {
      const appDate = new Date(app.appointmentDate);
      const selectedDate = new Date(appointment.appointmentDate);
      
      return (
        app.doctorId === appointment.doctorId &&
        appDate.getFullYear() === selectedDate.getFullYear() &&
        appDate.getMonth() === selectedDate.getMonth() &&
        appDate.getDate() === selectedDate.getDate()
      );
    });
    
    // Calculate token number based on matching appointments
    const tokenNumber = matchingAppointments.length + 1;
    
    // Create appointment with token number
    const newAppointment = {
      ...appointment,
      id: `appointment-${Date.now()}`,
      tokenNumber: tokenNumber,
      createdAt: new Date().toISOString()
    };
    
    // Format data as expected by the Google Script
    const formData = new FormData();
    formData.append('name', newAppointment.patientName);
    formData.append('age', newAppointment.patientAge.toString());
    formData.append('gender', newAppointment.patientGender);
    formData.append('doctor', newAppointment.doctorName);
    formData.append('date', new Date(newAppointment.appointmentDate).toISOString().split('T')[0]);
    formData.append('time', newAppointment.appointmentTime);
    formData.append('token', tokenNumber.toString());
    
    // Post data to Google Sheets
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to save appointment to Google Sheets');
    }
    
    // Also save locally as backup
    const existingAppointments = localStorage.getItem('appointments');
    const appointments = existingAppointments ? JSON.parse(existingAppointments) : [];
    localStorage.setItem('appointments', JSON.stringify([...appointments, newAppointment]));
    
    return newAppointment;
  } catch (error) {
    console.error("Error saving appointment to Google Sheets:", error);
    
    // Fallback mechanism - store in localStorage only
    const existingAppointments = localStorage.getItem('appointments');
    const appointments = existingAppointments ? JSON.parse(existingAppointments) : [];
    
    // Calculate token locally
    const matchingAppointments = appointments.filter(app => {
      const appDate = new Date(app.appointmentDate);
      const selectedDate = new Date(appointment.appointmentDate);
      
      return (
        app.doctorId === appointment.doctorId &&
        appDate.getFullYear() === selectedDate.getFullYear() &&
        appDate.getMonth() === selectedDate.getMonth() &&
        appDate.getDate() === selectedDate.getDate()
      );
    });
    
    const newAppointment = {
      ...appointment,
      id: `appointment-${Date.now()}`,
      tokenNumber: matchingAppointments.length + 1,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('appointments', JSON.stringify([...appointments, newAppointment]));
    return newAppointment;
  }
};

// This function generates time slots for a selected doctor and date
const generateTimeSlots = (doctor: Doctor, date: Date, existingAppointments: Appointment[]): TimeSlot[] => {
  if (!doctor) return [];
  
  // Get all doctor's working hours and create slots in 30-minute intervals
  const slots: TimeSlot[] = [];
  
  // Only show slots that fall within the doctor's working hours
  doctor.workingHours.forEach(period => {
    const [startHour, startMinute] = period.start.split(':').map(Number);
    const [endHour, endMinute] = period.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    // Loop through and create 30-minute slots within the working hours
    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if the slot is already booked
      const isBooked = existingAppointments.some(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return (
          appointment.doctorId === doctor.id &&
          appointmentDate.getFullYear() === date.getFullYear() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getDate() === date.getDate() &&
          appointment.appointmentTime === timeString
        );
      });
      
      slots.push({
        time: timeString,
        available: !isBooked
      });
      
      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour++;
        currentMinute = 0;
      }
    }
  });
  
  // Sort slots by time
  return slots.sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
    return timeA[1] - timeB[1];
  });
};

// Function to calculate token number for an appointment
const calculateTokenNumber = (
  doctor: Doctor, 
  date: Date, 
  time: string,
  allAppointments: Appointment[]
): number => {
  // Get the number of appointments already scheduled for this doctor on this date
  const doctorAppointmentsOnDate = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    return (
      appointment.doctorId === doctor.id &&
      appointmentDate.getFullYear() === date.getFullYear() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getDate() === date.getDate()
    );
  });
  
  // Sort them by time
  const sortedAppointments = doctorAppointmentsOnDate.sort((a, b) => {
    const timeA = a.appointmentTime.split(':').map(Number);
    const timeB = b.appointmentTime.split(':').map(Number);
    if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
    return timeA[1] - timeB[1];
  });
  
  // Find the token number (position in sequence)
  const selectedTimeComponents = time.split(':').map(Number);
  let tokenNumber = 1;
  
  for (const appointment of sortedAppointments) {
    const appointmentTimeComponents = appointment.appointmentTime.split(':').map(Number);
    
    if (
      appointmentTimeComponents[0] < selectedTimeComponents[0] || 
      (appointmentTimeComponents[0] === selectedTimeComponents[0] && 
       appointmentTimeComponents[1] <= selectedTimeComponents[1])
    ) {
      tokenNumber++;
    }
  }
  
  return tokenNumber;
};

interface AppointmentContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  loading: boolean;
  selectedDoctor: Doctor | null;
  selectedDate: Date;
  selectedTime: string | null;
  timeSlots: TimeSlot[];
  newAppointment: Appointment | null;
  
  setSelectedDoctor: (doctor: Doctor | null) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string | null) => void;
  bookAppointment: (appointmentData: Partial<Appointment>) => Promise<Appointment | null>;
  resetAppointmentForm: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors] = useState<Doctor[]>(DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newAppointment, setNewAppointment] = useState<Appointment | null>(null);

  // Load appointments on initial render
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getAppointmentsFromGoogleSheets();
        setAppointments(data);
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, []);

  // Update time slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor) {
      const slots = generateTimeSlots(selectedDoctor, selectedDate, appointments);
      setTimeSlots(slots);
      setSelectedTime(null); // Reset selected time when doctor or date changes
    } else {
      setTimeSlots([]);
    }
  }, [selectedDoctor, selectedDate, appointments]);

  const bookAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment | null> => {
    console.log("bookAppointment called with data:", appointmentData);
    
    try {
      if (!selectedDoctor) {
        console.error("No doctor selected");
        return null;
      }
      
      // For direct booking without time selection, use the provided appointment data
      const useProvidedTime = appointmentData.appointmentTime && appointmentData.appointmentDate;
      
      if (!useProvidedTime && !selectedTime) {
        console.error("No time selected");
        return null;
      }

      // Use default values from selectedDoctor or provided values
      const appointmentDate = useProvidedTime ? 
        new Date(appointmentData.appointmentDate || '') : 
        selectedDate;
        
      const appointmentTime = useProvidedTime ? 
        appointmentData.appointmentTime : 
        selectedTime;
      
      // Calculate token based on existing appointments
      const tokenNumber = calculateTokenNumber(
        selectedDoctor, 
        appointmentDate,
        appointmentTime || "",
        appointments
      );

      console.log("Token number calculated:", tokenNumber);

      // Create the full appointment object
      const newAppointment: Appointment = {
        id: `appointment-${Date.now()}`,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientName: appointmentData.patientName || "",
        patientAge: appointmentData.patientAge || 0,
        patientPhone: appointmentData.patientPhone || "",
        patientGender: appointmentData.patientGender || "other",
        problem: appointmentData.problem || "",
        department: selectedDoctor.department,
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: appointmentTime || "",
        tokenNumber: tokenNumber,
        createdAt: new Date().toISOString()
      };

      console.log("New appointment object created:", newAppointment);

      try {
        // Save to Google Sheets
        console.log("Attempting to save to Google Sheets...");
        const savedAppointment = await saveAppointmentToGoogleSheets(newAppointment);
        console.log("Successfully saved to Google Sheets:", savedAppointment);
        
        // Update local state
        setAppointments(prevAppointments => [...prevAppointments, savedAppointment]);
        setNewAppointment(savedAppointment);
        return savedAppointment;
      } catch (error) {
        console.error("Error saving to Google Sheets:", error);
        
        // Fallback to local storage only
        console.log("Using fallback - local storage only");
        
        // Add to local storage as fallback
        const existingAppointments = localStorage.getItem('appointments');
        const localAppointments = existingAppointments ? JSON.parse(existingAppointments) : [];
        localStorage.setItem('appointments', JSON.stringify([...localAppointments, newAppointment]));
        
        // Still update the state for UI purposes
        setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
        setNewAppointment(newAppointment);
        return newAppointment;
      }
    } catch (error) {
      console.error("Error in bookAppointment:", error);
      return null;
    }
  };

  const resetAppointmentForm = () => {
    setSelectedDoctor(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
    setNewAppointment(null);
  };

  return (
    <AppointmentContext.Provider
      value={{
        doctors,
        appointments,
        loading,
        selectedDoctor,
        selectedDate,
        selectedTime,
        timeSlots,
        newAppointment,
        setSelectedDoctor,
        setSelectedDate,
        setSelectedTime,
        bookAppointment,
        resetAppointmentForm
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};
