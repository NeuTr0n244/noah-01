import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb'

function Model() {
  const gltf = useLoader(GLTFLoader, GLB_URL)
  const { set, gl, size } = useThree()

  useEffect(() => {
    // Usar câmera do GLB
    if (gltf.cameras && gltf.cameras.length > 0) {
      const cam = gltf.cameras[0]
      cam.aspect = size.width / size.height
      cam.updateProjectionMatrix()
      set({ camera: cam })
    }

    // Configurar renderer igual glTF Viewer
    gl.outputEncoding = THREE.sRGBEncoding
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.0
  }, [gltf, set, gl, size])

  // Retornar a cena COMPLETA sem modificar NADA
  return <primitive object={gltf.scene} />
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
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
