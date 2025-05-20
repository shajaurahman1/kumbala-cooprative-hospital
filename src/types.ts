export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image: string;
  department: string;
  workingHours: {
    start: string; // e.g., "10:00"
    end: string; // e.g., "13:00"
  }[];
}

export interface TimeSlot {
  time: string; // e.g., "10:00"
  available: boolean;
}

export interface Appointment {
  id?: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientGender: "male" | "female" | "other";
  problem: string;
  department: string;
  appointmentDate: string; // ISO string
  appointmentTime: string; // e.g., "10:00"
  tokenNumber: string | number; // Updated to support both string and number formats
  createdAt: string; // ISO string
}

export type Gender = "male" | "female" | "other";
