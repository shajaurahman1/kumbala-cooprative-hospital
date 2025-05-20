
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppointmentProvider } from './context/AppointmentContext.tsx';

createRoot(document.getElementById("root")!).render(
  <AppointmentProvider>
    <App />
  </AppointmentProvider>
);
