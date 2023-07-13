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
  currEditingAssetIndexAtom,
  currEditingExperienceAtom,
  currEditingExperienceIndexAtom,
  editorAppAtom,
  editorExperiencesAtom
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
  const [currAssetIndex, setCurrAssetIndex] = useAtom(currEditingAssetIndexAtom)
  const [currEditingExperience, setCurrEditingExperience] = useAtom(
    currEditingExperienceAtom
  )
  const [currEditingAsset, setCurrAssetContent] = useAtom(currEditingAssetAtom)

  // UI
  const [sidebarTabIndex, setSidebarTabIndex] = useState(0)
  const [appDescription, setAppDescriptionn] = useState('')
  const [appLandingBGImgFile, setAppLandingBGImgFile] = useState<File>()
  const [appLogoFile, setAppLogoFile] = useState<File>()
  const [appLandingImgFile, setAppLandingImgFile] = useState<File>()
  const [appInstructionImgFile, setAppInstructionImgFile] = useState<File>()

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
    const index = parseInt(ev.target.value)
    setCurrAssetIndex(index)
  }

  const save = async () => {
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
                transform: [
                  ...(prev.transform ?? []),
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
      setCurrAssetIndex(null)
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
            <div className='mb-2'>
              <div className='form-control w-full'>
                <label className='label'>
                  <span className='label-text'>App Name</span>
                </label>
                <input
                  type='text'
                  placeholder='App Name'
                  className='input-bordered input w-full'
                  value={editorApp?.name ?? ''}
                  onChange={handleEditorAppInputChange('name')}
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
                    className='file-input-bordered file-input w-full'
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
                    className='file-input-bordered file-input w-full'
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
                    className='file-input-bordered file-input w-full'
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
                    className='input-bordered input w-full'
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
                    className='input-bordered input w-full'
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
                    className='file-input-bordered file-input w-full'
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
                {editorExperiences && editorExperiences.length > 0 ? (
                  <div className='form-control w-full'>
                    <select
                      className='select-bordered select'
                      value={currExpIndex ?? ''}
                      onChange={handleExpSelect}
                    >
                      <option value='' disabled>
                        Pick an experience
                      </option>
                      {editorExperiences.map((exp, index) => (
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
                    Add
                  </button>
                  <button
                    className='btn-warning btn w-full'
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
                        value={currEditingExperience.name}
                        onChange={handleEditorExpInputChange('name')}
                      />
                    </div>
                    {/* {editorExps[currExpIndex].transform &&
                    editorExps[currExpIndex].transform?.length ? (
                      
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
                          {currEditingExperience.transform?.length
                            ? 'Pick an asset'
                            : 'Add and asset'}
                        </option>
                        {currEditingExperience.transform?.map((tr, index) => (
                          <option key={index} value={index}>
                            {tr.asset_name}
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
                        // disabled={removeExp.isLoading || currExpIndex === null}
                        // onClick={handleExpRemove}
                      >
                        Remove
                      </button>
                    </div>

                    {currEditingAsset !== null &&
                    currEditingExperience.transform?.length ? (
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
                            value={currEditingAsset.asset_name}
                            onChange={ev => {
                              ev.preventDefault()
                              const value = ev.target.value
                              setCurrAssetContent(
                                prev => prev && { ...prev, asset_name: value }
                              )
                              // const exp = currEditingExperience
                              // const transform = exp.transform
                              // if (transform) {
                              //   const asset = transform[currAssetIndex]
                              //   setEditor(prev => ({
                              //     ...prev,
                              //     experiences: [
                              //       ...prev.experiences.slice(0, currExpIndex),
                              //       {
                              //         ...exp,
                              //         transform: [
                              //           ...transform.slice(0, currAssetIndex),
                              //           {
                              //             ...asset,
                              //             asset_name: ev.target.value
                              //           },
                              //           ...transform.slice(currAssetIndex + 1)
                              //         ]
                              //       },
                              //       ...prev.experiences.slice(currExpIndex + 1)
                              //     ]
                              //   }))
                              // }
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
                sidebarTabIndex === 0 ? 'block' : 'hidden'
              )}
            >
              <div className='mockup-phone'>
                <div className='camera'></div>
                <div className='display'>
                  <div
                    className='phone-2 artboard artboard-demo relative justify-start space-y-4 bg-cover bg-center bg-no-repeat px-4 py-10'
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
                    className='phone-2 artboard artboard-demo relative space-y-4 bg-cover bg-center bg-no-repeat px-4 py-10'
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
                'fixed h-full w-full',
                sidebarTabIndex === 2 ? 'block' : 'hidden'
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
