import './App.css'
import Clock from './Clock'
import Weather from './Weather'

function App() {
  return (
    <div className="main-container">
      <div className="left"><Weather /></div>
      <div className="middle"></div>
      <div className="right"><Clock /></div>
    </div>
  )
}

export default App
