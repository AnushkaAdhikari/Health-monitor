import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './simple-dashboard.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
