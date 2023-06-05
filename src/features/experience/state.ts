import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { AssetContentType, GetExperienceQuery, getExperience } from './api'
import { atomsWithQuery } from 'jotai-tanstack-query'

type ExperienceSceneState = {
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

export const experienceQueryAtom = atom<GetExperienceQuery>({})
export const [, experienceAtom] = atomsWithQuery(get => ({
  refetchOnWindowFocus: false,
  queryKey: ['experience', get(experienceQueryAtom)],
  queryFn: async ({ queryKey: [, query] }) => {
    return await getExperience(query as GetExperienceQuery)
  }
}))

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
