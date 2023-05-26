import {
  CameraControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
  Grid,
  Select
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useAtom } from 'jotai'
import { useControls } from 'leva'
import { FC, memo, useRef } from 'react'

import AssetContentSceneObject from './AssetContentSceneObject'
import GizmoControls from './GizmoControls'
import { sceneAssetContentsAtom } from './state'

type Props = {
  mode: 'editor' | 'viewer'
}

const ExperienceScene: FC<Props> = memo(({ mode }) => {
  const [sceneContents, setSceneContents] = useAtom(sceneAssetContentsAtom)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const { gridSize, ...gridConfig } = useControls({
    gridSize: [15, 15],
    cellSize: { value: 0.1, min: 0, max: 10, step: 0.1 },
    cellThickness: { value: 0.8, min: 0, max: 5, step: 0.1 },
    cellColor: '#6f6f6f',
    sectionSize: { value: 1, min: 0, max: 10, step: 0.1 },
    sectionThickness: { value: 1.1, min: 0, max: 5, step: 0.1 },
    sectionColor: '#5afed4',
    fadeDistance: { value: 25, min: 0, max: 100, step: 1 },
    fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
    followCamera: false,
    infiniteGrid: true
  })

  return (
    <Canvas
      ref={canvasRef}
      shadows
      camera={{ position: [5, 6, 6], fov: 25 }}
      style={{ height: '100%', width: '100%' }}
    >
      <GizmoControls />
      <CameraControls makeDefault />
      <Environment preset='city' />
      <GizmoHelper alignment='bottom-right' margin={[80, 80]}>
        <GizmoViewport
          axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']}
          labelColor='white'
        />
      </GizmoHelper>
      <group position={[0, -0.5, 0]}>
        <Select>
          {sceneContents.map(content => (
            <AssetContentSceneObject
              key={content.instanceID}
              content={content}
            />
          ))}
        </Select>
        <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
      </group>
    </Canvas>
  )
})
export default ExperienceScene
