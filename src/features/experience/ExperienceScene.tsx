import {
  CameraControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
  Grid,
  Select
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
// import { useAtom } from 'jotai'
// import { useControls } from 'leva'
import {
  FC,
  Suspense,
  /* Suspense, */ memo,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

// import AssetContentSceneObject from './AssetContentSceneObject'
import SelectedSceneObjectTransformControls from './SelectedSceneObjectTransformControls'
// import { sceneAssetContentsAtom } from './atoms'
// import { expSceneAtom } from './state'
import environment_src from 'assets/textures/potsdamer_platz_1k.hdr'
import { hslStringToValues, hslToHex } from './utils'
import { ContentTransform, Experience } from './api'
import ContentSceneObject from './AssetContentSceneObject'
import { useQuery } from '@tanstack/react-query'
import { getAssets } from 'features/asset/api'

type Props = {
  mode: 'editor' | 'viewer'
  experience: Experience | null
}

const ExperienceScene: FC<Props> = memo(({ mode, experience }) => {
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

  const assets = useQuery({
    refetchOnWindowFocus: false,
    retry: false,
    queryKey: [experience?.id, experience?.transform?.length],
    queryFn: async ({ queryKey: [experience_id] }) => {
      return await getAssets({ experience_id })
    }
  })

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

  const contents = useMemo(() => {
    if (experience?.transform?.length && assets.data) {
      return experience.transform.map<ContentTransform>(content => ({
        ...content,
        asset_url:
          assets.data.find(a => a.uuid === content.asset_uuid)?.url ??
          content.asset_url ??
          ''
      }))
    }
    return []
  }, [assets, experience?.transform])

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
      {mode === 'editor' && <SelectedSceneObjectTransformControls />}
      <CameraControls makeDefault />
      <Environment files={environment_src} />
      <GizmoHelper alignment='top-right' margin={[80, 80]}>
        <GizmoViewport
          axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']}
          labelColor='white'
        />
      </GizmoHelper>
      <group position={[0, -0.5, 0]}>
        <Select>
          {contents?.map(content => (
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
export default ExperienceScene
