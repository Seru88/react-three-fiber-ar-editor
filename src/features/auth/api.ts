import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import { throwNetworkError } from 'common/utils'

export type User = {
  created: string
  customer_id: string | null
  deleted: boolean
  domain: string // e.g. "postreality"
  email: string
  first_name: string
  id: number
  last_login: {
    modified: string // datetime
  }
  last_name: string
  meta: object | null
  modified: string // datetime
  role_type_id: number
  team_id: number | null
  teams_roles: {
    role_name: string
    team_id: number
  }[]
  username: string
}

export type LoginRequest = {
  domain: string
  password: string
  email?: string
  username?: string
  email_or_username?: string
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

// export type InviteData = {
//   invitee_email: string
//   invitee_role_name: string
// }

// export const signUpApi = (data: SignUpData) =>
//   axios.post<AuthenticationResponse>('/api/signup', data).then(res => res.data)

export const login = (credentials: LoginRequest) =>
  axios
    .post<AuthenticationResponse>('/api/v2/login', credentials)
    .then(res => {
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`
      return res.data
    })
    .catch(error => throwNetworkError(error))

export const refreshLogin = (refresh_token: string) =>
  axios
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

export const verifyLogin = () =>
  axios
    .get<AuthenticationResponse>('/api/v2/verify_login', {
      params: { add_props: 'settings' }
    })
    .then(res => {
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`
      return res.data
    })
    .catch(error => throwNetworkError(error))
