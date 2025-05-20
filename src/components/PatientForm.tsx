import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointment } from '@/context/AppointmentContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const PatientForm: React.FC = () => {
  const { 
    selectedDoctor, 
    selectedDate, 
    selectedTime, 
    bookAppointment,
    resetAppointmentForm
  } = useAppointment();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patientPhone, setPatientPhone] = useState('');
  const [problem, setProblem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientData, setPatientData] = useState<{
    patientName: string;
    patientAge: string;
    patientGender: string;
  } | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve patient data from localStorage
    setLoadingData(true);
    const storedData = localStorage.getItem('patientData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setPatientData(parsedData);
      } catch (error) {
        console.error('Error parsing patient data from localStorage:', error);
        toast({
          title: "Data Error",
          description: "There was a problem loading your information. Please start again.",
          variant: "destructive",
        });
      }
    }
    setLoadingData(false);
  }, [toast]);

  const goBack = () => {
    // Reset the doctor selection to go back to the first step
    resetAppointmentForm();
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hospital-700"></div>
      </div>
    );
  }

  if (!selectedDoctor || !selectedTime) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">Please select a doctor and appointment time before proceeding.</p>
        <Button onClick={goBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">Your patient information is missing. Please start over from the first step.</p>
        <Button onClick={goBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!patientPhone || !problem) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        patientName: patientData.patientName,
        patientAge: parseInt(patientData.patientAge),
        patientPhone,
        patientGender: patientData.patientGender as any,
        problem,
      };

      console.log("Submitting appointment data:", appointmentData);
      
      const result = await bookAppointment(appointmentData);
      
      if (result) {
        // Clear localStorage after successful booking
        localStorage.removeItem('patientData');
        
        // Show success toast
        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been successfully booked.",
        });
        
        // Navigate to confirmation page instead of thank-you
        console.log("Navigating to confirmation page");
        navigate('/confirm-appointment');
      } else {
        throw new Error('Failed to book appointment - no result returned');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error booking appointment:", error);
      setErrorMsg(`Booking failed: ${errorMessage}`);
      
      toast({
        title: "Appointment Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2 text-hospital-700">Complete Your Booking</h2>
        <p className="text-gray-600">
          Please provide additional details to complete your appointment booking with {selectedDoctor.name}.
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h3 className="font-medium text-hospital-700 mb-2">Appointment Summary</h3>
        <p><span className="font-medium">Name:</span> {patientData.patientName}</p>
        <p><span className="font-medium">Age:</span> {patientData.patientAge}</p>
        <p><span className="font-medium">Gender:</span> {patientData.patientGender}</p>
        <p><span className="font-medium">Doctor:</span> {selectedDoctor.name} ({selectedDoctor.specialization})</p>
        <p><span className="font-medium">Date:</span> {selectedDate.toLocaleDateString()}</p>
        <p><span className="font-medium">Time:</span> {selectedTime}</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="patientPhone" className="flex items-center">
            Phone Number <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="patientPhone"
            placeholder="Enter your phone number"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="problem" className="flex items-center">
            Problem/Symptoms <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="problem"
            placeholder="Briefly describe your symptoms or reason for visit"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="min-h-[120px]"
            required
          />
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
          <Button 
            type="button" 
            onClick={goBack} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
