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
  logout,
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
  logoutMutation: UseMutationResult<null, unknown, void, unknown>
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
        return null
      }
      return await refreshLogin(token)
    }
  })

  const loginMutation = useMutation(login, {
    onSuccess: data => {
      setAccessToken(data.access_token)
      setRefreshToken(data.refresh_token)
      queryClient.invalidateQueries([refreshToken])
    },
    onError: error => {
      toast.error((error as Error).message)
    }
  })

  const logoutMutation = useMutation(logout, {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [refreshToken] })
      // const prev = queryClient.getQueryData([refreshToken])
      queryClient.setQueryData([refreshToken], () => null)
      // return prev
    },
    onSuccess: () => {
      setAccessToken(null)
      setRefreshToken(null)
    },
    onError: (error /* variables, context */) => {
      toast.error((error as Error).message)
      // queryClient.setQueryData(['todos'], context.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries([refreshToken])
    }
  })

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
    loginMutation,
    logoutMutation
    // logout,
    // signup
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
