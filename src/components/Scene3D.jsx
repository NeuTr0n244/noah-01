import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb'

function Model() {
  const gltf = useLoader(GLTFLoader, GLB_URL)
  const { set, size } = useThree()
  const mixerRef = useRef()

  useEffect(() => {
    // TOCAR A ANIMAÇÃO - isso faz o personagem aparecer na pose correta
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene)
      mixerRef.current = mixer

      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.play()
      })

      // Ir para o frame 53 (2.2 segundos a 24fps)
      mixer.setTime(53 / 24)
    }

    // Usar câmera do GLB
    if (gltf.cameras && gltf.cameras.length > 0) {
      const cam = gltf.cameras[0]
      cam.aspect = size.width / size.height
      cam.updateProjectionMatrix()
      set({ camera: cam })
    }
  }, [gltf, set, size])

  return <primitive object={gltf.scene} />
}

export default function Scene3D() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Canvas>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
