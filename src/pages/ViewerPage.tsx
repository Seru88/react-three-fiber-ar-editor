// import LoadingScreen from 'common/LoadingScreen'
import clsx from 'clsx'
import LoadingScreen from 'common/LoadingScreen'
import { appAtom, appQueryAtom } from 'features/application/atoms'
import { Experience } from 'features/experience/api'
import {
  experiencesAtom,
  experiencesQueryAtom
} from 'features/experience/atoms'
import ExperienceXRScene from 'features/experience/ExperienceXRScene'
import { useAtomValue, useSetAtom } from 'jotai'
import { MouseEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function ViewerPage() {
  const { appID } = useParams()

  // Current app to run.
  const setAppQuery = useSetAtom(appQueryAtom)
  const app = useAtomValue(appAtom)

  // Current app's experiences.
  const setExpsQuery = useSetAtom(experiencesQueryAtom)
  const expsList = useAtomValue(experiencesAtom)

  // Current rendering experience.
  const [currExp, setCurrExp] = useState<Experience | null>(null)
  const [startXR, setStartXR] = useState(false)

  const handleStartXR = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setStartXR(true)
  }

  useEffect(() => {
    if (appID) {
      setAppQuery(parseInt(appID))
    }
  }, [appID, setAppQuery])

  useEffect(() => {
    if (app.isSuccess && app.data) {
      setExpsQuery({ app_id: app.data.id })
    }
  }, [app.isSuccess, app.data, setExpsQuery])

  useEffect(() => {
    if (expsList.isSuccess && expsList.data.length) {
      setCurrExp(expsList.data[0])
    }
  }, [expsList.isSuccess, expsList.data])

  return (
    <main>
      {!startXR ? (
        <div className='absolute left-0 top-0 h-dynamic-screen w-full overflow-hidden'>
          {app.isLoading || expsList.isLoading ? <LoadingScreen /> : null}
          {app.data ? (
            <div
              className={clsx(
                'relative h-full w-full flex-col items-center bg-cover bg-center bg-no-repeat',
                startXR ? 'hidden' : 'flex'
              )}
              style={{
                backgroundImage: `url(${app.data.background_image_url})`
              }}
            >
              <div className='mx-auto h-1/5 w-11/12 max-w-xs'>
                {app.data.logo_image_url ? (
                  <img
                    className='mx-auto max-h-full max-w-full rounded-lg'
                    src={app.data.logo_image_url}
                    alt='App Logo'
                  />
                ) : null}
              </div>
              <div className='mx-auto h-2/5 w-11/12 max-w-xs space-y-2'>
                {app.data.image_url ? (
                  <img
                    className='mx-auto max-h-full max-w-full rounded-lg'
                    src={app.data.image_url}
                    alt='App Landing Image'
                  />
                ) : null}
                {app.data.text ? (
                  <div className='text-center'>{app.data.text}</div>
                ) : null}
              </div>
              <div className='absolute bottom-14 mx-auto h-10 w-11/12 max-w-xs'>
                <button
                  className='mx-auto flex h-full w-full flex-col items-center justify-center rounded-lg'
                  onClick={handleStartXR}
                  style={{
                    backgroundColor: app.data.button_background_color,
                    color: app.data.button_text_color
                  }}
                >
                  {app.data.button_text}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {currExp && startXR ? <ExperienceXRScene experience={currExp} /> : null}
    </main>
  )
}
