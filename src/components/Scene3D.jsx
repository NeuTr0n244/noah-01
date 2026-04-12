import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/noahnew.glb'

// Map page routes to camera index in the GLB
const CAMERA_INDEX_MAP = {
  '/': 0,
  '/gallery': 1,
  '/about': 2,
  '/community': 2
}

function Model({ activeCamera, drawingTexture, onCamerasReady }) {
  const gltf = useLoader(GLTFLoader, GLB_URL)
  const { set, size } = useThree()
  const mixerRef = useRef()
  const prevIndex = useRef(-1)

  // Extract cameras and setup scene on load
  useEffect(() => {
    // Remove all lights embedded in the GLB and fix materials
    const lightsToRemove = []
    gltf.scene.traverse((child) => {
      if (child.isLight) {
        lightsToRemove.push(child)
      }
      if (child.isMesh && child.material) {
        const mat = child.material
        if (mat.emissive) mat.emissive.setRGB(0, 0, 0)
        if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0
        if (mat.toneMapped !== undefined) mat.toneMapped = true
      }
    })
    lightsToRemove.forEach((light) => {
      console.log('Removing GLB light:', light.type, light.name)
      light.parent?.remove(light)
    })

    // Log available cameras
    if (gltf.cameras && gltf.cameras.length > 0) {
      console.log('GLB Cameras found:', gltf.cameras.map((c, i) => `[${i}] ${c.name}`))
      onCamerasReady?.(gltf.cameras)

      // Set initial camera
      const initialIndex = CAMERA_INDEX_MAP[activeCamera] ?? 0
      const cam = gltf.cameras[initialIndex] || gltf.cameras[0]
      if (cam) {
        cam.aspect = size.width / size.height
        cam.updateProjectionMatrix()
        set({ camera: cam })
        prevIndex.current = initialIndex
      }
    }

    // Setup animations
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene)
      mixerRef.current = mixer
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play()
      })
    }
  }, [gltf, set, size])

  // Switch camera directly when route changes
  useEffect(() => {
    const targetIndex = CAMERA_INDEX_MAP[activeCamera] ?? 0
    const cameras = gltf.cameras

    if (!cameras || cameras.length === 0 || targetIndex === prevIndex.current) return

    const cam = cameras[targetIndex]
    if (!cam) return

    cam.aspect = size.width / size.height
    cam.updateProjectionMatrix()
    set({ camera: cam })
    prevIndex.current = targetIndex
    console.log('Switched to camera:', cam.name, `[${targetIndex}]`)
  }, [activeCamera, gltf.cameras, set, size])

  // Log all meshes once on load
  const loggedRef = useRef(false)
  useEffect(() => {
    if (!gltf.scene || loggedRef.current) return
    loggedRef.current = true
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const color = child.material?.color
        const hex = color ? `#${color.getHexString()}` : 'none'
        const hasUV = child.geometry?.attributes?.uv ? 'yes' : 'no'
        console.log(`Mesh: "${child.name}" | color: ${hex} | UV: ${hasUV}`)
      }
    })
  }, [gltf.scene])

  // Apply drawing texture to the paper mesh whenever it changes
  useEffect(() => {
    if (!gltf.scene) return

    // Find paper: by name first
    let paper = null
    const nameKeywords = ['paper', 'papel', 'folha', 'canvas', 'quadro', 'tela', 'desenho', 'drawing', 'screen', 'plane', 'sheet']

    gltf.scene.traverse((child) => {
      if (!child.isMesh || paper) return
      const n = child.name.toLowerCase()
      for (const kw of nameKeywords) {
        if (n.includes(kw)) { paper = child; return }
      }
    })

    // Fallback: largest white mesh with UVs
    if (!paper) {
      let best = null, bestArea = 0
      gltf.scene.traverse((child) => {
        if (!child.isMesh || !child.geometry?.attributes?.uv) return
        const c = child.material?.color
        if (c && c.r > 0.8 && c.g > 0.8 && c.b > 0.8) {
          const box = new THREE.Box3().setFromObject(child)
          const s = new THREE.Vector3()
          box.getSize(s)
          const area = s.x * s.z // flat on table = x * z
          if (area > bestArea) { bestArea = area; best = child }
        }
      })
      paper = best
    }

    if (!paper) {
      console.warn('No paper mesh found')
      return
    }

    console.log('Paper mesh:', paper.name)

    if (drawingTexture) {
      // Try both flipY states
      drawingTexture.colorSpace = THREE.SRGBColorSpace
      drawingTexture.needsUpdate = true

      const newMat = paper.material.clone()
      newMat.map = drawingTexture
      newMat.color = new THREE.Color(1, 1, 1)
      newMat.needsUpdate = true
      paper.material = newMat
      console.log('Drawing applied to paper:', paper.name)
    } else {
      // Reset to white when leaving gallery
      const newMat = paper.material.clone()
      newMat.map = null
      newMat.color = new THREE.Color(1, 1, 1)
      newMat.needsUpdate = true
      paper.material = newMat
    }
  }, [drawingTexture, gltf.scene])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  return <primitive object={gltf.scene} />
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#F5C842" wireframe />
    </mesh>
  )
}

export default function Scene3D({ activeCamera = '/', drawingTexture = null }) {
  const [fading, setFading] = useState(false)

  // Brief fade on camera switch
  useEffect(() => {
    setFading(true)
    const t = setTimeout(() => setFading(false), 400)
    return () => clearTimeout(t)
  }, [activeCamera])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.4s ease'
    }}>
      <Canvas
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={0.5} />
        <directionalLight position={[-3, 4, -3]} intensity={0.2} />
        <Suspense fallback={<Loader />}>
          <Model
            activeCamera={activeCamera}
            drawingTexture={drawingTexture}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
