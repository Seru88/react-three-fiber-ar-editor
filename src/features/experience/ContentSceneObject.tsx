import {
  Center,
  Gltf,
  Image,
  Resize,
  useSelect,
  useTexture,
  useVideoTexture
} from '@react-three/drei'
import { currEditingAssetInstanceIDAtom } from 'features/editor/atoms'
import { useAtom } from 'jotai'
import { FC, memo, useCallback, useEffect } from 'react'
import { DoubleSide, MeshStandardMaterial } from 'three'

import { ContentTransform } from './api'
import { getSceneObjectParentByName } from './utils'

type Props = {
  content: ContentTransform
  isInteractive?: boolean
}

const ModelContentSceneObject: FC<Props> = memo(({ content }) => {
  if (!content.asset.url) return null
  return (
    <Resize>
      <Gltf src={content.asset.url} name={content.instance_id} />
    </Resize>
  )
})

const ImageContentSceneObject: FC<Props> = memo(
  ({ content, isInteractive }) => {
    const texture = useTexture(content.asset.url ?? '')

    const handleInteraction = () => {
      const { click_action } = content
      if (click_action) {
        switch (click_action.type) {
          case 'Link':
            window.open(click_action.target, '_blank')
            break
          case 'Email':
            window.open(click_action.target, '_blank')
            break
          default:
            break
        }
      }
    }

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
          onPointerDown={isInteractive ? handleInteraction : undefined}
        />
      </Resize>
    )
  }
)

const VideoContentSceneObject: FC<Props> = memo(
  ({ content, isInteractive }) => {
    const texture = useVideoTexture(content.asset.url ?? '', {
      muted: false,
      start: false,
      id: content.instance_id
    })

    const handlePlayback = useCallback(() => {
      const video = texture.image as HTMLVideoElement
      if (video.paused) video.play()
      else video.pause()
    }, [texture])

    useEffect(() => {
      const video = texture.image as HTMLVideoElement
      if (typeof content.playback_settings?.volume === 'number') {
        video.volume = content.playback_settings.volume
      }
    }, [content.playback_settings?.volume, texture])

    useEffect(() => {
      // Append to document so that we can retrieve element from elsewhere.
      const video = texture.image as HTMLVideoElement
      video.style.display = 'none'
      document.body.appendChild(video)
      return () => {
        document.body.removeChild(video)
      }
    }, [texture])

    return (
      <Resize>
        <mesh
          onPointerDown={isInteractive ? handlePlayback : undefined}
          name={`${content.instance_id}`}
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

const ContentSceneObject: FC<Props> = memo(({ content, isInteractive }) => {
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
      {content.asset.content_type.includes('image') ? (
        <ImageContentSceneObject
          content={content}
          isInteractive={isInteractive}
        />
      ) : null}
      {content.asset.content_type.includes('video') ? (
        <VideoContentSceneObject
          content={content}
          isInteractive={isInteractive}
        />
      ) : null}
      {content.asset.content_type === 'model/gltf-binary' ? (
        <ModelContentSceneObject
          content={content}
          isInteractive={isInteractive}
        />
      ) : null}
    </Center>
  )
})

export default ContentSceneObject
