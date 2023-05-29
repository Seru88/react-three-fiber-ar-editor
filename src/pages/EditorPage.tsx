import ExperienceScene from 'features/experience/ExperienceScene'
import {
  experienceAtom,
  experienceQueryAtom,
  sceneAssetContentsAtom,
  SceneAssetContentState
} from 'features/experience/state'
import { generateInstanceID } from 'features/experience/utils'
import { useAtom } from 'jotai'
import { FC, PropsWithChildren, useCallback, useEffect } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'

const MEGABYTE = 1000000

export default function EditorPage() {
  const [searchParams] = useSearchParams()
  const [, setQuery] = useAtom(experienceQueryAtom)
  const [experience] = useAtom(experienceAtom)
  const [, setSceneContents] = useAtom(sceneAssetContentsAtom)

  useEffect(() => {
    const uuid = searchParams.get('uuid') ?? undefined
    const short_code = searchParams.get('short_code') ?? undefined
    setQuery({ uuid, short_code })
  }, [searchParams, setQuery])

  useEffect(() => {
    if (experience.isSuccess) {
      setSceneContents(
        experience.data?.asset_transform_info?.map<SceneAssetContentState>(
          content => ({
            instanceID: generateInstanceID(),
            position: [0, 0, 0],
            quaternion: [0, 0, 0, 1],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            src: content.url,
            type: content.type
          })
        ) ?? []
      )
    }
  }, [experience, setSceneContents])

  const handleFileAccepted = useCallback(
    (files: File[]) => {
      const file = files[0]
      const src = URL.createObjectURL(file)
      const type = file.type.includes('image')
        ? 'image'
        : file.type.includes('video')
        ? 'video'
        : '3d'
      setSceneContents(prev => [
        ...prev,
        {
          instanceID: generateInstanceID(),
          position: [0, 0, 0],
          quaternion: [0, 0, 0, 1],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          src: src,
          type
        }
      ])
    },
    [setSceneContents]
  )

  const handleFileRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0]
    toast.error(rejection.errors[0].message)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'video/mp4': [],
      'video/webm': [],
      'model/gltf-binary': ['.glb', '.gltf']
    },
    maxSize: 16 * MEGABYTE,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: handleFileAccepted,
    onDropRejected: handleFileRejected
  })

  return (
    <div
      className='relative h-dynamic-screen w-full bg-[#303035]'
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive && (
        <FileUploadBackdrop>Drag n' drop file here.</FileUploadBackdrop>
      )}
      <ExperienceScene mode='editor' />
    </div>
  )
}

const FileUploadBackdrop: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className='absolute z-50 flex h-full w-full flex-col items-center justify-center bg-teal-200 bg-opacity-25 text-white'>
      {children}
    </div>
  )
}
