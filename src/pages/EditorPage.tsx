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
const exampleProjects = [
  { title: 'Colgate Yearbook', type: 'AR (Native)' },
  { title: 'Little Red Fasion', type: 'AR (Native)' },
  { title: 'TMI Magazie', type: 'AR (Native)' },
  { title: 'ES1', type: 'WebXR and MR' },
  { title: 'Livers', type: 'WebXR and MR' },
  { title: 'Emancipation', type: 'AR (Native)' }
]

export default function EditorPage() {
  const [searchParams] = useSearchParams()
  const [, setQuery] = useAtom(experienceQueryAtom)
  const [experience] = useAtom(experienceAtom)
  const [, setSceneContents] = useAtom(sceneAssetContentsAtom)

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

  useEffect(() => {
    const uuid = searchParams.get('uuid') ?? undefined
    const short_code = searchParams.get('short_code') ?? undefined
    setQuery({ uuid, short_code })
  }, [searchParams, setQuery])

  useEffect(() => {
    if (experience.isSuccess) {
      if (experience.data) {
        setSceneContents(
          experience.data.asset_transform_info?.map<SceneAssetContentState>(
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
      } else {
        if (!window.apps_modal.open) {
          window.apps_modal.showModal()
        }
      }
    }
  }, [experience.isSuccess, experience.data, setSceneContents])

  return (
    <div className='relative h-full w-full bg-neutral' {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive && experience.data ? (
        <FileUploadBackdrop>Drag n' drop file here.</FileUploadBackdrop>
      ) : null}
      <dialog id='apps_modal' className='modal'>
        <form
          method='dialog'
          className='modal-box h-dynamic-screen w-11/12 max-w-7xl'
        >
          <button className='btn-ghost btn-sm btn-circle btn absolute right-2 top-2'>
            ✕
          </button>
          <h3 className='mb-4 text-xl font-medium text-base-content'>
            Create a New App
          </h3>
          <div className='w-full space-x-2'>
            <select className='select-primary select w-full max-w-xs'>
              <option disabled selected>
                Pick the type of app.
              </option>
              <option>WebXR and MR</option>
              <option>AR (Native)</option>
            </select>
            <button
              className='btn-primary btn'
              onClick={ev => {
                ev.preventDefault()
              }}
            >
              Start
            </button>
          </div>
          <div className='divider' />
          <h3 className='mb-4 text-xl font-medium text-base-content'>
            Your Apps
          </h3>
          <div className='grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {exampleProjects.map(p => (
              <div key={p.title} className='card-bordered card'>
                <div className='card-body flex flex-col justify-center'>
                  <div className='text-lg font-bold'>{p.title}</div>
                  <div>{p.type}</div>
                </div>
              </div>
            ))}
          </div>
        </form>
      </dialog>
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
