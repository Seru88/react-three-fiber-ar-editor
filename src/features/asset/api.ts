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
  url: string // if image, max width is 512
  user_id: number
  uuid: string
}

export type PresignedAssetPost = {
  fields: {
    AWSAccessKeyId: string
    key: string
    policy: string
    signature: string
    success_action_redirect: string
    'x-amz-meta-uuid': string
  }
  url: string
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

export function createPresignedAsset(file: File) {
  const getPresignedPostRequest = {
    'x-amz-meta-name': file.name,
    'Content-Type':
      file.type === '' &&
      (file.name.includes('.glb') || file.name.includes('.gltf'))
        ? 'model/gltf-binary'
        : file.type
  }
  return axios
    .post<XrpServerResponse & { presigned_post: PresignedAssetPost }>(
      '/api/v1/asset/presigned_post',
      getPresignedPostRequest
    )
    .then(res => {
      const { fields, url } = res.data.presigned_post
      // const form = getFormDataFromObject(fields)
      // form.append('file', file)
      const fetcher = axios.create()
      fetcher.defaults.headers.common = {}
      return fetcher.post<XrpServerResponse & { asset: Asset }>(
        url,
        { ...fields, file },
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
    })
    .then(({ data: { asset } }) => asset)
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
