import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Test from "./pages/Test";
import Layout from "./components/Layout";
import Home from "./pages/Home";
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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
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
