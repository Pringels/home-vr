import ReactDOM from 'react-dom'
import React from 'react'
import './index.css'
import { App } from './App'
import { VRCanvas } from '@react-three/xr'

ReactDOM.render(
  <VRCanvas>
    <App />
  </VRCanvas>,
  document.getElementById('root')
)
