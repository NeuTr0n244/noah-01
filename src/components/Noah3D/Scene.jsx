import { Suspense, forwardRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import Character from './Character'
import Lighting from './Lighting'

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
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          Noah is waking up...
        </div>
      </div>
    </Html>
  )
}

const Scene = forwardRef(function Scene({ className, style, onLoaded }, ref) {
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
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          scene.background = null
        }}
      >
        <Lighting />
        <Suspense fallback={<LoadingScreen />}>
          <Character ref={ref} onLoaded={onLoaded} />
        </Suspense>
        <fog attach="fog" args={['#fffef5', 8, 25]} />
      </Canvas>
    </div>
  )
})

export default Scene
