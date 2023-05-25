import { FC, memo, useEffect } from 'react'
import { AssetContent } from './api'
import {
  Center,
  Resize,
  useGLTF,
  useSelect,
  Image,
  useVideoTexture
} from '@react-three/drei'
import { useSetAtom } from 'jotai'
import { currentContentAtom } from './atoms'
import useAssetContentUrls from './useAssetContentUrl'
import { Event, Object3D } from 'three'

type Props = {
  content: AssetContent
  access_token?: string
}

const ModelContentSceneObject: FC<Props & { src: string }> = memo(
  ({ content, src }) => {
    const { scene: rootObj } = useGLTF(src)
    rootObj.children[0].name = content.instance_id
    return (
      <Center name={`${content.instance_id}-bound`} top>
        <Resize>
          <primitive object={rootObj} />
        </Resize>
      </Center>
    )
  }
)

const TextureContentSceneObject: FC<Props & { src: string }> = memo(
  ({ content, src }) => {
    return (
      <Center name={`${content.instance_id}-bound`} top>
        <Resize>
          <Image name={`${content.instance_id}`} url={src} />
        </Resize>
      </Center>
    )
  }
)

const VideoContentSceneObject: FC<Props & { src: string }> = memo(
  ({ content, src }) => {
    const texture = useVideoTexture(src, { muted: true, start: true })

    return (
      <Center name={`${content.instance_id}-bound`} top>
        <Resize>
          <mesh name={`${content.instance_id}`} scale={[1.6, 0.9, 1]}>
            <planeGeometry />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        </Resize>
      </Center>
    )
  }
)

const getParentByName = (
  obj: Object3D<Event>,
  name: string
): Object3D<Event> | undefined => {
  if (obj.parent) {
    return obj.parent.name === name
      ? obj.parent
      : getParentByName(obj.parent, name)
  }
  return undefined
}

const AssetContentSceneObject: FC<Props> = memo(({ content, access_token }) => {
  const { backup_url } = useAssetContentUrls(
    content.uuid,
    undefined,
    access_token,
    { revalidateOnFocus: false }
  )

  const setCurrentContentAtom = useSetAtom(currentContentAtom)
  const selected = useSelect().find(mesh => {
    if (mesh.name !== content.instance_id) {
      return Boolean(getParentByName(mesh, content.instance_id))
    }
    return mesh.name === content.instance_id
  })

  useEffect(() => {
    setCurrentContentAtom(selected ? content.instance_id : null)
  }, [selected, setCurrentContentAtom, content.instance_id])

  if (backup_url) {
    if (content.type === '3d') {
      return <ModelContentSceneObject content={content} src={backup_url} />
    }
    if (content.type === 'image') {
      return <TextureContentSceneObject content={content} src={backup_url} />
    }
    if (content.type === 'video') {
      return <VideoContentSceneObject content={content} src={backup_url} />
    }
  }

  return null
})

export default AssetContentSceneObject
