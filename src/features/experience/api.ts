import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import {
  getAuthorizationHeader,
  getFormDataFromObject,
  throwNetworkError
} from 'common/utils'
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
  // asset_url?: string // Used in client only
  // asset_uuid: string
  click_action?: { target: string; type: string }
  // content_type: string
  instance_id: string // Used in client only
  playback_settings?: {
    autoplay?: boolean
    loop?: boolean
    volume: number
    is_playing?: boolean
  }
  position: Vec3
  quaternion: Vec4
  rotation: Vec3
  scale: Vec3
}

export type Vec3 = [x: number, y: number, z: number]
export type Vec4 = [x: number, y: number, z: number, w: number]

export type CreateExperienceRequest = {
  name?: string
  marker_image?: File
  app_id: number
  asset_uuids?: string[]
  // transform?: ContentTransform[]
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

/***************************************
 *             AssetContent            *
 ***************************************/
export type AssetContent = {
  created: string // datetime
  deleted: boolean
  description: string | null
  external_url: string | null
  file_ext: string | null
  file_size: number | null // bytes
  id: number
  is_from_custom: boolean // default false
  is_preview_image: boolean // default false
  link: string | null
  modified: string // datetime
  name: string | null
  original_height: number | null
  original_width: number | null
  public: boolean // default true
  should_watermark: boolean // false if team owner's billing is paid up
  tags: string[]
  text: string | null
  thumbnail_asset_url: string | null
  thumbnail_asset_uuid: string | null
  type: AssetContentType
  uri_s3: string | null
  url: string
  url_512: string
  user_id: number
  uuid: string
  duration: number | null // seconds
}

export type AssetContentType = '3d' | 'audio' | 'image' | 'video'

export type AssetContentCreateRequest = {
  content_type?: string
  description?: string
  file_ext?: string
  file_size?: number
  file?: File
  link_to_file?: string
  name?: string
  price?: number
  public?: boolean
  text?: string
  type?: AssetContentType
}

export function createAssetContent(
  req: AssetContentCreateRequest
): Promise<AssetContent> {
  const formData = getFormDataFromObject(req)
  return axios
    .post<{ asset: AssetContent } & XrpServerResponse>(
      '/api/v1/asset/create',
      formData
    )
    .then(res => res.data.asset)
    .catch(error => throwNetworkError(error))
}

export function updateAssetContent(
  uuid: string,
  req: Pick<
    AssetContentCreateRequest,
    'description' | 'file_ext' | 'price' | 'public' | 'text' | 'type'
  >
): Promise<AssetContent> {
  const formData = getFormDataFromObject(req)
  return axios
    .put<{ asset: AssetContent } & XrpServerResponse>(
      `/api/v1/asset/${uuid}`,
      formData
    )
    .then(res => res.data.asset)
    .catch(error => throwNetworkError(error))
}

/**
 * Soft deletes an asset and returns it. This request also attempts* to delete relevant items from the asset_transform_info of related experiences.
 * *experience.asset_transform_info is expected to be either:
 *   - a list of objects each having a key "uuid"
 *   - an object where asset_uuids are the keys
 * @param uuid From asset create.
 * @param force Default false, only relevant for "premium" assets which are associated with >1 users
 * @returns
 */
export function deleteAssetContent(
  uuid: string,
  force?: boolean
): Promise<AssetContent> {
  return axios
    .delete(`/api/v1/asset/${uuid}/delete`, { params: { force } })
    .then(res => res.data.asset)
    .catch(error => throwNetworkError(error))
}

export type AssetContentUrls = {
  backup_url: string | null
  url: string | null
  // url_hls_hi: string | null
  // url_hls_lo: string | null
  // url_hls_me: string | null
}

export type AssetContentUrlsQuery = {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  background?: string
  add_alt_video_urls?: boolean
}

export function getAssetContentUrl(
  uuid: string,
  query?: AssetContentUrlsQuery,
  access_token?: string | null
) {
  return axios
    .get<AssetContentUrls & XrpServerResponse>(`/api/v2/asset/${uuid}/url`, {
      params: query,
      headers: access_token
        ? {
            ...getAuthorizationHeader(access_token)
          }
        : undefined
    })
    .then(res => ({
      backup_url: res.data.backup_url,
      url: res.data.url
      // url_hls_hi: res.data.url_hls_hi,
      // url_hls_lo: res.data.url_hls_lo,
      // url_hls_me: res.data.url_hls_me
    }))
}

/***************************************
 *                Marker               *
 ***************************************/
export type Marker = {
  created: string // datetime
  dat_file_uri_s3: null
  deleted: boolean
  file_size: number | null // bytes
  id: number
  is_from_custom: boolean
  last_seen_lat: null
  last_seen_lon: null
  modified: string // datetime
  orig_img_uri_s3: null
  original_height: number | null
  original_width: number | null
  tracking_rating: number
  type: 'image'
  url: string
  user_id: number
  uuid: string
  vuforia_reco_rating: null
  vuforia_status: null
  vuforia_target_id: null
  width: null
}
