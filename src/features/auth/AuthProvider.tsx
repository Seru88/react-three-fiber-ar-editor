import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { createContext, PropsWithChildren, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useLocalStorage } from 'usehooks-ts'

import {
  AuthenticationResponse,
  login,
  LoginRequest,
  refreshLogin,
  User
} from './api'

export type AuthContextType = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  // isLoggedOut: boolean
  loginMutation: UseMutationResult<
    AuthenticationResponse,
    unknown,
    LoginRequest,
    unknown
  >
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
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    refetchInterval: 390000,
    refetchOnWindowFocus: false,
    retry: false,
    queryKey: [refreshToken],
    queryFn: async ({ queryKey: [token] }) => {
      if (token === null) {
        return await Promise.resolve(null)
      }
      return await refreshLogin(token)
    }
  })

  const loginMutation = useMutation(
    (request: LoginRequest) => {
      return login(request)
    },
    {
      onSuccess: (data, variables, context) => {
        console.log({ data, variables, context })
        setAccessToken(data.access_token)
        setRefreshToken(data.refresh_token)
        void queryClient.invalidateQueries([refreshToken])
      },
      onError: (error, variables, context) => {
        console.log({ error, variables, context })
        toast.error((error as Error).message)
      }
    }
  )

  useEffect(() => {
    if (error !== null) {
      //* Toast message for when need to re-login
      toast.error((error as Error).message)
    }
  }, [error])

  const value = {
    user: data?.user ?? null,
    accessToken,
    refreshToken,
    isLoading,
    // isLoggedOut: Boolean(error && error.status! === 403),
    loginMutation
    // logout,
    // signup
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
