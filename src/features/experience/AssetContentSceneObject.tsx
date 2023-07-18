import {
  Center,
  Gltf,
  Image,
  Resize,
  useSelect,
  useTexture,
  useVideoTexture
} from '@react-three/drei'
import { useAtom } from 'jotai'
import { FC, memo, useEffect } from 'react'
import { DoubleSide, MeshStandardMaterial } from 'three'

import { getSceneObjectParentByName } from './utils'
import { ContentTransform } from './api'
import { currEditingAssetInstanceIDAtom } from 'features/editor/atoms'

type Props = {
  content: ContentTransform
}

const ModelContentSceneObject: FC<Props> = memo(({ content }) => {
  if (!content.asset_url) return null
  return (
    <Resize>
      <Gltf src={content.asset_url} name={content.instance_id} />
    </Resize>
  )
})

const ImageContentSceneObject: FC<Props> = memo(({ content }) => {
  const texture = useTexture(content.asset_url ?? '')
  return (
    <Resize>
      <Image
        scale={[texture.image.width, texture.image.height]}
        name={`${content.instance_id}`}
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
})

const VideoContentSceneObject: FC<Props> = memo(({ content }) => {
  const texture = useVideoTexture(content.asset_url ?? '', {
    muted: true,
    start: true
  })
  return (
    <Resize>
      <mesh
        name={`${content.instance_id}`}
        scale={[texture.image.videoWidth, texture.image.videoHeight, 1]}
      >
        <planeGeometry />
        <meshBasicMaterial map={texture} toneMapped={false} side={DoubleSide} />
      </mesh>
    </Resize>
  )
})

const ContentSceneObject: FC<Props> = memo(({ content }) => {
  const [, setEditingAssetInstanceID] = useAtom(currEditingAssetInstanceIDAtom)

  const selected = useSelect().find(mesh => {
    if (mesh.name !== content.instance_id) {
      return Boolean(getSceneObjectParentByName(mesh, content.instance_id))
    }
    return mesh.name === content.instance_id
  })

  useEffect(() => {
    setEditingAssetInstanceID(selected ? content.instance_id : '')
  }, [selected, content.instance_id, setEditingAssetInstanceID])

  return (
    <Center
      name={`${content.instance_id}-bound`}
      top
      position={content.position}
      rotation={content.rotation}
      scale={content.scale}
    >
      {content.content_type.includes('image') ? (
        <ImageContentSceneObject content={content} />
      ) : null}
      {content.content_type.includes('video') ? (
        <VideoContentSceneObject content={content} />
      ) : null}
      {content.content_type === 'model/gltf-binary' ? (
        <ModelContentSceneObject content={content} />
      ) : null}
    </Center>
  )
})

export default ContentSceneObject
