
import React, { useState, useEffect } from 'react';
import { useAppointment } from '@/context/AppointmentContext';
import DoctorSelection from '@/components/DoctorSelection';
import DateTimeSelection from '@/components/DateTimeSelection';
import PatientForm from '@/components/PatientForm';
import { Card } from '@/components/ui/card';

const BookAppointment = () => {
  const { selectedDoctor, selectedTime, resetAppointmentForm } = useAppointment();
  const [step, setStep] = useState(1);

  // Reset form when component unmounts
  useEffect(() => {
    return () => {
      resetAppointmentForm();
    };
  }, [resetAppointmentForm]);

  // Move to the next step when doctor is selected
  useEffect(() => {
    if (selectedDoctor && step === 1) {
      setStep(2);
    }
  }, [selectedDoctor, step]);

  // Move to the next step when time is selected
  useEffect(() => {
    if (selectedTime && step === 2) {
      setStep(3);
    }
  }, [selectedTime, step]);

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-hospital-700">Book Your Appointment</h1>
        <p className="text-gray-600">
          Schedule a visit with our healthcare professionals at Kumbala Cooperative Hospital.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="hidden sm:flex items-center w-full">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div 
                className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  step >= i 
                    ? 'bg-hospital-500 text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i}
              </div>
              {i < 3 && (
                <div 
                  className={`h-1 flex-grow mx-2 ${
                    step > i ? 'bg-hospital-500' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="sm:hidden text-center w-full">
          <p className="text-lg font-medium text-hospital-700">
            {step === 1 && 'Choose Doctor'}
            {step === 2 && 'Select Date & Time'}
            {step === 3 && 'Complete Booking'}
          </p>
        </div>
      </div>

      <Card className="p-6 shadow-md">
        <div className={`${step === 1 ? 'block' : 'hidden'}`}>
          <DoctorSelection />
        </div>

        <div className={`${step === 2 ? 'block' : 'hidden'}`}>
          <DateTimeSelection />
        </div>

        <div className={`${step === 3 ? 'block' : 'hidden'}`}>
          <PatientForm />
        </div>
      </Card>
    </div>
  );
};

export default BookAppointment;
