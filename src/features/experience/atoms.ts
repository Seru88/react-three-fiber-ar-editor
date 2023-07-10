import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import {
  AssetContentType,
  GetExperiencesQuery,
  getExperience,
  getExperiences
} from './api'
import { atomsWithQuery } from 'jotai-tanstack-query'

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

// TODO: Remove the rest below

export type ExperienceSceneState = {
  current: string | null
  gizmo: 'translate' | 'rotate' | 'scale'
}

export const expSceneAtom = atom<ExperienceSceneState>({
  current: null,
  gizmo: 'translate'
})

export const currentContentAtom = focusAtom<
  ExperienceSceneState,
  string | null,
  void
>(expSceneAtom, optic => optic.prop('current'))

export type SceneAssetContentState = {
  instanceID: string
  position: [x: number, y: number, z: number]
  quaternion: [x: number, y: number, z: number, w: number]
  rotation: [x: number, y: number, z: number]
  scale: [x: number, y: number, z: number]
  src: string
  type: AssetContentType
}

export const sceneAssetContentsAtom = atom<SceneAssetContentState[]>([])
