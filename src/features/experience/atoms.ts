import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'

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
