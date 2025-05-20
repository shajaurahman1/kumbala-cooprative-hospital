
import React, { useState } from 'react';
import { useAppointment } from '@/context/AppointmentContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Doctor } from '@/types';

const Admin = () => {
  const { appointments, doctors, loading } = useAppointment();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctor, setFilterDoctor] = useState<string>('');

  // Filter appointments based on search and doctor filter
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = searchTerm === '' || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientPhone.includes(searchTerm);
    
    const matchesDoctor = filterDoctor === '' || appointment.doctorId === filterDoctor;
    
    return matchesSearch && matchesDoctor;
  });

  // Count tokens per doctor
  const tokenCounts = doctors.map(doctor => {
    const count = appointments.filter(app => app.doctorId === doctor.id).length;
    return { doctor, count };
  });

  // Function to generate CSV
  const downloadCSV = () => {
    if (filteredAppointments.length === 0) return;
    
    const headers = ['Doctor', 'Patient Name', 'Age', 'Gender', 'Phone', 'Department', 'Date', 'Time', 'Token', 'Problem'];
    const csvData = filteredAppointments.map(app => ([
      app.doctorName,
      app.patientName,
      app.patientAge,
      app.patientGender,
      app.patientPhone,
      app.department,
      format(new Date(app.appointmentDate), 'yyyy-MM-dd'),
      app.appointmentTime,
      app.tokenNumber,
      app.problem
    ]));
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-hospital-700">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="col-span-1 md:col-span-3 bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-hospital-700">Token Counts by Doctor</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {tokenCounts.map(({ doctor, count }) => (
              <div 
                key={doctor.id} 
                className="bg-gray-50 p-3 rounded-md border flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{doctor.name}</p>
                  <p className="text-sm text-gray-500">{doctor.department}</p>
                </div>
                <div className="text-2xl font-bold text-hospital-600">{count}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-hospital-700">Export Data</h2>
          <p className="text-sm text-gray-500 mb-4">
            Download appointment data for record keeping and analysis.
          </p>
          <Button 
            onClick={downloadCSV} 
            className="w-full"
            disabled={filteredAppointments.length === 0}
          >
            Export as CSV
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4 text-hospital-700">Appointments</h2>
            <div className="flex gap-4">
              <div className="w-full max-w-sm">
                <Input 
                  placeholder="Search by patient name or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">All Doctors</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">#{appointment.tokenNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p>{appointment.patientName}</p>
                        <p className="text-xs text-gray-500">Ph: {appointment.patientPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{appointment.appointmentTime}</TableCell>
                    <TableCell>{appointment.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
