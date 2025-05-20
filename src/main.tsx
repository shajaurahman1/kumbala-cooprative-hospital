import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Try to render the root element
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("React application mounted successfully");
} catch (error) {
  console.error("Error mounting React application:", error);
  
  // Fallback to basic HTML if React fails
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Error Loading Application</h1>
        <p>There was a problem loading the application. Please try again.</p>
        <p>If the problem persists, please contact support.</p>
      </div>
    `;
  }
}
