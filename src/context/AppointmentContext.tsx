
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

// Mock function to get appointments from "Google Sheets"
const getAppointmentsFromGoogleSheets = async (): Promise<Appointment[]> => {
  // In a real app, this would be an API call to Google Sheets
  // For now, we'll use localStorage to simulate persistence
  const storedAppointments = localStorage.getItem('appointments');
  return storedAppointments ? JSON.parse(storedAppointments) : [];
};

// Mock function to save appointment to "Google Sheets"
const saveAppointmentToGoogleSheets = async (appointment: Appointment): Promise<Appointment> => {
  // In a real app, this would be an API call to Google Sheets
  // For now, we'll use localStorage to simulate persistence
  const appointments = await getAppointmentsFromGoogleSheets();
  const newAppointment = {
    ...appointment,
    id: `appointment-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('appointments', JSON.stringify([...appointments, newAppointment]));
  return newAppointment;
};

// Generate time slots for a doctor on a specific date
const generateTimeSlots = (doctor: Doctor, date: Date, appointments: Appointment[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dateStr = date.toISOString().split('T')[0];

  doctor.workingHours.forEach(({ start, end }) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0);

    // Generate slots at 30-minute intervals
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Check if slot is available (less than 4 appointments for this doctor at this time)
      const existingAppointments = appointments.filter(
        app => app.doctorId === doctor.id &&
              app.appointmentDate.split('T')[0] === dateStr &&
              app.appointmentTime === timeStr
      );

      slots.push({
        time: timeStr,
        available: existingAppointments.length < 4
      });

      // Add 30 minutes
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
  });

  return slots;
};

// Calculate token number for a new appointment
const calculateTokenNumber = (doctor: Doctor, date: Date, time: string, appointments: Appointment[]): number => {
  const dateStr = date.toISOString().split('T')[0];
  
  const existingAppointments = appointments.filter(
    app => app.doctorId === doctor.id &&
           app.appointmentDate.split('T')[0] === dateStr &&
           app.appointmentTime === time
  );
  
  return existingAppointments.length + 1;
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
    if (!selectedDoctor || !selectedTime) return null;

    const tokenNumber = calculateTokenNumber(
      selectedDoctor, 
      selectedDate, 
      selectedTime,
      appointments
    );

    const newAppointment: Appointment = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientName: appointmentData.patientName || "",
      patientAge: appointmentData.patientAge || 0,
      patientPhone: appointmentData.patientPhone || "",
      patientGender: appointmentData.patientGender || "other",
      problem: appointmentData.problem || "",
      department: selectedDoctor.department,
      appointmentDate: selectedDate.toISOString(),
      appointmentTime: selectedTime,
      tokenNumber: tokenNumber,
      createdAt: new Date().toISOString()
    };

    try {
      const savedAppointment = await saveAppointmentToGoogleSheets(newAppointment);
      setAppointments(prevAppointments => [...prevAppointments, savedAppointment]);
      setNewAppointment(savedAppointment);
      return savedAppointment;
    } catch (error) {
      console.error("Error booking appointment:", error);
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
