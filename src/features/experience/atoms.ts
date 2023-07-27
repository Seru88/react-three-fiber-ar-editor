import { atom } from 'jotai'
import { atomsWithQuery } from 'jotai-tanstack-query'

import { getExperience, getExperiences, GetExperiencesQuery } from './api'

export const experienceQueryAtom = atom<number | null>(null)
export const experiencesQueryAtom = atom<GetExperiencesQuery>({})

export const [, experienceAtom] = atomsWithQuery(get => ({
  refetchOnWindowFocus: false,
  queryKey: ['exp', get(experienceQueryAtom)],
  queryFn: async ({ queryKey: [, query] }) => {
    if (query === null) return null
    return await getExperience(query as number)
  }
}))

export const [, experiencesAtom] = atomsWithQuery(get => ({
  refetchOnWindowFocus: false,
  queryKey: ['exps', get(experiencesQueryAtom)],
  queryFn: async ({ queryKey: [, query] }) => {
    return await getExperiences(query as GetExperiencesQuery)
  }
}))
