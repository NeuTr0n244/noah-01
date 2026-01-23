import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './contexts/SocketContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Community from './pages/Community'
import './App.css'

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="community" element={<Community />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  )
}
