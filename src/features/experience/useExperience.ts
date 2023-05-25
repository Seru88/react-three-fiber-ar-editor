import { Experience, GetExperienceQuery, getExperienceApi } from './api'
import useSWR, { SWRConfiguration } from 'swr'

export default function useExperience(
  query: GetExperienceQuery,
  config?: SWRConfiguration<Experience | null>
) {
  const { data, error, isLoading, isValidating } = useSWR(
    ['experience', query],
    ([, query]) => getExperienceApi(query),
    config
  )

  return {
    experience: data ?? null,
    error,
    isLoading,
    isValidating
  }
}
