import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Test from "./pages/Test";
import Layout from "./components/Layout";
import BookAppointment from "./pages/BookAppointment";
import ConfirmAppointment from "./pages/ConfirmAppointment";

// Simple diagnostic page to test React rendering
const DiagnosticPage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Diagnostic Page</h1>
    <p>If you can see this, React is rendering correctly.</p>
    <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Home</a>
  </div>
);

// Home page component
const Home = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Kumbala Cooperative Hospital</h1>
    <p>Welcome to our appointment booking system.</p>
    <div style={{ margin: '20px 0' }}>
      <a href="/book-appointment" 
         style={{ 
           display: 'inline-block',
           padding: '10px 20px',
           background: '#1e40af',
           color: 'white',
           borderRadius: '4px',
           textDecoration: 'none'
         }}>
        Book Appointment
      </a>
    </div>
    <div style={{ margin: '10px 0' }}>
      <a href="/diagnostic" style={{ color: 'blue', textDecoration: 'underline' }}>
        Diagnostic Page
      </a>
    </div>
    <div style={{ margin: '10px 0' }}>
      <a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>
        Test Page
      </a>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<Layout><BookAppointment /></Layout>} />
        <Route path="/confirm-appointment" element={<Layout><ConfirmAppointment /></Layout>} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route path="/test" element={<Test />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
