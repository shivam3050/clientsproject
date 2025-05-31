import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  const backendUrl = "192.168.43.34"
  const backendPort = 8000
  const sendGetRequest = async ()=>{
    try {
      const response = await fetch(`http://${backendUrl}:${backendPort}`
      )
      const text = await response.text();
      alert(text)
      
      
    } catch (error) {
      console.log("Error server not ready")
      alert("server is not ready")
    }
  }
  

  return (
    <>
      <button onClick={sendGetRequest}>Get Request</button>
    </>
  )
}

export default App
