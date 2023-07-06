import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import { getFormDataFromObject, throwNetworkError } from 'common/utils'

export type Application = {
  background_image_url: string | null // max width 512
  button_background_color: string
  button_text: string
  button_text_color: string
  created: string // datetime
  id: number
  image_url: string | null // max width 512
  instructions_image_url: string | null // max width 512
  logo_image_url: string | null // max width 512
  modified: string // datetime
  name: string
  text: string
  user_id: number
}

export type CreateAppRequest = {
  background_image?: File
  button_background_color: string
  button_text_color: string
  image?: File
  instructions_image?: File
  logo_image?: File
  button_text: string
  name: string
  text?: string
}

export type GetAppsQuery = {
  id?: number
  user_id?: number
}

export async function createApp(request: CreateAppRequest) {
  const form = getFormDataFromObject(request)
  return axios
    .post<XrpServerResponse & { app: Application }>(
      '/api/v1/app/create',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    .then(res => res.data.app)
    .catch(error => throwNetworkError(error))
}

export function getApps(params: GetAppsQuery) {
  if (!params.id && !params.user_id) return Promise.resolve([])
  return axios
    .get<XrpServerResponse & { apps: Application[] }>('/api/v1/apps', {
      params
    })
    .then(res => res.data.apps)
    .catch(error => throwNetworkError(error))
}

export function updateApp(appID: number, request: Partial<CreateAppRequest>) {
  const form = getFormDataFromObject(request)
  return axios
    .put<XrpServerResponse & { app: Application }>(
      `/api/v1/app/${appID}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    .then(res => res.data.app)
    .catch(error => throwNetworkError(error))
}

export function deleteApp(appID: number) {
  return axios
    .delete<XrpServerResponse & { app: Application }>(`/api/v1/app/${appID}`)
    .then(res => res.data.app)
    .catch(error => throwNetworkError(error))
}
