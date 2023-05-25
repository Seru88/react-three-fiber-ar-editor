import useSWR, { SWRConfiguration } from 'swr'
import {
  AssetContentUrls,
  AssetContentUrlsQuery,
  getAssetContentUrl
} from './api'

export default function useAssetContentUrls(
  uuid: string,
  query?: AssetContentUrlsQuery,
  access_token?: string | null,
  config?: SWRConfiguration<AssetContentUrls>
) {
  const { data, error, isLoading, isValidating } = useSWR(
    ['experience', uuid, query],
    ([, uuid, query]) => getAssetContentUrl(uuid, query, access_token),
    config
  )

  return {
    ...data,
    error,
    isLoading,
    isValidating
  }
}
