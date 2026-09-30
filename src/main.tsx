import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <CustomerAuthProvider>
        <App />
      </CustomerAuthProvider>
    </StrictMode>,
  );
}

