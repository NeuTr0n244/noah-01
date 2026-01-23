import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_PATH = '/models/cartoon_asian__boy.glb'
const TARGET_HEIGHT = 2.0

export default function Character({ onLoaded }) {
  const groupRef = useRef()
  const headRef = useRef()
  const { camera } = useThree()
  const { scene } = useGLTF(MODEL_PATH)

  const model = useMemo(() => {
    if (!scene) return null
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) child.material = child.material.clone()
      }
    })
    return clone
  }, [scene])

  const transforms = useMemo(() => {
    if (!model) return null
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1
    return {
      scale,
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
      height: size.y * scale,
    }
  }, [model])

  useEffect(() => {
    if (!transforms) return
    const { height } = transforms
    camera.position.set(0, height * 0.5, height * 2.2)
    camera.lookAt(0, height * 0.45, 0)
    camera.updateProjectionMatrix()
    if (onLoaded) onLoaded()
  }, [camera, transforms, onLoaded])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.position.y = Math.sin(t * 2) * 0.03
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.02

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.clamp(state.mouse.x * 0.4, -0.5, 0.5)
      headRef.current.rotation.x = THREE.MathUtils.clamp(-state.mouse.y * 0.3, -0.3, 0.3)
    }
  })

  const handleClick = useCallback(() => {
    if (!groupRef.current) return
    let frame = 0
    const animate = () => {
      frame++
      if (frame < 20) {
        groupRef.current.rotation.z = Math.sin(frame * 0.8) * 0.2
        requestAnimationFrame(animate)
      }
    }
    animate()
  }, [])

  if (!model || !transforms) return null

  const { scale, offset, height } = transforms

  return (
    <group ref={groupRef} onClick={handleClick}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
      <group ref={headRef} position={[0, height * 0.7, 0]}>
        <group position={[0, -height * 0.7, 0]}>
          <primitive
            object={model}
            scale={scale}
            position={[offset.x * scale, offset.y * scale, offset.z * scale]}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
