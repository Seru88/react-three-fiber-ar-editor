import clsx from 'clsx'
import LoadingScreen from 'common/LoadingScreen'
import { App, CreateAppRequest } from 'features/application/api'
import {
  appAtom,
  appQueryAtom,
  appsAtom,
  appsQueryAtom
} from 'features/application/atoms'
import { useAppMutation } from 'features/application/hooks'
import { createPresignedAsset } from 'features/asset/api'
import useAuth from 'features/auth/useAuth'
import { editorAtom } from 'features/editor/atoms'
import { Experience } from 'features/experience/api'
import {
  experiencesAtom,
  experiencesQueryAtom
} from 'features/experience/atoms'
import ExperienceScene from 'features/experience/ExperienceScene'
import { useExperienceMutation } from 'features/experience/hooks'
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
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { FileRejection, useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const MEGABYTE = 1000000

export default function EditorPage() {
  const { user } = useAuth()
  const { create: createApp, update: updateApp } = useAppMutation()
  const {
    create: createExp,
    update: updateExp,
    remove: removeExp
  } = useExperienceMutation()

  // List of Apps
  const [, setAppsQuery] = useAtom(appsQueryAtom)
  const [apps] = useAtom(appsAtom)

  // Current App
  const [, setAppQuery] = useAtom(appQueryAtom)
  const [currApp] = useAtom(appAtom)

  // List of Experiences for Current App
  const [, setExpsQuery] = useAtom(experiencesQueryAtom)
  const [exps] = useAtom(experiencesAtom)

  // Current Experience of Current App
  // const [, setExpQuery] = useAtom(experienceQueryAtom)
  // const [currExp] = useAtom(experienceAtom)

  // Editor State
  const [editor, setEditor] = useAtom(editorAtom)

  // UI
  const [editTabIndex, setEditTabIndex] = useState(0)
  const [appDescription, setAppDescriptionn] = useState('')
  const [appLandingBGImgFile, setAppLandingBGImgFile] = useState<File>()
  const [appLogoFile, setAppLogoFile] = useState<File>()
  const [appLandingImgFile, setAppLandingImgFile] = useState<File>()
  const [appInstructionImgFile, setAppInstructionImgFile] = useState<File>()
  const [currExpIndex, setCurrExpIndex] = useState<number | null>(null)
  const [currAssetIndex, setCurrAssetIndex] = useState<number | null>(null)

  // const [, setSceneContents] = useAtom(sceneAssetContentsAtom)

  const handleAppCreate = async () => {
    await createApp.mutateAsync({
      name: 'Untitled',
      text: '',
      button_background_color: '#aabbcc',
      button_text: 'START',
      button_text_color: '#000000'
    })
  }

  const handleAppLoad = (app: App) => () => {
    setAppQuery(app.id)
    setExpsQuery({ app_id: app.id })
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

  const handleExpSelect = (ev: ChangeEvent<HTMLSelectElement>) => {
    ev.preventDefault()
    const index = parseInt(ev.target.value)
    setCurrExpIndex(index)
  }

  const handleExpCreate = () => {
    if (!currApp.data) return
    toast.promise(
      createExp.mutateAsync({ name: 'Untitled', app_id: currApp.data.id }),
      {
        loading: 'Adding...',
        success: () => {
          console.log(exps.data?.length)
          return 'Added!'
        },
        error: err => (err as Error).message
      }
    )
  }

  const handleExpRemove = () => {
    if (currExpIndex === null) return
    const exp = editor.experiences[currExpIndex]
    toast.promise(removeExp.mutateAsync(exp.id), {
      loading: 'Removing...',
      success: () => {
        setCurrExpIndex(null)
        setEditor(prev => ({
          ...prev,
          experiences: [
            ...prev.experiences.slice(0, currExpIndex),
            ...prev.experiences.slice(currExpIndex + 1)
          ]
        }))
        return 'Removed!'
      },
      error: err => (err as Error).message
    })
  }

  const handleEditorExpChange =
    (index: number, key: keyof Experience) =>
    (ev: ChangeEvent<HTMLInputElement> | string) => {
      if (typeof ev === 'object') ev.preventDefault()
      const value = typeof ev === 'object' ? ev.target.value : ev
      setEditor(prev => {
        const update = { ...prev.experiences[index], [key]: value }
        return {
          ...prev,
          experiences: [
            ...prev.experiences.slice(0, index),
            update,
            ...prev.experiences.slice(index + 1)
          ]
        }
      })
    }

  const handleAssetSelect = (ev: ChangeEvent<HTMLSelectElement>) => {
    ev.preventDefault()
    const index = parseInt(ev.target.value)
    setCurrAssetIndex(index)
  }

  const save = async () => {
    if (editor.app) {
      const appUpdate: Partial<CreateAppRequest> = {
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
      await updateApp.mutateAsync(appUpdate)
    }
    const tasks = editor.experiences.map(exp => {
      console.log(exp)
      return updateExp.mutateAsync({
        id: exp.id,
        request: {
          name: exp.name,
          // marker_image: undefined,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          app_id: editor.app!.id,
          asset_uuids: exp.asset_uuids,
          transform: exp.transform ?? []
        }
      })
    })
    await Promise.all(tasks)
  }

  const handleSave = () => {
    if (editor.app === null) return
    toast.promise(save(), {
      loading: 'Saving...',
      success: 'Saved!',
      error: err => (err as Error).message
    })
  }

  const handleFileAccepted = useCallback(
    (files: File[]) => {
      if (currExpIndex === null) {
        toast.error('Pick an experience first!')
        return
      }
      const file = files[0]
      toast.promise(createPresignedAsset(file), {
        loading: `Adding ${file.name}`,
        success: asset => {
          setEditor(prev => {
            if (currExpIndex === null) return prev
            const currExp = prev.experiences[currExpIndex]
            return {
              ...prev,
              experiences: [
                ...prev.experiences.slice(0, currExpIndex),
                {
                  ...currExp,
                  asset_uuids: [...currExp.asset_uuids, asset.uuid],
                  transform: [
                    ...(currExp.transform ?? []),
                    {
                      asset_name: asset.name,
                      asset_uuid: asset.uuid,
                      instance_id: generateInstanceID(),
                      position: [0, 0, 0],
                      quaternion: [0, 0, 0, 1],
                      rotation: [0, 0, 0],
                      scale: [1, 1, 1]
                    }
                  ]
                }
              ]
            }
          })
          return 'Added!'
        },
        error: err => (err as Error).message
      })
    },
    [currExpIndex, setEditor]
  )

  const handleFileRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0]
    toast.error(rejection.errors[0].message)
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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
    setAppsQuery({ user_id: user?.id })
  }, [user, setAppsQuery])

  useEffect(() => {
    if (currApp.isSuccess && currApp.data) {
      setExpsQuery({ app_id: currApp.data.id })
      setEditor(prev => ({ ...prev, app: currApp.data }))
    }
  }, [currApp.isSuccess, currApp.data, setExpsQuery, setEditor])

  useEffect(() => {
    if (exps.isSuccess && exps.data) {
      setEditor(prev => ({
        ...prev,
        experiences: exps.data.map(e => ({
          ...e,
          transform:
            e.transform && e.transform.length
              ? e.transform.map(t => ({
                  ...t,
                  instance_id: t.instance_id ?? generateInstanceID()
                }))
              : []
        }))
      }))
    }
  }, [exps.isSuccess, exps.data, /* setExpQuery, */ setEditor])

  useEffect(() => {
    if (currExpIndex !== null) {
      setCurrAssetIndex(null)
    }
  }, [currExpIndex])

  if (currApp.isInitialLoading) {
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
          {apps.isLoading ? (
            <div className='flex w-full items-center justify-center p-2'>
              <span className='loading loading-infinity loading-lg' />
            </div>
          ) : (
            <>
              {apps.data && apps.data.length > 0 ? (
                <div className='grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {apps.data?.map(a => (
                    <div key={a.id} className='card-bordered card'>
                      <button
                        className='btn-ghost btn flex aspect-square h-auto flex-col items-center justify-center text-lg font-bold normal-case'
                        onClick={handleAppLoad(a)}
                      >
                        {a.name}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='w-full text-center'>No apps to load.</div>
              )}
            </>
          )}
          <div className='grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'></div>
        </form>
      </dialog>

      {currApp.isSuccess && currApp.data === null ? (
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
          <div className='h-full max-h-full w-96 overflow-y-auto overflow-x-hidden bg-base-200 px-5 py-2'>
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
                {editor.experiences && editor.experiences.length > 0 ? (
                  <div className='form-control w-full'>
                    <select
                      className='select-bordered select'
                      value={currExpIndex ?? ''}
                      onChange={handleExpSelect}
                    >
                      <option value='' disabled>
                        Pick an experience
                      </option>
                      {editor.experiences.map((exp, index) => (
                        <option key={index} value={index}>
                          {exp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className='grid w-full grid-cols-2 gap-1'>
                  <button
                    className='btn-primary btn w-full'
                    disabled={createExp.isLoading}
                    onClick={handleExpCreate}
                  >
                    New
                  </button>
                  <button
                    className='btn-warning btn w-full'
                    disabled={removeExp.isLoading || currExpIndex === null}
                    onClick={handleExpRemove}
                  >
                    Remove
                  </button>
                </div>
                {editor.experiences.length > 0 && currExpIndex !== null ? (
                  <div
                    className='space-y-1 border-2 px-3 pb-3'
                    style={{
                      borderRadius: 'var(--rounded-btn, 0.5rem)',
                      borderColor: 'hsl(var(--bc) / 0.1)'
                    }}
                  >
                    <div className='form-control w-full'>
                      <label className='label'>
                        <span className='label-text'>Experience Name</span>
                      </label>
                      <input
                        type='text'
                        placeholder='Experience Name'
                        className='input-bordered input w-full'
                        value={editor.experiences[currExpIndex].name}
                        onChange={handleEditorExpChange(currExpIndex, 'name')}
                      />
                    </div>
                    {/* {editor.experiences[currExpIndex].transform &&
                    editor.experiences[currExpIndex].transform?.length ? (
                      
                    ) : null} */}

                    <div className='form-control w-full'>
                      <label className='label'>
                        <span className='label-text'>Assets</span>
                      </label>
                      <select
                        className='select-bordered select'
                        value={currAssetIndex ?? ''}
                        onChange={handleAssetSelect}
                      >
                        <option value='' disabled>
                          {editor.experiences[currExpIndex].transform?.length
                            ? 'Pick an asset'
                            : 'Add and asset'}
                        </option>
                        {editor.experiences[currExpIndex].transform?.map(
                          (tr, index) => (
                            <option key={index} value={index}>
                              {tr.asset_name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className='grid w-full grid-cols-2 gap-1'>
                      <button
                        className='btn-primary btn-sm btn w-full'
                        // disabled={createExp.isLoading}
                        onClick={open}
                      >
                        Add
                      </button>
                      <button
                        className='btn-warning btn-sm btn w-full'
                        // disabled={removeExp.isLoading || currExpIndex === null}
                        // onClick={handleExpRemove}
                      >
                        Remove
                      </button>
                    </div>

                    {currExpIndex !== null &&
                    currAssetIndex !== null &&
                    editor.experiences[currExpIndex].transform?.length ? (
                      <div
                        className='border-2 px-3 pb-3'
                        style={{
                          borderRadius: 'var(--rounded-btn, 0.5rem)',
                          borderColor: 'hsl(var(--bc) / 0.1)'
                        }}
                      >
                        <div className='form-control w-full'>
                          <label className='label'>
                            <span className='label-text'>Asset Name</span>
                          </label>
                          <input
                            type='text'
                            // placeholder='Button Label'
                            className='input-bordered input w-full'
                            value={
                              editor.experiences[currExpIndex].transform![
                                currAssetIndex
                              ].asset_name
                            }
                            onChange={ev => {
                              ev.preventDefault()
                              if (
                                currExpIndex === null ||
                                currAssetIndex === null
                              ) {
                                return
                              }
                              const exp = editor.experiences[currExpIndex]
                              const transform = exp.transform
                              if (transform) {
                                const asset = transform[currAssetIndex]
                                setEditor(prev => ({
                                  ...prev,
                                  experiences: [
                                    ...prev.experiences.slice(0, currExpIndex),
                                    {
                                      ...exp,
                                      transform: [
                                        ...transform.slice(0, currAssetIndex),
                                        {
                                          ...asset,
                                          asset_name: ev.target.value
                                        },
                                        ...transform.slice(currAssetIndex + 1)
                                      ]
                                    },
                                    ...prev.experiences.slice(currExpIndex + 1)
                                  ]
                                }))
                              }
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className='relative h-full flex-grow text-base-content'>
            <button
              className='btn-primary btn-sm btn absolute left-2 top-2 z-40'
              disabled={updateApp.isLoading || updateExp.isLoading}
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
