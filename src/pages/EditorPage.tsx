import clsx from 'clsx'
import ExperienceScene from 'features/experience/ExperienceScene'
import {
  experienceAtom,
  experienceQueryAtom,
  sceneAssetContentsAtom,
  SceneAssetContentState
} from 'features/experience/state'
import { generateInstanceID } from 'features/experience/utils'
import { useAtom } from 'jotai'
import {
  ChangeEvent,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState
} from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { HexColorPicker } from 'react-colorful'

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
  const [appType, setAppType] = useState('')
  const [appName, setAppName] = useState('')
  const [appDescription, setAppDescriptionn] = useState('')
  const [appLandingBG, setAppLandingBG] = useState('')
  const [appLogo, setAppLogo] = useState('')
  const [appLandingImg, setAppLandingImg] = useState('')
  const [appLandingText, setAppLandingText] = useState('')
  const [launchBtnColor, setLaunchBtnColor] = useState('#aabbcc')

  const handleAppTypeSelect = (ev: ChangeEvent<HTMLSelectElement>) => {
    ev.preventDefault()
    setAppType(ev.target.value)
  }

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
          className='modal-box h-dynamic-screen w-11/12 max-w-none'
        >
          <button className='btn-ghost btn-sm btn-circle btn absolute right-2 top-2'>
            ✕
          </button>
          <div className='carousel h-full w-full'>
            <div id='apps' className='carousel-item w-full'>
              <div className='w-full'>
                <h3 className='mb-4 text-xl font-medium text-base-content'>
                  Create a New App
                </h3>
                <div className='w-full space-x-2'>
                  <select
                    className='select-primary select w-full max-w-xs'
                    value={appType}
                    onChange={handleAppTypeSelect}
                  >
                    <option disabled value=''>
                      Pick the type of app.
                    </option>
                    <option value='webxr_mr'>WebXR and MR</option>
                    <option disabled value='ar_native'>
                      AR (Native)
                    </option>
                  </select>
                  <a
                    className={clsx(
                      'btn',
                      appType === '' ? 'btn-disabled' : 'btn-primary'
                    )}
                    href='#app-customize'
                  >
                    Start
                  </a>
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
              </div>
            </div>
            <div id='app-customize' className='carousel-item w-full'>
              <div className='flex w-full flex-col'>
                <h3 className='mb-4 text-xl font-medium text-base-content'>
                  Customize Your App
                </h3>
                <div className='grid w-full flex-grow grid-cols-2 gap-4'>
                  {/* Left Side */}
                  <div className='space-y-4'>
                    <input
                      type='text'
                      placeholder='App Name'
                      className='input-bordered input w-full'
                      value={appName}
                      onChange={ev => {
                        ev.preventDefault()
                        setAppName(ev.target.value)
                      }}
                    />
                    <textarea
                      className='textarea-bordered textarea w-full'
                      placeholder='App Description'
                      value={appDescription}
                      onChange={ev => {
                        ev.preventDefault()
                        setAppDescriptionn(ev.target.value)
                      }}
                    />
                    {/* <input
                      type='text'
                      placeholder='App Name'
                      className='input-bordered input w-full max-w-xs'
                    /> */}
                    {/* <div className='join'>
                      <input
                        className='join-item btn'
                        type='radio'
                        name='options'
                        aria-label='Landing'
                      />
                      <input
                        className='join-item btn'
                        type='radio'
                        name='options'
                        aria-label='Instructions'
                      />
                    </div> */}
                    <div className='tabs tabs-boxed mx-auto max-w-max'>
                      <a className='tab tab-active'>Landing</a>
                      <a className='tab'>Instructions</a>
                      <a className='tab'>Misc.</a>
                    </div>
                    <div className='form-control w-full'>
                      <label className='label'>
                        <span className='label-text'>Pick a background</span>
                      </label>
                      <input
                        type='file'
                        className='file-input-bordered file-input w-full'
                        accept='image/png, image/jpeg, image/jpg'
                        onChange={ev => {
                          ev.preventDefault()
                          const file = ev.target.files?.item(0)
                          if (file) {
                            setAppLandingBG(URL.createObjectURL(file))
                          }
                        }}
                      />
                    </div>
                    <div className='form-control w-full'>
                      <label className='label'>
                        <span className='label-text'>Pick a logo</span>
                      </label>
                      <input
                        type='file'
                        className='file-input-bordered file-input w-full'
                        accept='image/png, image/jpeg, image/jpg'
                        onChange={ev => {
                          ev.preventDefault()
                          const file = ev.target.files?.item(0)
                          if (file) {
                            setAppLogo(URL.createObjectURL(file))
                          }
                        }}
                      />
                    </div>
                    <div className='form-control w-full'>
                      <label className='label'>
                        <span className='label-text'>Pick an image</span>
                      </label>
                      <input
                        type='file'
                        className='file-input-bordered file-input w-full'
                        accept='image/png, image/jpeg, image/jpg'
                        onChange={ev => {
                          ev.preventDefault()
                          const file = ev.target.files?.item(0)
                          if (file) {
                            setAppLandingImg(URL.createObjectURL(file))
                          }
                        }}
                      />
                    </div>
                    <input
                      type='text'
                      placeholder='Landing Text'
                      className='input-bordered input w-full'
                      value={appLandingText}
                      onChange={ev => {
                        ev.preventDefault()
                        setAppLandingText(ev.target.value)
                      }}
                    />
                    <HexColorPicker
                      color={launchBtnColor}
                      onChange={setLaunchBtnColor}
                    />
                    ;
                  </div>
                  {/* Right Side */}
                  <div className='flex h-full flex-col items-center justify-center'>
                    <div className='mockup-phone'>
                      <div className='camera'></div>
                      <div className='display'>
                        <div
                          className='phone-2 artboard artboard-demo relative justify-start space-y-4 bg-cover bg-center bg-no-repeat px-4 py-8'
                          style={{
                            backgroundImage: appLandingBG
                              ? `url(${appLandingBG})`
                              : undefined
                          }}
                        >
                          <div className='mx-auto h-1/5 w-11/12 max-w-xs'>
                            {appLogo ? (
                              <img
                                className='mx-auto max-h-full max-w-full rounded-lg'
                                src={appLogo}
                                alt='App Logo'
                              />
                            ) : (
                              <div className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border'>
                                Logo
                              </div>
                            )}
                          </div>
                          <div className='mx-auto h-2/5 w-11/12 max-w-xs space-y-2'>
                            {appLandingImg ? (
                              <img
                                className='mx-auto max-h-full max-w-full rounded-lg'
                                src={appLandingImg}
                                alt='App Landing Image'
                              />
                            ) : (
                              <div className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border'>
                                Landing Image
                              </div>
                            )}
                            {appLandingText ? (
                              <div className='text-center'>
                                {appLandingText}
                              </div>
                            ) : (
                              <div className='mx-auto flex max-w-full flex-col items-center justify-center rounded-lg border'>
                                Landing Text
                              </div>
                            )}
                          </div>
                          <div className='absolute bottom-14 mx-auto h-10 w-11/12 max-w-xs'>
                            <div
                              className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border'
                              style={{
                                backgroundColor: launchBtnColor ?? undefined
                              }}
                            >
                              Initiation Button
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
