import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Html, Box } from '@react-three/drei'

function LoadingScreen() {
  return (
    <Html center>
      <div
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '2rem',
          fontWeight: 600,
          color: '#F5C842',
          textAlign: 'center',
          padding: '30px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '2px solid rgba(245, 200, 66, 0.3)',
        }}
      >
        Loading Noah's Room...
        <div style={{ fontSize: '1rem', marginTop: '10px', color: 'rgba(255,255,255,0.7)' }}>
          (172MB - may take a moment)
        </div>
      </div>
    </Html>
  )
}

// Fallback placeholder scene
function PlaceholderRoom() {
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Box args={[10, 0.1, 10]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f0e6d2" />
      </Box>
      <Box args={[0.1, 5, 10]} position={[-5, 2.5, 0]}>
        <meshStandardMaterial color="#e8dcc8" />
      </Box>
      <Box args={[0.1, 5, 10]} position={[5, 2.5, 0]}>
        <meshStandardMaterial color="#e8dcc8" />
      </Box>
      <Box args={[10, 5, 0.1]} position={[0, 2.5, -5]}>
        <meshStandardMaterial color="#e8dcc8" />
      </Box>
    </group>
  )
}

function Model() {
  const [usePlaceholder, setUsePlaceholder] = useState(false)

  // Try to load GLB with error handling
  const glbUrl = import.meta.env.VITE_GLB_URL || '/models/saladesenho.glb'

  let glbData
  try {
    glbData = useGLTF(glbUrl, true)
  } catch (error) {
    console.warn('GLB loading failed, using placeholder:', error)
    return <PlaceholderRoom />
  }

  const { scene, cameras } = glbData
  const { set, size } = useThree()

  // Use the camera from the GLB file
  useEffect(() => {
    if (cameras && cameras.length > 0) {
      const camera = cameras[0]
      camera.aspect = size.width / size.height
      camera.updateProjectionMatrix()
      set({ camera })
    }
  }, [cameras, set, size])

  // Update camera aspect on window resize
  useEffect(() => {
    const handleResize = () => {
      if (cameras && cameras.length > 0) {
        cameras[0].aspect = window.innerWidth / window.innerHeight
        cameras[0].updateProjectionMatrix()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [cameras])

  if (!scene) {
    return <PlaceholderRoom />
  }

  return <primitive object={scene} />
}

export default function Scene3D() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      background: 'linear-gradient(180deg, #87CEEB 0%, #f0e6d2 100%)'
    }}>
      <Canvas
        camera={{
          position: [0, 2, 5],
          fov: 50
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMappingExposure: 1.0,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Try to preload the model
try {
  const glbUrl = import.meta.env.VITE_GLB_URL || '/models/saladesenho.glb'
  useGLTF.preload(glbUrl)
} catch (error) {
  console.warn('GLB preload failed:', error)
}
