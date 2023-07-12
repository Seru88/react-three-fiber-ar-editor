import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import { throwNetworkError } from 'common/utils'

export type User = {
  created: string // datetime
  email: string
  first_name: string
  id: number
  last_name: string
  modified: string // datetime
}

export type LoginRequest = {
  password: string
  email: string
  remember?: boolean
  remember_duration?: number
}

// export type SignUpData = {
//   company: string
//   invite_token?: string
//   full_name: string
// } & LoginRequest

export type AuthenticationResponse = {
  access_token: string
  refresh_token: string | null
  user: User
} & XrpServerResponse

// export const signUpApi = (data: SignUpData) =>
//   axios.post<AuthenticationResponse>('/api/signup', data).then(res => res.data)

export function login(credentials: LoginRequest) {
  return axios
    .post<AuthenticationResponse>('/api/v1/login', credentials)
    .then(res => {
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`
      return res.data
    })
    .catch(error => throwNetworkError(error))
}

// export function logout() {
//   return axios
//     .get<XrpServerResponse>('/api/v1/logout')
//     .then(() => null)
//     .catch(error => throwNetworkError(error))
// }

export function refreshLogin(refresh_token: string) {
  return axios
    .post<Omit<AuthenticationResponse, 'refresh_token'>>(
      '/api/v1/login_refresh',
      null,
      {
        headers: { Authorization: `Bearer ${refresh_token}` }
      }
    )
    .then(res => {
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`
      return res.data
    })
    .catch(error => throwNetworkError(error))
}

export function verifyLogin() {
  return axios
    .get<AuthenticationResponse>('/api/v2/verify_login', {
      params: { add_props: 'settings' }
    })
    .then(res => {
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`
      return res.data
    })
    .catch(error => throwNetworkError(error))
}
