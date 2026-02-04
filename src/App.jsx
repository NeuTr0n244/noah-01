import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './contexts/SocketContext'
import Scene3D from './components/Scene3D'
import UIOverlay from './components/UIOverlay'
import Home from './pages/Home'
import About from './pages/About'
import Community from './pages/Community'
import './App.css'

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        {/* 3D Background */}
        <Scene3D />

        {/* UI Overlay */}
        <Routes>
          <Route path="/" element={<UIOverlay />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="community" element={<Community />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  )
}
