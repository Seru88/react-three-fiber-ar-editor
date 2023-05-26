import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Carousel, initTE } from 'tw-elements'

import App from './App.tsx'

initTE({ Carousel })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
