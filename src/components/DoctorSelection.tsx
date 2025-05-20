import React, { useState, useEffect } from 'react';
import { useAppointment } from '@/context/AppointmentContext';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Gender } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DoctorSelection: React.FC = () => {
  const { doctors, selectedDoctor, setSelectedDoctor } = useAppointment();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<Gender>('male');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load stored patient data if available
  useEffect(() => {
    const storedData = localStorage.getItem('patientData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setPatientName(data.patientName || '');
        setPatientAge(data.patientAge || '');
        setPatientGender(data.patientGender || 'male');
      } catch (error) {
        console.error('Error parsing stored patient data:', error);
      }
    }
  }, []);

  // Handle doctor selection using radio buttons instead of dropdown
  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find(doc => doc.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setValidationError(null);
    }
  };

  const handleContinue = async () => {
    // Validate all required fields
    if (!patientName.trim()) {
      setValidationError("Please enter your full name");
      return;
    }
    
    if (!patientAge || parseInt(patientAge) <= 0) {
      setValidationError("Please enter a valid age");
      return;
    }
    
    if (!selectedDoctorId) {
      setValidationError("Please select a doctor");
      return;
    }
    
    // Clear any previous errors
    setValidationError(null);
    
    try {
      // Store patient data in localStorage for later use
      const patientData = {
        patientName,
        patientAge,
        patientGender
      };
      localStorage.setItem('patientData', JSON.stringify(patientData));
      console.log("Patient data stored:", patientData);
      
      // No longer trying to book appointment from this component
      // Just set the selected doctor and let the parent component handle navigation
      
      toast({
        title: "Doctor Selected",
        description: `You've selected ${selectedDoctor?.name}. Please continue to select a date and time.`,
      });

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "There was a problem with your selection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2 text-hospital-700">Book Your Appointment</h2>
        <p className="text-gray-600">
          Please fill in your details and select a doctor to proceed with your appointment booking.
        </p>
      </div>
      
      <Card className="p-6">
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
            {validationError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="patientName" className="flex items-center">
              Full Name <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="patientName"
              placeholder="Enter your full name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
              className={!patientName.trim() && validationError ? "border-red-500" : ""}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="patientAge" className="flex items-center">
              Age <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="patientAge"
              type="number"
              placeholder="Enter your age"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              min="1"
              max="120"
              required
              className={(!patientAge || parseInt(patientAge) <= 0) && validationError ? "border-red-500" : ""}
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
        
        {/* Replace dropdown with doctor cards with radio selection */}
        <div className="mt-6">
          <Label className="flex items-center mb-3">
            Select Doctor <span className="text-red-500 ml-1">*</span>
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <div 
                key={doctor.id}
                className={`cursor-pointer border rounded-lg p-4 transition-all ${
                  selectedDoctorId === doctor.id 
                    ? 'border-hospital-500 bg-hospital-50' 
                    : 'border-gray-200 hover:border-hospital-300'
                }`}
                onClick={() => handleDoctorChange(doctor.id)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem 
                    value={doctor.id} 
                    id={doctor.id}
                    checked={selectedDoctorId === doctor.id}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor={doctor.id} className="font-medium cursor-pointer">
                      {doctor.name}
                    </Label>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-xs text-gray-500 mt-1">Department: {doctor.department}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDoctorId && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-hospital-700 mb-2">Doctor's Working Hours:</h3>
            {doctors.find(doc => doc.id === selectedDoctorId)?.workingHours.map((hours, index) => (
              <p key={index} className="text-gray-700">
                {hours.start} - {hours.end}
              </p>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Button 
            onClick={handleContinue}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DoctorSelection;
