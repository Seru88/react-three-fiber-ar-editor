import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import { getFormDataFromObject, throwNetworkError } from 'common/utils'

export type App = {
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
  text: string | null
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
  text?: string | null
}

export type GetAppsQuery = {
  id?: number
  user_id?: number
}

export async function createApp(request: CreateAppRequest) {
  const form = getFormDataFromObject(request)
  return axios
    .post<XrpServerResponse & { app: App }>('/api/v1/app/create', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => res.data.app)
    .catch(error => throwNetworkError(error))
}
export function getApps(params: GetAppsQuery) {
  if (!params.id && !params.user_id) return Promise.resolve([])
  return axios
    .get<XrpServerResponse & { apps: App[] }>('/api/v1/apps', {
      params
    })
    .then(res => res.data.apps)
    .catch(error => throwNetworkError(error))
}

export function getApp(id: number) {
  return getApps({ id }).then(apps => {
    if (apps.length > 0) return apps[0]
    return null
  })
}

export function updateApp(id: number, request: Partial<CreateAppRequest>) {
  const form = getFormDataFromObject(request)
  return axios
    .put<XrpServerResponse & { app: App }>(`/api/v1/app/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => res.data.app)
    .catch(error => throwNetworkError(error))
}

export function deleteApp(id: number) {
  return axios
    .delete<XrpServerResponse & { app: App }>(`/api/v1/app/${id}`)
    .then(res => res.data.app)
    .catch(error => throwNetworkError(error))
}
