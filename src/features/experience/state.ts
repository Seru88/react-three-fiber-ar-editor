import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { AssetContentType, GetExperienceQuery, getExperienceApi } from './api'
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

export const expQueryAtom = atom<GetExperienceQuery>({})
export const [, experienceAtom] = atomsWithQuery(get => ({
  refetchOnWindowFocus: false,
  queryKey: ['experience', get(expQueryAtom)],
  queryFn: async ({ queryKey: [, query] }) => {
    return await getExperienceApi(query as GetExperienceQuery)
  }
}))

export type SceneAssetContentState = {
  instanceID: string
  position: number[]
  quaternion: number[]
  rotation: number[]
  scale: number[]
  src: string
  type: AssetContentType
}

export const sceneAssetContentsAtom = atom<SceneAssetContentState[]>([])
