import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [date, setDate] = useState(new Date().toLocaleDateString())
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  setInterval(()=>{
   setDate(new Date().toLocaleDateString());
   setTime(new Date().toLocaleTimeString());
  },500)

  return (
    <div>
      <h1>Welcome To Charusat!!!</h1>
      <h1>Its {date}</h1>
      <h1>Its {time}</h1>
    </div>
  )
}

export default App
