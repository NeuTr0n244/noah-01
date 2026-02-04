import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { useEffect, Suspense } from 'react'
import * as THREE from 'three'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb'

function Model() {
  const { scene, cameras, animations } = useGLTF(GLB_URL)
  const { set, gl } = useThree()

  useEffect(() => {
    // Usar câmera do GLB se existir
    if (cameras && cameras.length > 0) {
      const cam = cameras[0]
      cam.aspect = window.innerWidth / window.innerHeight
      cam.updateProjectionMatrix()
      set({ camera: cam })
    }

    // Configurar encoding correto para cores
    gl.outputEncoding = THREE.sRGBEncoding
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.5
  }, [cameras, set, gl])

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
        gl={{
          antialias: true,
          alpha: false,
          outputEncoding: THREE.sRGBEncoding,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000')
        }}
      >
        <Environment preset="apartment" />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
