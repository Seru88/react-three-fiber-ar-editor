import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import { getFormDataFromObject, throwNetworkError } from 'common/utils'

export type Asset = {
  content_type: string
  created: string // datetime
  duration: number
  file_size: number
  modified: string // datetime
  name: string
  original_height: number
  original_width: number
  user_id: number
  uuid: string
}

export type CreateAssetRequest = {
  name?: string
  file: File
}

export type GetAssetsQuery = {
  user_id?: number
  experience_id?: number
  name?: string
}

export function createAsset(request: CreateAssetRequest) {
  const form = getFormDataFromObject(request)
  return axios
    .post<XrpServerResponse & { asset: Asset }>('/api/v1/asset/create', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => res.data.asset)
    .catch(error => throwNetworkError(error))
}

export function getAssets(params: GetAssetsQuery) {
  if (!params.experience_id && !params.name && !params.user_id) {
    return Promise.resolve([])
  }
  return axios
    .get<XrpServerResponse & { assets: Asset[] }>('/api/v1/assets', { params })
    .then(res => res.data.assets)
    .catch(error => throwNetworkError(error))
}

// export function getAsset() {}

export function updateAsset(
  uuid: string,
  request: Partial<CreateAssetRequest>
) {
  const form = getFormDataFromObject(request)
  return axios
    .put<XrpServerResponse & { asset: Asset }>(`/api/v1/asset/${uuid}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => res.data.asset)
    .catch(error => throwNetworkError(error))
}

export function deleteAsset(uuid: string) {
  return axios
    .delete<XrpServerResponse & { asset: Asset }>(`/api/v1/asset/${uuid}`)
    .then(res => res.data.asset)
    .catch(error => throwNetworkError(error))
}
