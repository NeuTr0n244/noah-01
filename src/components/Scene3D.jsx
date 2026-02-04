import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb'

function Model() {
  const gltf = useGLTF(GLB_URL)
  return <primitive object={gltf.scene} />
}

export default function Scene3D() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <Suspense fallback={null}>
          <Model />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
