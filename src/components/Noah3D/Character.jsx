import { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_PATH = '/models/noah.glb'
const TARGET_HEIGHT = 2.0

const Character = forwardRef(function Character({ onLoaded }, ref) {
  const groupRef = useRef()
  const headRef = useRef()
  const rightArmRef = useRef()
  const isDrawingRef = useRef(false)
  const drawingPhaseRef = useRef(0)
  const { camera } = useThree()
  const modelRef = useRef()
  const { scene, animations } = useGLTF(MODEL_PATH)

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

  // Setup animations
  const { actions } = useAnimations(animations, modelRef)

  // Play all animations in infinite loop
  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.play()
        }
      })
    }
  }, [actions])

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

  // Find arm bones after model loads
  useEffect(() => {
    if (!model) return

    model.traverse((child) => {
      if (child.isBone) {
        const name = child.name.toLowerCase()
        if (name.includes('right') && (name.includes('arm') || name.includes('shoulder'))) {
          if (!rightArmRef.current || name.includes('upper')) {
            rightArmRef.current = child
          }
        }
      }
    })
  }, [model])

  useEffect(() => {
    if (!transforms) return
    const { height } = transforms
    camera.position.set(0, height * 0.5, height * 2.2)
    camera.lookAt(0, height * 0.45, 0)
    camera.updateProjectionMatrix()
    if (onLoaded) onLoaded()
  }, [camera, transforms, onLoaded])

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startDrawing: () => {
      isDrawingRef.current = true
      drawingPhaseRef.current = 0
    },
    stopDrawing: () => {
      isDrawingRef.current = false
    },
    celebrate: () => {
      // Quick celebration wiggle
      if (groupRef.current) {
        let frame = 0
        const animate = () => {
          frame++
          if (frame < 30) {
            groupRef.current.rotation.z = Math.sin(frame * 0.8) * 0.15
            requestAnimationFrame(animate)
          } else {
            groupRef.current.rotation.z = 0
          }
        }
        animate()
      }
    }
  }), [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    // Idle breathing animation
    groupRef.current.position.y = Math.sin(t * 2) * 0.02

    // Only sway when not drawing
    if (!isDrawingRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.08
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.015
    }

    // Head follows mouse
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.clamp(state.mouse.x * 0.3, -0.4, 0.4)
      headRef.current.rotation.x = THREE.MathUtils.clamp(-state.mouse.y * 0.2, -0.2, 0.2)
    }

    // Drawing arm animation
    if (isDrawingRef.current && rightArmRef.current) {
      drawingPhaseRef.current += 0.15
      // Simulate drawing motion - arm moves up/down and slightly forward
      const drawMotion = Math.sin(drawingPhaseRef.current) * 0.3
      const drawMotion2 = Math.cos(drawingPhaseRef.current * 0.7) * 0.15
      rightArmRef.current.rotation.x = -0.5 + drawMotion
      rightArmRef.current.rotation.z = -0.3 + drawMotion2
    } else if (rightArmRef.current) {
      // Return to rest position smoothly
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05)
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, 0.05)
    }
  })

  const handleClick = useCallback(() => {
    if (groupRef.current) {
      let frame = 0
      const animate = () => {
        frame++
        if (frame < 20) {
          groupRef.current.rotation.z = Math.sin(frame * 0.8) * 0.2
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
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
            ref={modelRef}
            object={model}
            scale={scale}
            position={[offset.x * scale, offset.y * scale, offset.z * scale]}
          />
        </group>
      </group>
    </group>
  )
})

export default Character

useGLTF.preload('/models/noah.glb')
