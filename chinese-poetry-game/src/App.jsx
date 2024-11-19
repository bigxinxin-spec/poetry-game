import { useState } from 'react'
import GameBoard from './components/GameBoard'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <h1>诗词连接游戏</h1>
      <GameBoard />
    </div>
  )
}

export default App