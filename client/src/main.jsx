import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { PcProvider } from './context/PcProvider.jsx'
import { RentalProvider } from './context/RentalProvider.jsx'
import { TransactionProvider } from './context/TransactionProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PcProvider>
          <RentalProvider>
            <TransactionProvider>
              <App />
            </TransactionProvider>
          </RentalProvider>
        </PcProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
