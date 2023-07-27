import LoadingScreen from 'common/LoadingScreen'
import { appAtom, appQueryAtom } from 'features/application/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function ViewerPage() {
  const { appID } = useParams()

  const setAppQuery = useSetAtom(appQueryAtom)
  const app = useAtomValue(appAtom)

  useEffect(() => {
    if (appID) {
      setAppQuery(parseInt(appID))
    }
  }, [appID, setAppQuery])

  return (
    <main className='h-dynamic-screen w-full'>
      {app.isLoading ? <LoadingScreen /> : null}
      {app.data ? (
        <div
          className='relative flex h-full w-full flex-col items-center bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url(${app.data.background_image_url})` }}
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
            <div
              className='mx-auto flex h-full max-w-full flex-col items-center justify-center rounded-lg'
              style={{
                backgroundColor: app.data.button_background_color,
                color: app.data.button_text_color
              }}
            >
              {app.data.button_text}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
