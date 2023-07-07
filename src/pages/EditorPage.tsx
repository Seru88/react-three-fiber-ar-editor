import clsx from 'clsx'
import ExperienceScene from 'features/experience/ExperienceScene'
import {
  // experienceAtom,
  // experienceQueryAtom,
  sceneAssetContentsAtom
  // SceneAssetContentState
} from 'features/experience/atoms'
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
import { HexColorPicker, HexColorInput } from 'react-colorful'
import {
  appAtom,
  appQueryAtom,
  appsAtom,
  appsQueryAtom
} from 'features/application/atoms'
import LoadingScreen from 'common/LoadingScreen'
import { useAppMutation } from 'features/application/hooks'
import { editorAtom } from 'features/editor/atoms'
import useAuth from 'features/auth/useAuth'
import { App, CreateAppRequest } from 'features/application/api'

const MEGABYTE = 1000000

export default function EditorPage() {
  const { user } = useAuth()
  // const [searchParams] = useSearchParams()

  const [, setAppQuery] = useAtom(appQueryAtom)
  const [app] = useAtom(appAtom)

  const [, setAppsQuery] = useAtom(appsQueryAtom)
  const [apps] = useAtom(appsAtom)

  const [editor, setEditor] = useAtom(editorAtom)

  // const [, setExpQuery] = useAtom(experienceQueryAtom)
  // const [experience] = useAtom(experienceAtom)
  const [, setSceneContents] = useAtom(sceneAssetContentsAtom)
  const [appDescription, setAppDescriptionn] = useState('')
  const [appLandingBGImgFile, setAppLandingBGImgFile] = useState<File>()
  const [appLogoFile, setAppLogoFile] = useState<File>()
  const [appLandingImgFile, setAppLandingImgFile] = useState<File>()
  const [appInstructionImgFile, setAppInstructionImgFile] = useState<File>()
  const [editTabIndex, setEditTabIndex] = useState(0)

  const { create, update } = useAppMutation()

  const handleAppCreate = async () => {
    await create.mutateAsync({
      name: 'Untitled',
      text: '',
      button_background_color: '#aabbcc',
      button_text: 'START',
      button_text_color: '#000000'
    })
  }

  const handleAppLoad = (app: App) => () => {
    setAppQuery(app.id)
    // setEditor({ app, experiences: [] })
  }

  const handleSave = async () => {
    if (editor.app) {
      // const { id, created, modified, user_id, ...newUpdate } = editor.app
      console.log({
        appLandingBGImgFile,
        appLogoFile,
        appLandingImgFile,
        appInstructionImgFile
      })
      const newUpdate: Partial<CreateAppRequest> = {
        background_image: appLandingBGImgFile,
        button_background_color: editor.app.button_background_color,
        button_text_color: editor.app.button_text_color,
        image: appLandingImgFile,
        instructions_image: appInstructionImgFile,
        logo_image: appLogoFile,
        button_text: editor.app.button_text,
        name: editor.app.name,
        text: editor.app.text
      }
      await update.mutateAsync(newUpdate)
    }
  }

  const handleEditorAppChange =
    (key: keyof App) => (ev: ChangeEvent<HTMLInputElement> | string) => {
      if (typeof ev === 'object') ev.preventDefault()
      const value = typeof ev === 'object' ? ev.target.value : ev
      setEditor(prev =>
        prev.app
          ? {
              ...prev,
              app: { ...prev.app, [key]: value }
            }
          : prev
      )
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

  // useEffect(() => {
  //   const uuid = searchParams.get('uuid') ?? undefined
  //   const short_code = searchParams.get('short_code') ?? undefined
  //   setExpQuery({ uuid, short_code })
  // }, [searchParams, setExpQuery])

  useEffect(() => {
    setAppsQuery({ user_id: user?.id })
  }, [user, setAppsQuery])

  // useEffect(() => {
  //   if (experience.isSuccess) {
  //     if (experience.data) {
  //       setSceneContents(
  //         experience.data.asset_transform_info?.map<SceneAssetContentState>(
  //           content => ({
  //             instanceID: generateInstanceID(),
  //             position: [0, 0, 0],
  //             quaternion: [0, 0, 0, 1],
  //             rotation: [0, 0, 0],
  //             scale: [1, 1, 1],
  //             src: content.url,
  //             type: content.type
  //           })
  //         ) ?? []
  //       )
  //     } else {
  //       // if (!window.apps_modal.open) {
  //       //   window.apps_modal.showModal()
  //       // }
  //     }
  //   }
  // }, [experience.isSuccess, experience.data, setSceneContents])

  useEffect(() => {
    if (app.isSuccess && app.data) {
      setEditor({ app: app.data, experiences: [] })
    }
  }, [app.isSuccess, app.data, setEditor])

  if (app.isInitialLoading) {
    return <LoadingScreen />
  }

  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center bg-base-300'>
      <dialog id='apps_modal' className='modal'>
        <form method='dialog' className='modal-box'>
          <button className='btn-ghost btn-sm btn-circle btn absolute right-2 top-2'>
            ✕
          </button>
          <h3 className='mb-4 text-xl font-medium text-base-content'>
            Choose an App
          </h3>
          <div className='grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {apps.data && apps.data.length > 0 ? (
              <>
                {apps.data?.map(a => (
                  <div key={a.name} className='card-bordered card'>
                    <button
                      className='btn-ghost btn flex aspect-square h-auto flex-col items-center justify-center text-lg font-bold normal-case'
                      onClick={handleAppLoad(a)}
                    >
                      {a.name}
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <div>No apps to load.</div>
            )}
          </div>
        </form>
      </dialog>

      {app.isSuccess && app.data === null ? (
        <div className='flex max-w-xs flex-col items-stretch justify-center space-y-2'>
          <button
            id='create-app-btn'
            className='btn-primary btn'
            onClick={handleAppCreate}
          >
            Creat a new app
          </button>
          <button
            id='load-app-btn'
            className='btn-primary btn'
            onClick={ev => {
              ev.preventDefault()
              window.apps_modal.showModal()
            }}
          >
            Load an app
          </button>
        </div>
      ) : (
        <div className='flex h-full w-full'>
          <div className='h-full w-96 bg-base-200 p-2'>
            <div className='mb-2'>
              <div className='form-control w-full'>
                <label className='label'>
                  <span className='label-text'>App Name</span>
                </label>
                <input
                  type='text'
                  placeholder='App Name'
                  className='input-bordered input w-full'
                  value={editor.app?.name ?? ''}
                  onChange={handleEditorAppChange('name')}
                />
              </div>
              <div className='form-control w-full'>
                <label className='label'>
                  <span className='label-text'>App Description</span>
                </label>
                <textarea
                  className='textarea-bordered textarea w-full'
                  placeholder='App Description'
                  value={appDescription}
                  onChange={ev => {
                    ev.preventDefault()
                    setAppDescriptionn(ev.target.value)
                  }}
                />
              </div>
            </div>
            <div className='tabs tabs-boxed justify-center'>
              <button
                className={clsx('tab', editTabIndex === 0 && 'tab-active')}
                onClick={() => {
                  setEditTabIndex(0)
                }}
              >
                Landing
              </button>
              <button
                className={clsx('tab', editTabIndex === 1 && 'tab-active')}
                onClick={() => {
                  setEditTabIndex(1)
                }}
              >
                Instructions
              </button>
              <button
                className={clsx('tab', editTabIndex === 2 && 'tab-active')}
                onClick={() => {
                  setEditTabIndex(2)
                }}
              >
                Experiences
              </button>
            </div>
            <div className='divider m-0' />
            {editTabIndex === 0 ? (
              <div id='landing-sidebar' className='space-y-1'>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Background</span>
                  </label>
                  <input
                    type='file'
                    className='file-input-bordered file-input w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(
                          editor.app?.background_image_url ?? ''
                        )
                        handleEditorAppChange('background_image_url')(
                          URL.createObjectURL(file)
                        )
                        setAppLandingBGImgFile(file)
                      }
                    }}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Logo</span>
                  </label>
                  <input
                    type='file'
                    className='file-input-bordered file-input w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(editor.app?.logo_image_url ?? '')
                        handleEditorAppChange('logo_image_url')(
                          URL.createObjectURL(file)
                        )
                        setAppLogoFile(file)
                      }
                    }}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Image</span>
                  </label>
                  <input
                    type='file'
                    className='file-input-bordered file-input w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(editor.app?.image_url ?? '')
                        handleEditorAppChange('image_url')(
                          URL.createObjectURL(file)
                        )
                        setAppLandingImgFile(file)
                      }
                    }}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Text</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Landing Text'
                    className='input-bordered input w-full'
                    value={editor.app?.text ?? ''}
                    onChange={handleEditorAppChange('text')}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Button Label</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Button Label'
                    className='input-bordered input w-full'
                    value={editor.app?.button_text ?? 'Start'}
                    onChange={handleEditorAppChange('button_text')}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Button Label Color</span>
                  </label>
                  <HexColorPicker
                    className='color-picker'
                    style={{ width: '100%', height: 150 }}
                    color={editor.app?.button_text_color ?? ''}
                    onChange={handleEditorAppChange('button_text_color')}
                  />
                  <HexColorInput
                    className='input-bordered input input-sm mt-1 w-full'
                    color={editor.app?.button_text_color ?? ''}
                    onChange={handleEditorAppChange('button_text_color')}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Button Color</span>
                  </label>
                  <HexColorPicker
                    className='color-picker'
                    style={{ width: '100%', height: 150 }}
                    color={editor.app?.button_background_color ?? ''}
                    onChange={handleEditorAppChange('button_background_color')}
                  />
                  <HexColorInput
                    className='input-bordered input input-sm mt-1 w-full'
                    color={editor.app?.button_background_color ?? ''}
                    onChange={handleEditorAppChange('button_background_color')}
                  />
                </div>
              </div>
            ) : null}
            {editTabIndex === 1 ? (
              <div id='instruction-sidebar' className='space-y-1'>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Instruction Image</span>
                  </label>
                  <input
                    type='file'
                    className='file-input-bordered file-input w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(
                          editor.app?.instructions_image_url ?? ''
                        )
                        handleEditorAppChange('instructions_image_url')(
                          URL.createObjectURL(file)
                        )
                        setAppInstructionImgFile(file)
                      }
                    }}
                  />
                </div>
              </div>
            ) : null}
            {editTabIndex === 2 ? (
              <div id='experience-sidebar' className='space-y-1'>
                <div className='form-control w-full'>
                  <button className='btn-primary btn'>Add</button>
                </div>
              </div>
            ) : null}
          </div>
          <div className='relative h-full flex-grow text-base-content'>
            <button
              className='btn-primary btn-sm btn absolute left-2 top-2'
              onClick={handleSave}
            >
              Save
            </button>
            <div
              id='landing-view'
              className={clsx(
                'flex h-full flex-col items-center justify-center',
                editTabIndex === 0 ? 'block' : 'hidden'
              )}
            >
              <div className='mockup-phone'>
                <div className='camera'></div>
                <div className='display'>
                  <div
                    className='phone-2 artboard artboard-demo relative justify-start space-y-4 bg-cover bg-center bg-no-repeat px-4 py-10'
                    style={{
                      backgroundImage: editor.app?.background_image_url
                        ? `url(${editor.app.background_image_url})`
                        : undefined
                    }}
                  >
                    <div className='mx-auto h-1/5 w-11/12 max-w-xs'>
                      {editor.app?.logo_image_url ? (
                        <img
                          className='mx-auto max-h-full max-w-full rounded-lg'
                          src={editor.app.logo_image_url}
                          alt='App Logo'
                        />
                      ) : (
                        <div className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border border-base-content'>
                          Logo
                        </div>
                      )}
                    </div>
                    <div className='mx-auto h-2/5 w-11/12 max-w-xs space-y-2'>
                      {editor.app?.image_url ? (
                        <img
                          className='mx-auto max-h-full max-w-full rounded-lg'
                          src={editor.app.image_url}
                          alt='App Landing Image'
                        />
                      ) : (
                        <div className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border border-base-content'>
                          Landing Image
                        </div>
                      )}
                      {editor.app?.text ? (
                        <div className='text-center'>{editor.app.text}</div>
                      ) : (
                        <div className='mx-auto flex max-w-full flex-col items-center justify-center rounded-lg border border-base-content'>
                          Landing Text
                        </div>
                      )}
                    </div>
                    <div className='absolute bottom-14 mx-auto h-10 w-11/12 max-w-xs'>
                      <div
                        className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg'
                        style={{
                          backgroundColor: editor.app?.button_background_color,
                          color: editor.app?.button_text_color
                        }}
                      >
                        {editor.app?.button_text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              id='instruction-view'
              className={clsx(
                'flex h-full flex-col items-center justify-center',
                editTabIndex === 1 ? 'block' : 'hidden'
              )}
            >
              <div className='mockup-phone'>
                <div className='camera'></div>
                <div className='display'>
                  <div
                    className='phone-2 artboard artboard-demo relative space-y-4 bg-cover bg-center bg-no-repeat px-4 py-10'
                    style={{
                      backgroundImage: editor.app?.background_image_url
                        ? `url(${editor.app.background_image_url})`
                        : undefined
                    }}
                  >
                    <div className='relative flex h-full w-11/12 max-w-xs flex-col items-center justify-center rounded-lg border border-base-content bg-base-100'>
                      <div className='absolute left-1/2 top-2 -translate-x-1/2 p-4 text-center text-lg font-medium'>
                        Instructions
                      </div>
                      <div className='aspect-square h-auto w-11/12 max-w-xs'>
                        {editor.app?.instructions_image_url ? (
                          <img
                            className='mx-auto max-h-full max-w-full rounded-lg'
                            src={editor.app?.instructions_image_url}
                            alt='Instruction Image'
                          />
                        ) : (
                          <div className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border border-base-content'>
                            Instruction Image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              id='experience-view'
              className={clsx(
                'fixed h-full w-full',
                editTabIndex === 2 ? 'block' : 'hidden'
              )}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <FileUploadBackdrop>Drag n' drop file here.</FileUploadBackdrop>
              ) : null}
              <ExperienceScene mode='editor' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const FileUploadBackdrop: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className='absolute z-50 flex h-full w-full flex-col items-center justify-center bg-neutral bg-opacity-50 text-neutral-content'>
      {children}
    </div>
  )
}
