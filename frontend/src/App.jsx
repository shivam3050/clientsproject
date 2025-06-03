import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
const backendUrl = "https://clientsprojectbackend.onrender.com"
  const sendGetRequest = async ()=>{
    try {
      const response = await fetch(backendUrl)
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
