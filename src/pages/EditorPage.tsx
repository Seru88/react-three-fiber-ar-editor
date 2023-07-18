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
import {
  currEditingAssetAtom,
  currEditingAssetInstanceIDAtom,
  currEditingExperienceAtom,
  currEditingExperienceIndexAtom,
  editorAppAtom,
  editorExperiencesAtom,
  editorGizmoAtom
} from 'features/editor/atoms'
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
import { MathUtils } from 'three'

const MEGABYTE = 1000000

export default function EditorPage() {
  const { user } = useAuth()
  const {
    create: createApp,
    update: updateApp,
    remove: removeApp
  } = useAppMutation()
  const {
    create: createExp,
    update: updateExp,
    remove: removeExp
  } = useExperienceMutation()

  // List of Apps
  const [, setAppsQuery] = useAtom(appsQueryAtom)
  const [appsList] = useAtom(appsAtom)

  // Current App
  // * Might want to just use appsList only.
  const [, setAppQuery] = useAtom(appQueryAtom)
  const [app] = useAtom(appAtom)

  // List of Experiences for Current App
  const [, setExpsQuery] = useAtom(experiencesQueryAtom)
  const [expsList] = useAtom(experiencesAtom)

  // Editor State
  const [editorApp, setEditorApp] = useAtom(editorAppAtom)
  const [editorExperiences, setEditorExperiences] = useAtom(
    editorExperiencesAtom
  )
  const [currExpIndex, setCurrExpIndex] = useAtom(
    currEditingExperienceIndexAtom
  )
  const [currAssetIndex, setCurrAssetIndex] = useAtom(
    currEditingAssetInstanceIDAtom
  )
  const [currEditingExperience, setCurrEditingExperience] = useAtom(
    currEditingExperienceAtom
  )
  const [currEditingAsset, setCurrAssetContent] = useAtom(currEditingAssetAtom)
  const [editorGizmo, setEditorGizmo] = useAtom(editorGizmoAtom)

  // UI
  const [sidebarTabIndex, setSidebarTabIndex] = useState(0)
  const [appDescription, setAppDescriptionn] = useState('')
  const [appLandingBGImgFile, setAppLandingBGImgFile] = useState<File>()
  const [appLogoFile, setAppLogoFile] = useState<File>()
  const [appLandingImgFile, setAppLandingImgFile] = useState<File>()
  const [appInstructionImgFile, setAppInstructionImgFile] = useState<File>()

  const handleAppLoad = (app: App) => () => {
    setAppQuery(app.id)
    setExpsQuery({ app_id: app.id })
  }

  const handleAppCreate = async () => {
    await createApp.mutateAsync({
      name: 'Untitled',
      text: '',
      button_background_color: '#aabbcc',
      button_text: 'START',
      button_text_color: '#000000'
    })
  }

  const handleAppRemove = () => {
    if (editorApp === null) return
    toast.promise(removeApp.mutateAsync(editorApp.id), {
      loading: 'Deleting...',
      success: () => {
        setEditorApp(null)
        return 'Deleted!'
      },
      error: err => (err as Error).message
    })
  }

  const handleEditorAppInputChange =
    (key: keyof App) => (ev: ChangeEvent<HTMLInputElement> | string) => {
      if (typeof ev === 'object') ev.preventDefault()
      const value = typeof ev === 'object' ? ev.target.value : ev
      setEditorApp(prev => prev && { ...prev, [key]: value })
    }

  const handleExpSelect = (ev: ChangeEvent<HTMLSelectElement>) => {
    ev.preventDefault()
    const index = parseInt(ev.target.value)
    setCurrExpIndex(index)
  }

  const handleExpCreate = () => {
    if (!app.data) return
    toast.promise(
      createExp.mutateAsync({ name: 'Untitled', app_id: app.data.id }),
      {
        loading: 'Adding...',
        success: () => {
          // TODO: Come up way to give focus to newly added experience.
          return 'Added!'
        },
        error: err => (err as Error).message
      }
    )
  }

  const handleExpRemove = () => {
    if (currEditingExperience === null) return
    toast.promise(removeExp.mutateAsync(currEditingExperience.id), {
      loading: 'Removing...',
      success: () => {
        setCurrEditingExperience(null)
        return 'Removed!'
      },
      error: err => (err as Error).message
    })
  }

  const handleEditorExpInputChange =
    (key: keyof Experience) => (ev: ChangeEvent<HTMLInputElement> | string) => {
      if (typeof ev === 'object') ev.preventDefault()
      const value = typeof ev === 'object' ? ev.target.value : ev
      setCurrEditingExperience(prev => prev && { ...prev, [key]: value })
    }

  const handleAssetSelect = (ev: ChangeEvent<HTMLSelectElement>) => {
    ev.preventDefault()
    const value = ev.target.value
    setCurrAssetIndex(value)
  }

  const saveApp = async () => {
    if (editorApp) {
      const appUpdate: Partial<CreateAppRequest> = {
        background_image: appLandingBGImgFile,
        button_background_color: editorApp.button_background_color,
        button_text_color: editorApp.button_text_color,
        image: appLandingImgFile,
        instructions_image: appInstructionImgFile,
        logo_image: appLogoFile,
        button_text: editorApp.button_text,
        name: editorApp.name,
        text: editorApp.text
      }
      await updateApp.mutateAsync(appUpdate)
    }
  }

  // * Consider finding way to only save currently editing experience.
  const saveExperiences = async () => {
    if (editorApp === null) return
    const tasks = editorExperiences.map(eExp => {
      return updateExp.mutateAsync({
        id: eExp.id,
        request: {
          name: eExp.name,
          // marker_image: undefined,
          app_id: editorApp.id,
          asset_uuids: eExp.asset_uuids,
          transform: eExp.transform ?? []
        }
      })
    })
    await Promise.all(tasks)
  }

  const save = async () => {
    await saveApp()
    await saveExperiences()
  }

  const handleSave = () => {
    if (editorApp === null) return
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
          setCurrEditingExperience(
            prev =>
              prev && {
                ...prev,
                asset_uuids: [...prev.asset_uuids, asset.uuid],
                transform: [
                  ...(prev.transform ?? []),
                  {
                    name: asset.name,
                    asset_url: asset.url,
                    asset_uuid: asset.uuid,
                    content_type: asset.content_type,
                    instance_id: generateInstanceID(),
                    position: [0, 0, 0],
                    quaternion: [0, 0, 0, 1],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                  }
                ]
              }
          )
          return 'Added!'
        },
        error: err => (err as Error).message
      })
    },
    [currExpIndex, setCurrEditingExperience]
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
    if (app.isSuccess && app.data) {
      setExpsQuery({ app_id: app.data.id })
      setEditorApp(app.data)
    }
  }, [app.isSuccess, app.data, setExpsQuery, setEditorApp])

  useEffect(() => {
    if (expsList.isSuccess && expsList.data) {
      setEditorExperiences(
        expsList.data.map(e => ({
          ...e,
          transform:
            e.transform && e.transform.length
              ? e.transform.map(t => ({
                  ...t,
                  instance_id: t.instance_id ?? generateInstanceID()
                }))
              : []
        }))
      )
    }
  }, [expsList.isSuccess, expsList.data, setEditorExperiences])

  useEffect(() => {
    if (currExpIndex !== null) {
      setCurrAssetIndex('')
    }
  }, [currExpIndex, setCurrAssetIndex])

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
          {appsList.isLoading ? (
            <div className='flex w-full items-center justify-center p-2'>
              <span className='loading loading-infinity loading-lg' />
            </div>
          ) : (
            <>
              {appsList.data && appsList.data.length > 0 ? (
                <div className='grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {appsList.data?.map(a => (
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
          <div className='h-full max-h-full w-96 overflow-y-auto overflow-x-hidden bg-base-200 px-5 py-2'>
            <div className='mb-2 space-y-1'>
              <div className='form-control w-full'>
                <label className='label'>
                  <span className='label-text'>App Name</span>
                </label>
                <input
                  type='text'
                  placeholder='App Name'
                  className='input-bordered input input-sm w-full'
                  value={editorApp?.name ?? ''}
                  onChange={handleEditorAppInputChange('name')}
                />
              </div>
              <div className='form-control w-full'>
                <label className='label'>
                  <span className='label-text'>App Description</span>
                </label>
                <textarea
                  className='textarea-bordered textarea textarea-sm w-full'
                  placeholder='App Description'
                  value={appDescription}
                  onChange={ev => {
                    ev.preventDefault()
                    setAppDescriptionn(ev.target.value)
                  }}
                />
              </div>
              <div className='grid w-full grid-cols-2 gap-1'>
                <button
                  className='btn-primary btn-sm btn w-full'
                  disabled={updateApp.isLoading || updateExp.isLoading}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className='btn-warning btn-sm btn w-full'
                  disabled={removeApp.isLoading || editorApp === null}
                  onClick={handleAppRemove}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className='tabs tabs-boxed justify-center'>
              <button
                className={clsx('tab', sidebarTabIndex === 0 && 'tab-active')}
                onClick={() => {
                  setSidebarTabIndex(0)
                }}
              >
                Landing
              </button>
              <button
                className={clsx('tab', sidebarTabIndex === 1 && 'tab-active')}
                onClick={() => {
                  setSidebarTabIndex(1)
                }}
              >
                Instructions
              </button>
              <button
                className={clsx('tab', sidebarTabIndex === 2 && 'tab-active')}
                onClick={() => {
                  setSidebarTabIndex(2)
                }}
              >
                Experiences
              </button>
            </div>
            <div className='divider m-0' />
            {sidebarTabIndex === 0 ? (
              <div id='landing-sidebar' className='space-y-1'>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Background</span>
                  </label>
                  <input
                    type='file'
                    className='file-input-bordered file-input file-input-sm w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(
                          editorApp?.background_image_url ?? ''
                        )
                        handleEditorAppInputChange('background_image_url')(
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
                    className='file-input-bordered file-input file-input-sm w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(editorApp?.logo_image_url ?? '')
                        handleEditorAppInputChange('logo_image_url')(
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
                    className='file-input-bordered file-input file-input-sm w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(editorApp?.image_url ?? '')
                        handleEditorAppInputChange('image_url')(
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
                    className='input-bordered input input-sm w-full'
                    value={editorApp?.text ?? ''}
                    onChange={handleEditorAppInputChange('text')}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Button Label</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Button Label'
                    className='input-bordered input btn-sm w-full'
                    value={editorApp?.button_text ?? 'Start'}
                    onChange={handleEditorAppInputChange('button_text')}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Button Label Color</span>
                  </label>
                  <HexColorPicker
                    className='color-picker'
                    style={{ width: '100%', height: 150 }}
                    color={editorApp?.button_text_color ?? ''}
                    onChange={handleEditorAppInputChange('button_text_color')}
                  />
                  <HexColorInput
                    className='input-bordered input input-sm mt-1 w-full'
                    color={editorApp?.button_text_color ?? ''}
                    onChange={handleEditorAppInputChange('button_text_color')}
                  />
                </div>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Button Color</span>
                  </label>
                  <HexColorPicker
                    className='color-picker'
                    style={{ width: '100%', height: 150 }}
                    color={editorApp?.button_background_color ?? ''}
                    onChange={handleEditorAppInputChange(
                      'button_background_color'
                    )}
                  />
                  <HexColorInput
                    className='input-bordered input input-sm mt-1 w-full'
                    color={editorApp?.button_background_color ?? ''}
                    onChange={handleEditorAppInputChange(
                      'button_background_color'
                    )}
                  />
                </div>
              </div>
            ) : null}
            {sidebarTabIndex === 1 ? (
              <div id='instruction-sidebar' className='space-y-1'>
                <div className='form-control w-full'>
                  <label className='label'>
                    <span className='label-text'>Instruction Image</span>
                  </label>
                  <input
                    type='file'
                    className='file-input-bordered file-input file-input-sm w-full'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={ev => {
                      ev.preventDefault()
                      const file = ev.target.files?.item(0)
                      if (file) {
                        URL.revokeObjectURL(
                          editorApp?.instructions_image_url ?? ''
                        )
                        handleEditorAppInputChange('instructions_image_url')(
                          URL.createObjectURL(file)
                        )
                        setAppInstructionImgFile(file)
                      }
                    }}
                  />
                </div>
              </div>
            ) : null}
            {sidebarTabIndex === 2 ? (
              <div id='experience-sidebar' className='space-y-1'>
                <div className='form-control w-full'>
                  <select
                    className='select-bordered select select-sm'
                    value={currExpIndex ?? ''}
                    onChange={handleExpSelect}
                  >
                    <option value='' disabled>
                      {editorExperiences.length === 0
                        ? 'Add an experience'
                        : 'Pick an experience'}
                    </option>
                    {editorExperiences.map((exp, index) => (
                      <option key={index} value={index}>
                        {exp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='grid w-full grid-cols-2 gap-1'>
                  <button
                    className='btn-primary btn-sm btn w-full'
                    disabled={createExp.isLoading}
                    onClick={handleExpCreate}
                  >
                    Add
                  </button>
                  <button
                    className='btn-warning btn-sm btn w-full'
                    disabled={
                      removeExp.isLoading || currEditingExperience === null
                    }
                    onClick={handleExpRemove}
                  >
                    Remove
                  </button>
                </div>
                {editorExperiences.length > 0 &&
                currEditingExperience !== null ? (
                  <div
                    className='card space-y-1 border-2 px-3 pb-3'
                    style={{
                      // borderRadius: 'var(--rounded-btn, 0.5rem)',
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
                        className='input-bordered input input-sm w-full'
                        value={currEditingExperience.name}
                        onChange={handleEditorExpInputChange('name')}
                      />
                    </div>
                    <div className='form-control w-full'>
                      <label className='label'>
                        <span className='label-text'>Assets</span>
                      </label>
                      <select
                        className='select-bordered select select-sm'
                        value={currAssetIndex}
                        onChange={handleAssetSelect}
                      >
                        <option value='' disabled>
                          {currEditingExperience.transform?.length
                            ? 'Pick an asset'
                            : 'Add and asset'}
                        </option>
                        {currEditingExperience.transform?.map(tr => (
                          <option key={tr.instance_id} value={tr.instance_id}>
                            {tr.name}
                          </option>
                        ))}
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
                        disabled={currEditingAsset === null}
                        // onClick={handleExpRemove}
                      >
                        Remove
                      </button>
                    </div>

                    {currEditingAsset !== null &&
                    currEditingExperience.transform?.length ? (
                      <div
                        className='card space-y-1 border-2 px-3 pb-3'
                        style={{
                          // borderRadius: 'var(--rounded-btn, 0.5rem)',
                          borderColor: 'hsl(var(--bc) / 0.1)'
                        }}
                      >
                        <div className='form-control w-full'>
                          <label className='label'>
                            <span className='label-text'>Asset Name</span>
                          </label>
                          <input
                            type='text'
                            className='input-bordered input input-sm w-full'
                            value={currEditingAsset.name}
                            onChange={ev => {
                              ev.preventDefault()
                              const value = ev.target.value
                              setCurrAssetContent(
                                prev => prev && { ...prev, name: value }
                              )
                            }}
                          />
                        </div>
                        <div className='form-control w-full'>
                          <label className='label'>
                            <span className='label-text'>Position</span>
                          </label>
                          <div className='join w-full space-x-1'>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                x
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.position[0]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          position: [
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            ),
                                            prev.position[1],
                                            prev.position[2]
                                          ]
                                        }
                                    )
                                  }}
                                  style={{
                                    borderTopLeftRadius:
                                      'var(--rounded-btn, 0.5rem)',
                                    borderBottomLeftRadius:
                                      'var(--rounded-btn, 0.5rem)'
                                  }}
                                />
                              </div>
                            </div>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                y
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.position[1]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          position: [
                                            prev.position[0],
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            ),
                                            prev.position[2]
                                          ]
                                        }
                                    )
                                  }}
                                />
                              </div>
                            </div>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                z
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.position[2]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          position: [
                                            prev.position[0],
                                            prev.position[1],
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            )
                                          ]
                                        }
                                    )
                                  }}
                                  style={{
                                    borderTopRightRadius:
                                      'var(--rounded-btn, 0.5rem)',
                                    borderBottomRightRadius:
                                      'var(--rounded-btn, 0.5rem)'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='form-control w-full'>
                          <label className='label'>
                            <span className='label-text'>Rotation</span>
                          </label>
                          <div className='join w-full space-x-1'>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                x
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.rotation[0]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          rotation: [
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            ),
                                            prev.rotation[1],
                                            prev.rotation[2]
                                          ]
                                        }
                                    )
                                  }}
                                  style={{
                                    borderTopLeftRadius:
                                      'var(--rounded-btn, 0.5rem)',
                                    borderBottomLeftRadius:
                                      'var(--rounded-btn, 0.5rem)'
                                  }}
                                />
                              </div>
                            </div>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                y
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.rotation[1]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          rotation: [
                                            prev.rotation[0],
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            ),
                                            prev.rotation[2]
                                          ]
                                        }
                                    )
                                  }}
                                />
                              </div>
                            </div>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                z
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.rotation[2]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          rotation: [
                                            prev.rotation[0],
                                            prev.rotation[1],
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            )
                                          ]
                                        }
                                    )
                                  }}
                                  style={{
                                    borderTopRightRadius:
                                      'var(--rounded-btn, 0.5rem)',
                                    borderBottomRightRadius:
                                      'var(--rounded-btn, 0.5rem)'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='form-control w-full'>
                          <label className='label'>
                            <span className='label-text'>Scale</span>
                          </label>
                          <div className='join w-full space-x-1'>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                x
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.scale[0]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          scale: [
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            ),
                                            prev.scale[1],
                                            prev.scale[2]
                                          ]
                                        }
                                    )
                                  }}
                                  style={{
                                    borderTopLeftRadius:
                                      'var(--rounded-btn, 0.5rem)',
                                    borderBottomLeftRadius:
                                      'var(--rounded-btn, 0.5rem)'
                                  }}
                                />
                              </div>
                            </div>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                y
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.scale[1]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          scale: [
                                            prev.scale[0],
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            ),
                                            prev.scale[2]
                                          ]
                                        }
                                    )
                                  }}
                                />
                              </div>
                            </div>
                            <div className='indicator w-1/3'>
                              <span className='indicator-center indicator-bottom badge indicator-item h-auto px-2 text-xs uppercase'>
                                z
                              </span>
                              <div>
                                <input
                                  className='input-bordered input input-sm join-item w-full'
                                  type='number'
                                  value={MathUtils.radToDeg(
                                    currEditingAsset.scale[2]
                                  )}
                                  onChange={ev => {
                                    setCurrAssetContent(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          scale: [
                                            prev.scale[0],
                                            prev.scale[1],
                                            MathUtils.degToRad(
                                              parseFloat(ev.target.value)
                                            )
                                          ]
                                        }
                                    )
                                  }}
                                  style={{
                                    borderTopRightRadius:
                                      'var(--rounded-btn, 0.5rem)',
                                    borderBottomRightRadius:
                                      'var(--rounded-btn, 0.5rem)'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div
            id='editor-content'
            className='relative h-full text-base-content'
          >
            {sidebarTabIndex === 2 ? (
              <div className='join absolute left-2 top-2 z-40'>
                <button
                  className={clsx(
                    'btn-sm join-item btn',
                    editorGizmo === 'translate' && 'btn-primary'
                  )}
                  onClick={() => {
                    setEditorGizmo('translate')
                  }}
                >
                  Move
                </button>
                <button
                  className={clsx(
                    'btn-sm join-item btn',
                    editorGizmo === 'rotate' && 'btn-primary'
                  )}
                  onClick={() => {
                    setEditorGizmo('rotate')
                  }}
                >
                  Rotate
                </button>
                <button
                  className={clsx(
                    'btn-sm join-item btn',
                    editorGizmo === 'scale' && 'btn-primary'
                  )}
                  onClick={() => {
                    setEditorGizmo('scale')
                  }}
                >
                  Scale
                </button>
              </div>
            ) : null}
            <div
              id='landing-view'
              className={clsx(
                'flex h-full flex-col items-center justify-center',
                sidebarTabIndex === 0 ? 'block' : 'hidden'
              )}
            >
              <div className='mockup-phone'>
                <div className='camera'></div>
                <div className='display'>
                  <div
                    className='phone-4 artboard artboard-demo relative justify-start space-y-4 bg-cover bg-center bg-no-repeat px-4 py-10'
                    style={{
                      backgroundImage: editorApp?.background_image_url
                        ? `url(${editorApp.background_image_url})`
                        : undefined
                    }}
                  >
                    <div className='mx-auto h-1/5 w-11/12 max-w-xs'>
                      {editorApp?.logo_image_url ? (
                        <img
                          className='mx-auto max-h-full max-w-full rounded-lg'
                          src={editorApp.logo_image_url}
                          alt='App Logo'
                        />
                      ) : (
                        <div className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border border-base-content'>
                          Logo
                        </div>
                      )}
                    </div>
                    <div className='mx-auto h-2/5 w-11/12 max-w-xs space-y-2'>
                      {editorApp?.image_url ? (
                        <img
                          className='mx-auto max-h-full max-w-full rounded-lg'
                          src={editorApp.image_url}
                          alt='App Landing Image'
                        />
                      ) : (
                        <div className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg border border-base-content'>
                          Landing Image
                        </div>
                      )}
                      {editorApp?.text ? (
                        <div className='text-center'>{editorApp.text}</div>
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
                          backgroundColor: editorApp?.button_background_color,
                          color: editorApp?.button_text_color
                        }}
                      >
                        {editorApp?.button_text}
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
                sidebarTabIndex === 1 ? 'block' : 'hidden'
              )}
            >
              <div className='mockup-phone'>
                <div className='camera'></div>
                <div className='display'>
                  <div
                    className='phone-4 artboard artboard-demo relative space-y-4 bg-cover bg-center bg-no-repeat px-4 py-10'
                    style={{
                      backgroundImage: editorApp?.background_image_url
                        ? `url(${editorApp.background_image_url})`
                        : undefined
                    }}
                  >
                    <div className='relative flex h-full w-11/12 max-w-xs flex-col items-center justify-center rounded-lg border border-base-content bg-base-100'>
                      <div className='absolute left-1/2 top-2 -translate-x-1/2 p-4 text-center text-lg font-medium'>
                        Instructions
                      </div>
                      <div className='aspect-square h-auto w-11/12 max-w-xs'>
                        {editorApp?.instructions_image_url ? (
                          <img
                            className='mx-auto max-h-full max-w-full rounded-lg'
                            src={editorApp?.instructions_image_url}
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
                'h-full w-full',
                sidebarTabIndex === 2 ? 'block' : 'hidden'
              )}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <FileUploadBackdrop>Drag n' drop file here.</FileUploadBackdrop>
              ) : null}
              <ExperienceScene
                mode='editor'
                experience={currEditingExperience}
              />
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
