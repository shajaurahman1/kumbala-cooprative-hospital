
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useAppointment } from '@/context/AppointmentContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const DateTimeSelection: React.FC = () => {
  const { 
    selectedDoctor, 
    selectedDate, 
    setSelectedDate, 
    timeSlots, 
    selectedTime, 
    setSelectedTime 
  } = useAppointment();

  if (!selectedDoctor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2 text-hospital-700">Select Date & Time</h2>
        <p className="text-gray-600">
          Choose an available date and time slot for your appointment with {selectedDoctor.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-hospital-700 font-medium mb-4">Select a Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md p-3 pointer-events-auto"
            disabled={(date) => {
              // Disable past dates
              return date < new Date(new Date().setHours(0, 0, 0, 0));
            }}
          />
        </div>

        <div>
          <h3 className="text-hospital-700 font-medium mb-4">Available Time Slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
          
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  disabled={!slot.available}
                  className={`flex items-center justify-center gap-2 ${!slot.available ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedTime(slot.time)}
                >
                  <Clock className="h-4 w-4" />
                  {slot.time}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No available time slots for this date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
