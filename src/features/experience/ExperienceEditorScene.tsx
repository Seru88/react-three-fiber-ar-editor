import {
  CameraControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
  Grid,
  Select
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import environment_src from 'assets/textures/potsdamer_platz_1k.hdr'
import { FC, memo, Suspense, useEffect, useRef, useState } from 'react'

import { Experience } from './api'
import ContentSceneObject from './AssetContentSceneObject'
import SelectedSceneObjectTransformControls from './SelectedSceneObjectTransformControls'
import { hslStringToValues, hslToHex } from './utils'

type Props = {
  experience: Experience | null
}

const ExperienceEditorScene: FC<Props> = memo(({ experience }) => {
  const [cellColor, setCellColor] = useState(
    hslToHex(
      ...hslStringToValues(
        getComputedStyle(
          // @ts-expect-error Exists
          document.querySelector(':root')
        ).getPropertyValue('--bc')
      )
    )
  )
  const [sectionColor, setSectionColor] = useState(
    hslToHex(
      ...hslStringToValues(
        getComputedStyle(
          // @ts-expect-error Exists
          document.querySelector(':root')
        ).getPropertyValue('--p')
      )
    )
  )
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setSectionColor(
        hslToHex(
          ...hslStringToValues(
            getComputedStyle(
              // @ts-expect-error Exists
              document.querySelector(':root')
            ).getPropertyValue('--p')
          )
        )
      )
      setCellColor(
        hslToHex(
          ...hslStringToValues(
            getComputedStyle(
              // @ts-expect-error Exists
              document.querySelector(':root')
            ).getPropertyValue('--bc')
          )
        )
      )
    })
    const observerConfig = {
      attributes: true,
      childList: false,
      characterData: false,
      attributeOldValue: true
    }
    const targetNode = document.querySelector(':root')
    if (targetNode) {
      observer.observe(targetNode, observerConfig)
    }
  }, [])

  return (
    <Canvas ref={canvasRef} camera={{ position: [5, 6, 6], fov: 25 }}>
      <SelectedSceneObjectTransformControls />
      <CameraControls makeDefault />
      <Environment files={environment_src} />
      <GizmoHelper alignment='top-right' margin={[70, 70]}>
        <GizmoViewport
          axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']}
          labelColor='white'
        />
      </GizmoHelper>
      <group position={[0, -0.5, 0]}>
        <Select>
          {experience?.contents?.map(content => (
            <Suspense key={content.instance_id} fallback={null}>
              <ContentSceneObject content={content} />
            </Suspense>
          ))}
        </Select>
        <Grid
          position={[0, -0.01, 0]}
          args={[15, 15]}
          cellSize={0.2}
          cellThickness={0.8}
          cellColor={cellColor}
          sectionSize={1}
          sectionThickness={1.1}
          sectionColor={sectionColor}
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      </group>
    </Canvas>
  )
})
export default ExperienceEditorScene
