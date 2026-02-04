import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { Suspense, useEffect } from 'react'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/saladesenho.glb'

function Model() {
  const { scene, cameras } = useGLTF(GLB_URL)
  const { set, size } = useThree()

  useEffect(() => {
    if (cameras && cameras.length > 0) {
      const cam = cameras[0]
      cam.aspect = size.width / size.height
      cam.updateProjectionMatrix()
      set({ camera: cam })
      console.log('✅ Using GLB camera:', cam.name || 'Camera')
    }

    // Debug: Log all objects in the scene
    if (scene) {
      console.log('🎨 Scene loaded with', scene.children.length, 'children')
      scene.traverse((obj) => {
        if (obj.isMesh) {
          console.log('  - Mesh:', obj.name, 'visible:', obj.visible, 'geometry:', obj.geometry.type)
        }
      })
    }
  }, [cameras, set, size, scene])

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
      <Canvas gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <Environment preset="apartment" />
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
