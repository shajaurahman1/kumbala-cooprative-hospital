import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppointment } from '@/context/AppointmentContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Check, Printer } from 'lucide-react';

const ThankYou = () => {
  const { newAppointment } = useAppointment();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [redirectTimeout, setRedirectTimeout] = useState<number | null>(null);
  
  useEffect(() => {
    // Scroll the confirmation card into view
    if (printRef.current) {
      printRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // If there's no appointment, redirect to booking page after a delay
    if (!newAppointment) {
      console.log("No appointment data found in ThankYou page");
      const timeout = window.setTimeout(() => {
        console.log("Redirecting to booking page due to missing appointment data");
        navigate('/book-appointment');
      }, 3000);
      
      setRedirectTimeout(timeout);
      
      return () => {
        if (redirectTimeout) {
          window.clearTimeout(redirectTimeout);
        }
      };
    }
  }, [newAppointment, navigate, redirectTimeout]);

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
            <div class="token-number">Token #${newAppointment?.tokenNumber}</div>
            <div class="grid">
              <div>
                <div class="label">Patient Name</div>
                <div class="value">${newAppointment?.patientName}</div>
              </div>
              <div>
                <div class="label">Age / Gender</div>
                <div class="value">${newAppointment?.patientAge} / ${newAppointment?.patientGender}</div>
              </div>
              <div>
                <div class="label">Doctor</div>
                <div class="value">${newAppointment?.doctorName}</div>
              </div>
              <div>
                <div class="label">Department</div>
                <div class="value">${newAppointment?.department}</div>
              </div>
              <div>
                <div class="label">Date</div>
                <div class="value">${newAppointment ? format(new Date(newAppointment.appointmentDate), 'MMMM d, yyyy') : ''}</div>
              </div>
              <div>
                <div class="label">Time</div>
                <div class="value">${newAppointment?.appointmentTime}</div>
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

  // If there's no appointment data, show a message with countdown
  if (!newAppointment) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4 text-hospital-700">No Appointment Found</h1>
        <p className="text-gray-600 mb-6">
          We couldn't find your appointment details. You will be redirected to the booking page in a few seconds.
        </p>
        <Button asChild>
          <Link to="/book-appointment">Book an Appointment Now</Link>
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

      {/* Printable Token Card */}
      <div ref={printRef} className="mb-8">
        <Card className="border-2 border-hospital-300 p-6 shadow-md bg-white">
          <div className="text-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-hospital-700">Kumbala Cooperative Hospital, Kasaragod</h2>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">YOUR TOKEN NUMBER</p>
            <p className="text-5xl font-bold text-hospital-600 my-3">#{newAppointment.tokenNumber}</p>
            <div className="bg-hospital-50 text-hospital-700 inline-block px-4 py-2 rounded-full text-sm font-medium">
              {format(appointmentDate, 'MMMM d, yyyy')} at {newAppointment.appointmentTime}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-6">
            <div>
              <p className="text-gray-500 text-sm">Patient Name</p>
              <p className="font-medium">{newAppointment.patientName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Age / Gender</p>
              <p className="font-medium">{newAppointment.patientAge} / {newAppointment.patientGender}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Doctor</p>
              <p className="font-medium">{newAppointment.doctorName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Department</p>
              <p className="font-medium">{newAppointment.department}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Please arrive 15 minutes before your scheduled appointment time.
          </div>
        </Card>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Token
        </Button>
        
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
