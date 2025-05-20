
import React from 'react';
import { useAppointment } from '@/context/AppointmentContext';
import { Card } from '@/components/ui/card';
import { Doctor } from '@/types';

const DoctorSelection: React.FC = () => {
  const { doctors, selectedDoctor, setSelectedDoctor } = useAppointment();

  const selectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2 text-hospital-700">Select a Doctor</h2>
        <p className="text-gray-600">
          Please choose a doctor from our team of specialists to proceed with your appointment booking.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className={`cursor-pointer transition-all duration-300 overflow-hidden ${
              selectedDoctor?.id === doctor.id
                ? 'border-2 border-hospital-500 shadow-lg'
                : 'border border-gray-200 hover:border-hospital-300 hover:shadow-md'
            }`}
            onClick={() => selectDoctor(doctor)}
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-hospital-700">{doctor.name}</h3>
              <p className="text-gray-500 text-sm">{doctor.specialization}</p>
              <div className="mt-2">
                <p className="text-xs text-gray-600 font-medium">Working Hours:</p>
                {doctor.workingHours.map((hours, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    {hours.start} - {hours.end}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoctorSelection;
