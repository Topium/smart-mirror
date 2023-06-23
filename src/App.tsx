import './App.css'
import Clock from './Clock'
import Power from './Power'
import Weather from './Weather'

function App() {
  return (
    <div className="main-container">
      <div className="left">
        <Weather />
        <Power />
        </div>
      <div className="middle"></div>
      <div className="right"><Clock /></div>
    </div>
  )
}

export default App
