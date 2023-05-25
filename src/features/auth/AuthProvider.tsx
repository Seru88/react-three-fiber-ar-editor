import { createContext, PropsWithChildren } from 'react'
import useSWR from 'swr'
import { useLocalStorage } from 'usehooks-ts'

import { loginApi, LoginRequest, refreshLoginApi, User } from './api'

export type AuthContextType = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isLoggedOut: boolean
  login: (credentials: LoginRequest) => Promise<void>
  // logout: () => Promise<void>
  // signup: (data: SignUpData) => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const AuthContext = createContext<AuthContextType>(null!)

export default function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useLocalStorage<string | null>(
    'access_token',
    null
  )
  const [refreshToken, setRefreshToken] = useLocalStorage<string | null>(
    'refresh_token',
    null
  )

  const { data, error, mutate } = useSWR(
    refreshToken,
    token => refreshLoginApi(token),
    { refreshInterval: 390000 }
  )

  const login = async (request: LoginRequest) => {
    const res = await loginApi(request)
    mutate(res)
    setAccessToken(res.access_token)
    setRefreshToken(res.refresh_token)
  }

  // const { data } = useQuery({
  //   refetchInterval: 390000,
  //   queryKey: [refreshToken],
  //   queryFn: async ({ queryKey: [token] }) => {
  //     if (token === null) return null
  //     return await refreshLoginApi(token)
  //   }
  // })

  const value = {
    user: data?.user ?? null,
    accessToken,
    refreshToken,
    isLoading: !data && !error && refreshToken !== null,
    isLoggedOut: error && error.status === 403,
    login
    // logout,
    // signup
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
