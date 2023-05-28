import axios from 'axios'
import { XrpServerResponse } from 'common/types'
import { getAuthorizationHeader } from 'common/utils'
import { generateInstanceID } from './utils'

/***************************************
 *              Experience             *
 ***************************************/
export type Experience = {
  access_token: string | null
  asset_transform_info: AssetContent[] | null
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
  meta: any
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

export function getExperienceApi(
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
  instance_id: string
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
