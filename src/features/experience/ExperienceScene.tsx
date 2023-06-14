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
// import { useControls } from 'leva'
import { FC, Suspense, memo, useRef } from 'react'

import AssetContentSceneObject from './AssetContentSceneObject'
import SelectedSceneObjectTransformControls from './SelectedSceneObjectTransformControls'
import { sceneAssetContentsAtom } from './state'
// import { expSceneAtom } from './state'
import environment_src from 'assets/textures/potsdamer_platz_1k.hdr'
import { hslStringToValues, hslToHex } from './utils'

type Props = {
  mode: 'editor' | 'viewer'
}

const ExperienceScene: FC<Props> = memo(({ mode }) => {
  const [sceneContents] = useAtom(sceneAssetContentsAtom)
  // const [, setExpSceneState] = useAtom(expSceneAtom)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // const { Transform /* ...gridConfig */ } = useControls({
  //   Transform: {
  //     options: { Translate: 'translate', Rotate: 'rotate', Scale: 'scale' }
  //   }
  //   // cellSize: { value: 0.1, min: 0, max: 10, step: 0.1 },
  //   // cellThickness: { value: 0.8, min: 0, max: 5, step: 0.1 },
  //   // cellColor: '#6f6f6f',
  //   // sectionSize: { value: 1, min: 0, max: 10, step: 0.1 },
  //   // sectionThickness: { value: 1.1, min: 0, max: 5, step: 0.1 },
  //   // sectionColor: '#5afed4',
  //   // fadeDistance: { value: 25, min: 0, max: 100, step: 1 },
  //   // fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
  //   // followCamera: false,
  //   // infiniteGrid: true
  // })

  // useEffect(() => {
  //   setExpSceneState(prev => ({
  //     ...prev,
  //     gizmo: Transform as 'translate' | 'rotate' | 'scale'
  //   }))
  // }, [Transform, setExpSceneState])

  return (
    <Canvas ref={canvasRef} camera={{ position: [5, 6, 6], fov: 25 }}>
      {mode === 'editor' && <SelectedSceneObjectTransformControls />}
      <CameraControls makeDefault />
      <Environment files={environment_src} />
      <GizmoHelper alignment='bottom-right' margin={[80, 80]}>
        <GizmoViewport
          axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']}
          labelColor='white'
        />
      </GizmoHelper>
      <group position={[0, -0.5, 0]}>
        <Select>
          {sceneContents.map(content => (
            <Suspense key={content.instanceID} fallback={null}>
              <AssetContentSceneObject content={content} />
            </Suspense>
          ))}
        </Select>
        <Grid
          position={[0, -0.01, 0]}
          args={[15, 15]}
          cellSize={0.1}
          cellThickness={0.8}
          cellColor='#6f6f6f'
          sectionSize={1}
          sectionThickness={1.1}
          sectionColor={hslToHex(
            ...hslStringToValues(
              getComputedStyle(
                // @ts-expect-error Exists
                document.querySelector(':root')
              ).getPropertyValue('--s')
            )
          )}
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      </group>
    </Canvas>
  )
})
export default ExperienceScene
