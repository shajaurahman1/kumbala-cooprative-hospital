import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal test component
const App = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Basic React Test</h1>
      <p>If you can see this, React is working correctly.</p>
    </div>
  );
};

// Try both old and new React 18 rendering methods
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
  console.log('React 18 rendering successful');
} catch (error) {
  console.error('Error with React 18 rendering:', error);
  try {
    // Fallback to legacy rendering
    ReactDOM.render(<App />, document.getElementById('root'));
    console.log('Legacy React rendering successful');
  } catch (fallbackError) {
    console.error('Error with legacy React rendering:', fallbackError);
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; text-align: center; color: red;">
        <h1>React Failed to Render</h1>
        <p>There was an error initializing React. Check the console for details.</p>
      </div>
    `;
  }
} 