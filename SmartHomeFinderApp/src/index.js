import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globalStyles.css';
import { PropertiesProvider } from './context/PropertiesContext';
import { UserProvider } from './context/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <PropertiesProvider>
        <App />
      </PropertiesProvider>
    </UserProvider>
  </React.StrictMode>
);
