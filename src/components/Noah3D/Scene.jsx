import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character'
import Lighting from './Lighting'

/**
 * Loading component with child-like style
 */
function LoadingScreen() {
  return (
    <Html center>
      <div
        style={{
          fontFamily: "'Patrick Hand', cursive",
          fontSize: '1.2rem',
          color: '#666',
          textAlign: 'center',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          border: '3px solid #ddd',
          boxShadow: '4px 4px 0 #ccc',
        }}
      >
        <div
          style={{
            fontSize: '1.5rem',
            marginBottom: '8px',
            animation: 'bounce 1s infinite',
          }}
        >
          loading noah...
        </div>
        <div style={{ fontSize: '2rem' }}>
          ✏️
        </div>
        <style>
          {`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
          `}
        </style>
      </div>
    </Html>
  )
}

/**
 * Error boundary fallback
 */
function ErrorFallback() {
  return (
    <Html center>
      <div
        style={{
          fontFamily: "'Patrick Hand', cursive",
          fontSize: '1rem',
          color: '#e74c3c',
          textAlign: 'center',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          border: '3px solid #ffcccc',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          oops! character not found
        </div>
        <div style={{ fontSize: '0.8rem', color: '#999' }}>
          add character.glb to /public/models/
        </div>
      </div>
    </Html>
  )
}

/**
 * Main Scene Component
 * Sets up the 3D canvas with proper configuration
 */
export default function Scene({ className, style }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoaded = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div className={className} style={style}>
      <Canvas
        camera={{
          position: [0, 1, 4],
          fov: 35,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        shadows={{
          enabled: true,
          type: THREE.PCFSoftShadowMap,
        }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          scene.background = null
        }}
      >
        {/* Lighting setup */}
        <Lighting />

        {/* Main character */}
        <Suspense fallback={<LoadingScreen />}>
          <Character onLoaded={handleLoaded} />
        </Suspense>

        {/* Subtle fog for depth */}
        <fog attach="fog" args={['#fffef5', 8, 25]} />
      </Canvas>
    </div>
  )
}
