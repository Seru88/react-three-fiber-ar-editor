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

import { currentContentAtom, SceneAssetContentState } from './atoms'
import { getSceneObjectParentByName } from './utils'

type Props = {
  content: SceneAssetContentState
}

const ModelContentSceneObject: FC<Props> = memo(
  ({ content: { src, instanceID } }) => {
    return (
      <Resize>
        <Gltf src={src} name={instanceID} />
      </Resize>
    )
  }
)

const TextureContentSceneObject: FC<Props> = memo(
  ({ content: { src, instanceID } }) => {
    const texture = useTexture(src)
    return (
      <Resize>
        <Image
          scale={[texture.image.width, texture.image.height]}
          name={`${instanceID}`}
          texture={texture}
          transparent
          ref={mesh => {
            if (mesh) {
              const material = mesh.material as MeshStandardMaterial
              material.side = DoubleSide
            }
          }}
        />
      </Resize>
    )
  }
)

const VideoContentSceneObject: FC<Props> = memo(
  ({ content: { src, instanceID } }) => {
    const texture = useVideoTexture(src, {
      muted: true,
      start: true
    })
    return (
      <Resize>
        <mesh
          name={`${instanceID}`}
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

  return (
    <Center name={`${content.instanceID}-bound`} top>
      {content.type === 'audio' ? null : null}
      {content.type === '3d' ? (
        <ModelContentSceneObject content={content} />
      ) : null}
      {content.type === 'image' ? (
        <TextureContentSceneObject content={content} />
      ) : null}
      {content.type === 'video' ? (
        <VideoContentSceneObject content={content} />
      ) : null}
    </Center>
  )
})

export default AssetContentSceneObject
