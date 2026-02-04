import { Canvas } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { Suspense } from 'react'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb'

function Model() {
  const { scene } = useGLTF(GLB_URL)

  // NÃO modificar posição, rotação ou escala!
  // O modelo já está correto no arquivo

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
        camera={{
          position: [5, 3, 5],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="apartment" />
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
