import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from 'Router'
import AuthProvider from 'features/auth/AuthProvider'
import ExperienceScene from 'features/experience/ExperienceScene'
import { queryClientAtom } from 'jotai-tanstack-query'
import { Provider } from 'jotai/react'
import { useHydrateAtoms } from 'jotai/react/utils'
import { PropsWithChildren } from 'react'

const queryClient = new QueryClient()

const HydrateAtoms = ({ children }: PropsWithChildren) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return <>{children}</>
}

function App() {
  return (
    // <QueryClientProvider client={queryClient}>
    //   <Provider>
    //     <HydrateAtoms>
    <AuthProvider>
      <Router />
    </AuthProvider>
    //     </HydrateAtoms>
    //   </Provider>
    // </QueryClientProvider>
  )
}

export default App
