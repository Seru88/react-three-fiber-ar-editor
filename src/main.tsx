import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'

declare global {
  interface Window {
    apps_modal: HTMLDialogElement
    templates_model: HTMLDialogElement
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
