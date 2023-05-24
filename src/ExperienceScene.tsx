import { useRef } from 'react'
import {
  AccumulativeShadows,
  CameraControls,
  Center,
  Environment,
  GizmoHelper,
  GizmoViewport,
  Grid,
  Image,
  OrbitControls,
  RandomizedLight,
  Select,
  useGLTF,
  useSelect
} from '@react-three/drei'
import { Canvas, MeshProps } from '@react-three/fiber'
import { useControls } from 'leva'

export default function ExperienceScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const { gridSize, ...gridConfig } = useControls({
    gridSize: [10.5, 10.5],
    cellSize: { value: 0.6, min: 0, max: 10, step: 0.1 },
    cellThickness: { value: 1, min: 0, max: 5, step: 0.1 },
    cellColor: '#6f6f6f',
    sectionSize: { value: 3.3, min: 0, max: 10, step: 0.1 },
    sectionThickness: { value: 1.5, min: 0, max: 5, step: 0.1 },
    sectionColor: '#5afed4',
    fadeDistance: { value: 25, min: 0, max: 100, step: 1 },
    fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
    followCamera: false,
    infiniteGrid: true
  })

  return (
    <div className='h-dynamic-screen w-full bg-[#303035]'>
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ position: [10, 12, 12], fov: 25 }}
        style={{ height: '100%', width: '100%' }}
      >
        <OrbitControls makeDefault />
        <Environment preset='city' />
        <GizmoHelper alignment='bottom-right' margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']}
            labelColor='white'
          />
        </GizmoHelper>
        <group position={[0, -0.5, 0]}>
          {/* <Select>
            <Model
              name='ground'
              src='https://d14rrnndiq61gj.cloudfront.net/assets/staging/413312ca-e9d2-11eb-8d4d-8dd64856cc31?Expires=1683948598&Signature=P-ahXBrSgF-2GVPV6W2PM-qoJStwvixpZUh~9YzbYcQOgFI7PzJcQ5aOqPRWMfHunMzsEmnEGc~t8Hog4l2Mk-KyiJKZ1CSpM3B56iri5K4w-Jd0ATdmJ21jLekCzTZcfIeXLzoOWWoQoS81qgVrQc6ZL8IXb3TuGJBsFc28yQ4Sc~8t6io1mdhseNlgMrVxPdL7gEujEKOJf5zwCUwD3lkM8uGFSVKn4JLa6wqO2HnYw69ASc6MIyp-M5PhBO7S4~5NpOjq1oIxGhLUOigBDMu2yH0DVh7HK8-n2JIhfHOifmxW6WGbLgpGgzGBL2rnb01IAmD0wGuOplaSc6~elg__&Key-Pair-Id=APKAIMYBUSD4ZHKVTWLA'
              // src='https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/suzanne-high-poly/model.gltf'
              centerProps={{ 'rotation-x': rotation, top: true }}
            />
            <Model
              name='castle'
              // src='https://d14rrnndiq61gj.cloudfront.net/assets/staging/3857dffa-e9d2-11eb-a557-eb54eef34c07?Expires=1683950209&Signature=O3AZh0mPD8ON-unQdemw~86LQXZINRZbKyzadJYjYCB8IqXSZ7WFUDKkEp3oA2TRE2bMI2x-tHNoju8nrEJTwGIFJySSi-izIpJ3-04W5Pajj3isv1YjezqD5hOMQP3zBuH8Pb5eNmHPHN-PatsEfaHmIwZXLyVdgeY59UwBnzaVoJFVAFKeGzOmVB3lJVrzVoL1TVu7dvOrPoOiLGDJG5152m7j1W7ykZ2jonDNu-7rxYYWlAdIagduH-jeOSQEd-jD0UgAQDYmyBGsbD5ovTg1e-Crq9lupJLN5eKVzvRCCfdQiygYi4uLIODhCV5ykc6HzpWtYWGp1j-H~d1vgg__&Key-Pair-Id=APKAIMYBUSD4ZHKVTWLA'
              src='https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/suzanne-high-poly/model.gltf'
              centerProps={{
                'rotation-x': rotation,
                top: true,
                'position-x': 1
              }}
            />
          </Select> */}
          <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
        </group>
      </Canvas>
    </div>
  )
}
