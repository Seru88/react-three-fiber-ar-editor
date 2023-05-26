import {
  Center,
  Gltf,
  Image,
  Resize,
  useSelect,
  useVideoTexture
} from '@react-three/drei'
import { useSetAtom } from 'jotai'
import { FC, memo, useEffect } from 'react'
import { DoubleSide, Material } from 'three'

import { AssetContent } from './api'
import { SceneAssetContentState, currentContentAtom } from './state'
// import useAssetContentUrls from './useAssetContentUrl'
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
    return (
      <Center name={`${content.instanceID}-bound`} top>
        <Resize>
          <Image
            name={`${content.instanceID}`}
            url={src}
            ref={mesh => {
              if (mesh) {
                ;(mesh.material as Material).side = DoubleSide
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
    const texture = useVideoTexture(src, { muted: true, start: true })

    return (
      <Center name={`${content.instanceID}-bound`} top>
        <Resize>
          <mesh name={`${content.instanceID}`} scale={[1.6, 0.9, 1]}>
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
  // const { backup_url } = useAssetContentUrls(
  //   content.uuid,
  //   undefined,
  //   access_token,
  //   { revalidateOnFocus: false }
  // )

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

  if (content.type === '3d') {
    return <ModelContentSceneObject content={content} src={content.src} />
  }
  if (content.type === 'image') {
    return <TextureContentSceneObject content={content} src={content.src} />
  }
  if (content.type === 'video') {
    return <VideoContentSceneObject content={content} src={content.src} />
  }

  return null
})

export default AssetContentSceneObject
