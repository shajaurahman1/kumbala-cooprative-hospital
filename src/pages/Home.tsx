
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-hospital-600 to-hospital-800 py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?q=80&w=2071')] bg-cover bg-center opacity-10" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Your Health is Our Priority
            </h1>
            <p className="text-xl text-hospital-100 mb-8">
              Book an appointment with our expert doctors at Kumbala Cooperative Hospital.
              We provide compassionate care with modern medical expertise.
            </p>
            <Button asChild size="lg" className="bg-white text-hospital-700 hover:bg-hospital-50">
              <Link to="/book-appointment">Book Your Appointment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-hospital-700">About Kumbala Cooperative Hospital</h2>
              <p className="text-gray-600 mb-6">
                Founded in 1995, Kumbala Cooperative Hospital has been at the forefront of providing exceptional healthcare services to our community. Our team of dedicated medical professionals is committed to your wellbeing.
              </p>
              <p className="text-gray-600 mb-6">
                We offer a wide range of medical services with state-of-the-art facilities and advanced technology. Our patient-centered approach ensures that you receive the best care possible.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-hospital-500" />
                  <span className="text-gray-700">Experienced doctors and medical staff</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-hospital-500" />
                  <span className="text-gray-700">Modern medical equipment and facilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-hospital-500" />
                  <span className="text-gray-700">24/7 emergency services</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-hospital-500" />
                  <span className="text-gray-700">Patient-centered approach to healthcare</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1516549655669-dee07a2a3874?q=80&w=2070" 
                alt="Hospital building" 
                className="rounded-lg shadow-xl w-full h-auto" 
              />
              <div className="absolute -bottom-6 -right-6 bg-hospital-50 p-4 rounded-lg shadow-lg border border-hospital-100">
                <p className="text-hospital-700 font-medium">Trusted by over 50,000 patients yearly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-hospital-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-hospital-700">Our Medical Departments</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive healthcare services across various medical specialties
              to address all your health needs under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Cardiology', description: 'Expert care for heart-related conditions' },
              { name: 'Orthopedics', description: 'Specialized treatment for bone and joint issues' },
              { name: 'Pediatrics', description: 'Compassionate care for children of all ages' },
              { name: 'Neurology', description: 'Advanced diagnosis and treatment of neurological disorders' },
              { name: 'Gynecology', description: 'Comprehensive women\'s health services' },
              { name: 'General Medicine', description: 'Primary healthcare for various conditions' },
            ].map((service, index) => (
              <Card key={index} className="hospital-card overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-hospital-700">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/book-appointment">Book an Appointment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-hospital-700 py-16 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">Ready to schedule your visit?</h2>
            <p className="text-xl text-hospital-100 mb-8">
              Our friendly staff is available to help you book an appointment with our expert medical team.
              We're dedicated to providing you with the best possible care.
            </p>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-hospital-700">
              <Link to="/book-appointment">Book Your Appointment Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
