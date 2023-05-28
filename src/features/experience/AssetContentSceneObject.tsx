import {
  Center,
  Gltf,
  Image,
  Resize,
  useSelect,
  useTexture,
  useVideoTexture
} from '@react-three/drei'
import { useSetAtom } from 'jotai'
import { FC, memo, useEffect } from 'react'
import { DoubleSide, MeshStandardMaterial } from 'three'

import { currentContentAtom, SceneAssetContentState } from './state'
import { getSceneObjectParentByName } from './utils'

type Props = {
  content: SceneAssetContentState
}

const ModelContentSceneObject: FC<Props & { src: string }> = memo(
  ({ content, src }) => {
    return (
      <Center name={`${content.instanceID}-bound`} top>
        <Resize>
          <Gltf src={src} name={content.instanceID} />
        </Resize>
      </Center>
    )
  }
)

const TextureContentSceneObject: FC<Props & { src: string }> = memo(
  ({ content, src }) => {
    const texture = useTexture(src)
    return (
      <Center name={`${content.instanceID}-bound`} top>
        <Resize>
          <Image
            scale={[texture.image.width, texture.image.height]}
            name={`${content.instanceID}`}
            texture={texture}
            ref={mesh => {
              if (mesh) {
                const material = mesh.material as MeshStandardMaterial
                material.side = DoubleSide
              }
            }}
          />
        </Resize>
      </Center>
    )
  }
)

const VideoContentSceneObject: FC<Props & { src: string }> = memo(
  ({ content, src }) => {
    const texture = useVideoTexture(src, {
      muted: true,
      start: true
    })
    return (
      <Center name={`${content.instanceID}-bound`} top>
        <Resize>
          <mesh
            name={`${content.instanceID}`}
            scale={[texture.image.videoWidth, texture.image.videoHeight, 1]}
          >
            <planeGeometry />
            <meshBasicMaterial
              map={texture}
              toneMapped={false}
              side={DoubleSide}
            />
          </mesh>
        </Resize>
      </Center>
    )
  }
)

const AssetContentSceneObject: FC<Props> = memo(({ content }) => {
  const setCurrentContentAtom = useSetAtom(currentContentAtom)
  const selected = useSelect().find(mesh => {
    if (mesh.name !== content.instanceID) {
      return Boolean(getSceneObjectParentByName(mesh, content.instanceID))
    }
    return mesh.name === content.instanceID
  })

  useEffect(() => {
    setCurrentContentAtom(selected ? content.instanceID : null)
  }, [selected, setCurrentContentAtom, content.instanceID])

  switch (content.type) {
    case 'audio':
      return null
    case '3d':
      return <ModelContentSceneObject content={content} src={content.src} />
    case 'image':
      return <TextureContentSceneObject content={content} src={content.src} />
    case 'video':
      return <VideoContentSceneObject content={content} src={content.src} />
    default:
      return null
  }
})

export default AssetContentSceneObject
