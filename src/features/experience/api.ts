import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import {
  getAuthorizationHeader,
  getFormDataFromObject,
  throwNetworkError
} from 'common/utils'

/***************************************
 *              Experience             *
 ***************************************/
export type Experience = {
  access_token: string | null
  asset_transform_info: AssetContent[] | null
  asset_uuids?: string[]
  author_name: string
  contact_email: string
  count_likes: number
  created: string // datetime
  current_ip_has_liked: boolean
  deleted: boolean
  description: string | null
  id: number
  is_from_custom: boolean
  marker: Marker | null
  marker_floor_to_center_height: number | null
  meta: unknown
  modified: string // datetime
  name: string | null
  product_id: number | null
  scene_color: string
  settings: {
    can_comment: boolean
    can_feature: boolean
    can_screenshot: boolean
    can_view_3d: boolean
    can_view_markerbased: boolean
    can_view_markerless: boolean
    can_voice_chat: boolean
    hide_easel: boolean
    is_public: boolean
    is_vertical: boolean
    notify_on_view: boolean
    password: string
  }
  should_watermark: boolean
  showcase_ids: number[]
  user_id: number
  uuid: string
}

export type GetExperienceQuery = {
  uuid?: string
  short_code?: string
}

/**
 * Retrieve an experience by its uuid or short_code. Must use one of them or else it will return null.
 * @param params Query parameters.
 * @returns
 */
export function getExperience(
  params: GetExperienceQuery
): Promise<Experience | null> {
  if (!params.uuid && !params.short_code) {
    return Promise.resolve(null)
  }
  return axios
    .get<{ experiences: Experience[] } & XrpServerResponse>(
      '/api/v1/experiences',
      { params }
    )
    .then(async res => {
      const exp = res.data.experiences[0]
      const tasks: Promise<AssetContentUrls>[] = []
      exp.asset_transform_info?.forEach(content => {
        tasks.push(
          getAssetContentUrl(content.uuid, undefined, exp.access_token)
        )
      })
      const urls = await Promise.all(tasks)
      exp.asset_transform_info?.forEach(
        (content, index) => (content.url = urls[index].backup_url ?? '')
      )
      return exp
    })
}

export function getExperiences(
  params: GetExperienceQuery
): Promise<Experience[]> {
  return axios
    .get('/api/v1/experiences', { params })
    .then(res => res.data.experiences)
    .catch(error => throwNetworkError(error))
}

export function createExperience(
  req: Omit<
    Partial<Experience>,
    | 'access_token'
    | 'count_likes'
    | 'create'
    | 'current_ip_has_liked'
    | 'delete'
    | 'id'
    | 'marker'
    | 'modified'
    | 'should_watermark'
    | 'showcase_ids'
    | 'user_id'
    | 'uuid'
  > & { marker_uuid?: string }
): Promise<Experience> {
  return axios
    .post('/api/v1/experience/create', req)
    .then(res => res.data.experience)
    .catch(error => throwNetworkError(error))
}

export function updateExperience(uuid: string): Promise<Experience> {
  return axios
    .put(`/api/v1/experience/${uuid}`)
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
