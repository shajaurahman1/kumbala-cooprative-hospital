import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Home, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AppointmentData {
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string | number;
  createdAt: string;
}

const ConfirmAppointment = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  // Load appointment data from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem('currentAppointment');
      if (data) {
        setAppointment(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // If there's no appointment, redirect to booking page
    if (!appointment && !isLoading) {
      console.log("No appointment data found, redirecting to booking page");
      navigate('/book-appointment');
      return;
    }
    
    // Scroll the confirmation card into view
    if (printRef.current) {
      printRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appointment, navigate, isLoading]);

  // Handle downloading the token as PDF
  const handleDownloadPDF = async () => {
    if (!printRef.current || !appointment) return;
    
    try {
      setIsPdfGenerating(true);
      
      // Create a clean version of the card for PDF export
      const pdfContent = `
        <div style="
          width: 800px;
          padding: 40px;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
          background-color: white;
        ">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">Kumbala Cooperative Hospital</h1>
            <p style="color: #666; font-size: 16px; margin: 0;">Appointment Confirmation</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #666; text-transform: uppercase; margin-bottom: 5px;">YOUR TOKEN NUMBER</p>
            <p style="font-size: 72px; font-weight: bold; color: #1e40af; margin: 0;">${appointment.tokenNumber}</p>
          </div>
          
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
          ">
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Patient Name</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${appointment.patientName}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Age / Gender</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${appointment.patientAge} / ${appointment.patientGender}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Doctor</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${appointment.doctorName}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Date & Time</p>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} at ${appointment.appointmentTime}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px;">Please arrive 15 minutes before your scheduled appointment time.</p>
          </div>
        </div>
      `;
      
      // Create a temporary container to render the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = pdfContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);
      
      // Convert the container to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher resolution
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      
      // Clean up the temporary container
      document.body.removeChild(tempContainer);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate the width and height for the PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download the PDF
      pdf.save(`Appointment_Token_${appointment.tokenNumber}.pdf`);
      
      setIsPdfGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsPdfGenerating(false);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  // Handle printing the token
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
            <div class="token-number">Token ${appointment?.tokenNumber}</div>
            <div class="grid">
              <div>
                <div class="label">Patient Name</div>
                <div class="value">${appointment?.patientName}</div>
              </div>
              <div>
                <div class="label">Age / Gender</div>
                <div class="value">${appointment?.patientAge} / ${appointment?.patientGender}</div>
              </div>
              <div>
                <div class="label">Doctor</div>
                <div class="value">${appointment?.doctorName}</div>
              </div>
              <div>
                <div class="label">Date</div>
                <div class="value">${appointment?.appointmentDate}</div>
              </div>
              <div>
                <div class="label">Time</div>
                <div class="value">${appointment?.appointmentTime}</div>
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

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hospital-700 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your appointment details...</p>
        </div>
      </div>
    );
  }

  // If there's no appointment data, show a message
  if (!appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-hospital-700">No Appointment Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your appointment details. Please try booking again.
          </p>
          <Button asChild className="w-full">
            <Link to="/book-appointment">Book an Appointment</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Format the date to be more readable
  const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Token Card - Printable Section */}
      <div ref={printRef} className="w-full max-w-xl mx-auto mb-8">
        <Card className="border-2 border-hospital-300 p-8 shadow-lg bg-white">
          <div className="text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto bg-hospital-50 rounded-full mb-6">
              <svg className="w-12 h-12 text-hospital-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-hospital-700">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your appointment has been confirmed at Kumbala Cooperative Hospital.
            </p>
          </div>
          
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 uppercase font-semibold">YOUR TOKEN NUMBER</p>
            <p className="text-7xl font-bold text-hospital-600 my-4">{appointment.tokenNumber}</p>
            <div className="bg-hospital-50 text-hospital-700 inline-block px-4 py-2 rounded-full text-sm font-medium">
              {formattedDate} at {appointment.appointmentTime}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-8">
            <div>
              <p className="text-gray-500 text-sm font-medium">Patient Name</p>
              <p className="font-semibold text-lg">{appointment.patientName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Age / Gender</p>
              <p className="font-semibold text-lg">{appointment.patientAge} / {appointment.patientGender}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Doctor</p>
              <p className="font-semibold text-lg">{appointment.doctorName}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Please arrive 15 minutes before your scheduled appointment time.
          </div>
          
          <div className="mt-4 text-center text-hospital-700 font-bold">
            Kumbala Cooperative Hospital, Kasaragod
          </div>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
        <Button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700"
          size="lg"
        >
          <Printer className="h-5 w-5" />
          Print Token
        </Button>
        
        <Button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-hospital-700 hover:bg-hospital-800"
          size="lg"
          disabled={isPdfGenerating}
        >
          <Download className="h-5 w-5" />
          {isPdfGenerating ? "Generating PDF..." : "Download as PDF"}
        </Button>
      </div>
      
      <div className="mt-6 print:hidden">
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ConfirmAppointment; 