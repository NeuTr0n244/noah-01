import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'

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
      </div>
    </Html>
  )
}

function Model() {
  const { scene, cameras } = useGLTF('https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb')
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
      zIndex: 0
    }}>
      <Canvas
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

// Preload the model
useGLTF.preload('https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb')
