
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppointment } from '@/context/AppointmentContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

const ThankYou = () => {
  const { newAppointment } = useAppointment();

  // If there's no appointment data, redirect to home
  if (!newAppointment) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4 text-hospital-700">No Appointment Found</h1>
        <p className="text-gray-600 mb-6">
          We couldn't find your appointment details. Please try booking again.
        </p>
        <Button asChild>
          <Link to="/book-appointment">Book an Appointment</Link>
        </Button>
      </div>
    );
  }

  const appointmentDate = new Date(newAppointment.appointmentDate);

  return (
    <div className="container py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-hospital-700">Appointment Confirmed!</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Thank you for choosing Kumbala Cooperative Hospital. Your appointment has been successfully booked.
        </p>
      </div>

      <Card className="border border-hospital-100 p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-hospital-700 pb-2 border-b">Appointment Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-gray-500 text-sm">Token Number</p>
            <p className="font-semibold text-2xl text-hospital-600">#{newAppointment.tokenNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Doctor</p>
            <p className="font-medium">{newAppointment.doctorName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Department</p>
            <p className="font-medium">{newAppointment.department}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Date & Time</p>
            <p className="font-medium">
              {format(appointmentDate, 'MMMM d, yyyy')} at {newAppointment.appointmentTime}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Patient Name</p>
            <p className="font-medium">{newAppointment.patientName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Patient Contact</p>
            <p className="font-medium">{newAppointment.patientPhone}</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <p className="text-hospital-700">
            <span className="font-semibold">Important:</span> Please arrive 15 minutes before your scheduled appointment time. Don't forget to bring your ID and insurance information.
          </p>
        </div>
      </Card>

      <div className="mt-8 flex justify-center gap-4">
        <Button asChild variant="outline">
          <Link to="/">Back to Home</Link>
        </Button>
        <Button asChild>
          <Link to="/book-appointment">Book Another Appointment</Link>
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
