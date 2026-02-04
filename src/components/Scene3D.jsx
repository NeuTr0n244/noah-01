import { Canvas } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb'

function Model() {
  const { scene } = useGLTF(GLB_URL)
  return <primitive object={scene} />
}

useGLTF.preload(GLB_URL)

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
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="apartment" />
          <Model />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
