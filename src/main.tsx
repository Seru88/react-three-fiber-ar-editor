import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import * as THREE from 'three'

declare global {
  interface Window {
    apps_modal: HTMLDialogElement
    apps_modal_b: HTMLDialogElement
    templates_model: HTMLDialogElement
    XR8: any
    XRExtras: any
    LandingPage: any
    THREE: typeof THREE
  }
}

/**
 *  Append BABYLON to window for 8th Wall
 */
window.THREE = THREE

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
