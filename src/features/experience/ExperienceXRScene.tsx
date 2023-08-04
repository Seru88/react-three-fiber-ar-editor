import { FC, useRef, Suspense, useEffect } from 'react'
import { Experience } from './api'
import { Canvas } from '@react-three/fiber'
import { Scene } from 'three'
import ContentSceneObject from './AssetContentSceneObject'
import XR8Scene from 'features/8thwall/XR8Scene'

type Props = {
  experience: Experience
}

const ExperienceXRScene: FC<Props> = ({ experience }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sceneRef = useRef<Scene | null>(null)

  const { onxrloaded /* cubeCamera */ } = XR8Scene(canvasRef, sceneRef)

  useEffect(() => {
    window.XRExtras.Loading.showLoading({ onxrloaded })
  }, [onxrloaded])

  return (
    <Canvas ref={canvasRef} style={{ position: 'absolute', zIndex: -50 }}>
      <scene ref={sceneRef}>
        <ambientLight />
        <pointLight position={[10, 15, 10]} />
        {experience.contents?.map(content => (
          <Suspense key={content.instance_id} fallback={null}>
            <ContentSceneObject content={content} />
          </Suspense>
        ))}
      </scene>
    </Canvas>
  )
}

export default ExperienceXRScene
