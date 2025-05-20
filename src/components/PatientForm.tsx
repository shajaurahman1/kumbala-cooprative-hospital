
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointment } from '@/context/AppointmentContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Gender } from '@/types';

const PatientForm: React.FC = () => {
  const { 
    selectedDoctor, 
    selectedDate, 
    selectedTime, 
    bookAppointment 
  } = useAppointment();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState<Gender>('male');
  const [problem, setProblem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedDoctor || !selectedTime) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !patientAge || !patientPhone || !problem) {
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
        patientName,
        patientAge: parseInt(patientAge),
        patientPhone,
        patientGender,
        problem,
      };

      const result = await bookAppointment(appointmentData);
      
      if (result) {
        navigate('/thank-you');
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (error) {
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
        <h2 className="text-2xl font-semibold mb-2 text-hospital-700">Patient Information</h2>
        <p className="text-gray-600">
          Please provide your personal details to complete the booking process.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="patientName">Full Name</Label>
            <Input
              id="patientName"
              placeholder="Enter your full name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="patientAge">Age</Label>
            <Input
              id="patientAge"
              type="number"
              placeholder="Enter your age"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              min="1"
              max="120"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="patientPhone">Phone Number</Label>
            <Input
              id="patientPhone"
              placeholder="Enter your phone number"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Gender</Label>
            <RadioGroup 
              value={patientGender} 
              onValueChange={(value) => setPatientGender(value as Gender)}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="problem">Problem/Symptoms</Label>
          <Textarea
            id="problem"
            placeholder="Briefly describe your symptoms or reason for visit"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="min-h-[120px]"
            required
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
