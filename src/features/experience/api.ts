import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import { getFormDataFromObject, throwNetworkError } from 'common/utils'
import { Asset } from 'features/asset/api'

export type Experience = {
  app_id: number
  asset_uuids: string[]
  created: string // datetime
  id: number
  marker_image_url: string | null
  modified: string // datetime
  name: string
  transform?: ContentTransform[] | null
  contents: ContentTransform[] | null
}

export type ContentTransform = {
  asset: Asset
  name: string
  click_action?: { target: string; type: string }
  instance_id: string // Used in client only
  playback_settings?: {
    autoplay?: boolean
    loop?: boolean
    volume: number
    is_playing?: boolean
  }
  position: Vec3Array
  quaternion: Vec4Array
  rotation: Vec3Array
  scale: Vec3Array
}

export type Vec3Array = [x: number, y: number, z: number]
export type Vec4Array = [x: number, y: number, z: number, w: number]

export type CreateExperienceRequest = {
  name?: string
  marker_image?: File
  app_id: number
  asset_uuids?: string[]
  contents?: Omit<ContentTransform & { asset_uuid: string }, 'asset'>[]
}

export type GetExperiencesQuery = {
  id?: number
  user_id?: number
  app_id?: number
}

export function createExperience(request: CreateExperienceRequest) {
  const form = getFormDataFromObject(request)
  return axios
    .post<XrpServerResponse & { experience: Experience }>(
      '/api/v1/experience/create',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    .then(res => res.data.experience)
    .catch(error => throwNetworkError(error))
}

export function getExperiences(params: GetExperiencesQuery) {
  if (!params.id && !params.user_id && !params.app_id) {
    return Promise.resolve([])
  }
  return axios
    .get<XrpServerResponse & { experiences: Experience[] }>(
      '/api/v1/experiences',
      { params }
    )
    .then(res => res.data.experiences)
    .catch(error => throwNetworkError(error))
}

export function getExperience(id: number) {
  return getExperiences({ id }).then(exps => {
    if (exps.length > 0) return exps[0]
    return null
  })
}

export function updateExperience(
  id: number,
  request: Partial<CreateExperienceRequest>
) {
  const form = getFormDataFromObject(request)
  return axios
    .put<XrpServerResponse & { experience: Experience }>(
      `/api/v1/experience/${id}`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    .then(res => res.data.experience)
    .catch(error => throwNetworkError(error))
}

export function deleteExperience(id: number) {
  return axios
    .delete<XrpServerResponse & { experience: Experience }>(
      `/api/v1/experience/${id}`
    )
    .then(res => res.data.experience)
    .catch(error => throwNetworkError(error))
}
