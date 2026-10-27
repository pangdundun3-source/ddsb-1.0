import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ConfirmDialogHost} from './components/common/ConfirmDialog';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ConfirmDialogHost />
  </StrictMode>,
);

