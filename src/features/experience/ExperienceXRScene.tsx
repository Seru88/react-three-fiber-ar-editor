import { FC, useRef, Suspense, useEffect } from 'react'
import { Experience } from './api'
import { Canvas } from '@react-three/fiber'
import {
  Event,
  Group,
  Mesh,
  Object3D,
  Raycaster,
  Scene,
  Vector2,
  Vector3
} from 'three'
import ContentSceneObject from './ContentSceneObject'
import XR8Scene from 'features/8thwall/XR8Scene'
import { /* CameraControls, */ Plane } from '@react-three/drei'

type Props = {
  experience: Experience
}

let startingPoint: Vector3 | null = null
let currentScale = 1
let currentRotation = 0
let startDistance = 0
let startAngle = currentRotation
let touchStartAngle = 0
const minScale = 0.5
const maxScale = 5
const raycaster = new Raycaster()

const getTwoFingerCoordinates = (event: TouchEvent) => ({
  finger1: new Vector2(event.touches[0].pageX, event.touches[0].pageY),
  finger2: new Vector2(event.touches[1].pageX, event.touches[1].pageY)
})

const getIntersectPoint = (event: TouchEvent, object3D: Object3D<Event>) => {
  const x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
  const y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
  const { camera } = window.XR8.Threejs.xrScene()
  raycaster.setFromCamera(new Vector2(x, y), camera)
  const intersects = raycaster.intersectObject(object3D)
  if (intersects.length === 1) {
    return intersects[0].point
  }
  return null
}

const getDistanceBetweenFingers = (finger1: Vector2, finger2: Vector2) => {
  return Math.hypot(finger1.x - finger2.x, finger1.y - finger2.y)
}

const getPinchScale = (delta: number, start: number) => {
  let scale = delta / start
  scale = Math.min(Math.max(minScale, scale), maxScale)
  return scale
}

const getTouchAngle = (finger1: Vector2, finger2: Vector2) => {
  return Math.atan2(finger1.x - finger2.x, finger1.y - finger2.y)
}

const getAngleDiff = (delta: number, start: number) => {
  return delta - start
}

const ExperienceXRScene: FC<Props> = ({ experience }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const surfaceRef = useRef<Mesh | null>(null)
  const expGroupRef = useRef<Group | null>(null)

  const { onxrloaded /* cubeCamera */ } = XR8Scene(canvasRef, sceneRef)

  const handleTouchStart = (event: TouchEvent) => {
    event.preventDefault()
    const surface = surfaceRef.current
    if (surface === null) return
    const touches = event.touches.length
    if (touches === 1) {
      startingPoint = getIntersectPoint(event, surface)
    } else if (touches === 2) {
      const { finger1, finger2 } = getTwoFingerCoordinates(event)
      startDistance = getDistanceBetweenFingers(finger1, finger2) / currentScale
      touchStartAngle = getTouchAngle(finger1, finger2)
      startAngle = currentRotation
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault()
    const group = expGroupRef.current
    const surface = surfaceRef.current
    if (startingPoint === null || group === null || surface === null) return
    if (event.touches.length === 1) {
      const intersetPoint = getIntersectPoint(event, surface)
      if (intersetPoint) {
        startingPoint = startingPoint ?? new Vector3().copy(intersetPoint)
        const current = new Vector3().copy(intersetPoint)
        const diff = intersetPoint.sub(startingPoint)
        group.position.add(diff)
        startingPoint = current
      }
    } else if (event.touches.length === 2) {
      const { finger1, finger2 } = getTwoFingerCoordinates(event)
      const distanceChange = getDistanceBetweenFingers(finger1, finger2)
      const angleChange = getTouchAngle(finger1, finger2)
      currentScale = getPinchScale(distanceChange, startDistance)
      currentRotation = getAngleDiff(angleChange, touchStartAngle) + startAngle
      group.scale.set(currentScale, currentScale, currentScale)
      group.rotation.setFromVector3(
        new Vector3(group.rotation.x, currentRotation, group.rotation.z)
      )
    }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault()
    startingPoint = null
  }

  useEffect(() => {
    window.XRExtras.Loading.showLoading({ onxrloaded })
  }, [onxrloaded])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, true)
      canvas.addEventListener('touchmove', handleTouchMove)
      canvas.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [])

  return (
    <Canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        zIndex: -50
      }}
    >
      <scene ref={sceneRef}>
        <ambientLight intensity={0.75} />
        {/* <pointLight position={[10, 15, 10]} /> */}
        <group ref={expGroupRef} name='exp-root-node'>
          {experience.contents?.map(content => (
            <Suspense key={content.instance_id} fallback={null}>
              <ContentSceneObject content={content} isInteractive />
            </Suspense>
          ))}
        </group>
        <Plane
          ref={surfaceRef}
          name='surface'
          args={[1000, 1000]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          visible={false}
        >
          <meshStandardMaterial color='hotpink' />
        </Plane>
      </scene>
    </Canvas>
  )
}

export default ExperienceXRScene
