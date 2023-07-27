import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from 'Router'
import AuthProvider from 'features/auth/components/AuthProvider'
import { queryClientAtom } from 'jotai-tanstack-query'
import { Provider } from 'jotai/react'
import { useHydrateAtoms } from 'jotai/react/utils'
import { PropsWithChildren, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { themeChange } from 'theme-change'

const queryClient = new QueryClient()

const HydrateAtoms = ({ children }: PropsWithChildren) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return <>{children}</>
}

function App() {
  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        {/* This Provider initialisation step is needed so that we reference the same
        queryClient in both atomWithQuery and other parts of the app. Without this,
        our useQueryClient() hook will return a different QueryClient object */}
        <HydrateAtoms>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </HydrateAtoms>
      </Provider>
      <Toaster position='bottom-center' />
    </QueryClientProvider>
  )
}

export default App
