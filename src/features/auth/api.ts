import axios from 'axios'
import { XrpServerResponse } from 'common/types'

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

export const loginApi = (credentials: LoginRequest) =>
  axios.post<AuthenticationResponse>('/api/v2/login', credentials).then(res => {
    axios.defaults.headers.common.Authorization = `Bearer ${res.data.access_token}`
    return res.data
  })

export const refreshLoginApi = (refresh_token: string) =>
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

// /**
//  * @param id User id.
//  * @param newCredentials Updated credentials.
//  */
// export const updateUserApi = (
//   id: number,
//   newCredentials: Partial<LoginRequest>,
//   access_token?: string
// ) =>
//   axios
//     .put<AuthenticationResponse>(`/api/user/${id}`, newCredentials, {
//       headers: { Authorization: access_token ?? `Bearer ${access_token}` }
//     })
//     .then(res => res.data)

// export const sendInviteCodeApi = (data: InviteData) =>
//   axios
//     .post<XrpServerResponse>('/api/user/invite/send_token', data)
//     .then(res => res.data)

// /**
//  * @param uuid Email verification uuid.
//  */
// export const verifyEmailApi = (
//   uuid: string,
//   abortController?: AbortController
// ) =>
//   axios
//     .put<Omit<AuthenticationResponse, 'access_token'>>(
//       `/api/user/verify_email/${uuid}`,
//       null,
//       { signal: abortController?.signal }
//     )
//     .then(res => res.data)

// export const sendResetPasswordTokenApi = (email: string) =>
//   axios
//     .post<XrpServerResponse>('/api/user/forgot_password/send_token', { email })
//     .then(res => res.data)

// /**
//  * *NOTE: Use the returned respose with updateUserApi to set new password.
//  */
// export const resetPasswordTokenGetAuthApi = (
//   token: string,
//   abortController?: AbortController
// ) =>
//   axios
//     .post<AuthenticationResponse>(
//       '/api/user/forgot_password/lookup_user',
//       { token },
//       { signal: abortController?.signal }
//     )
//     .then(res => res.data)
