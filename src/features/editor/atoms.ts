import { App } from 'features/application/api'
import { ContentTransform, Experience } from 'features/experience/api'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { OpticFor } from 'optics-ts'
import { SetStateAction } from 'react'

export type EditorState = {
  app: App | null
  experiences: Experience[]
}

export const editorAtom = atom<EditorState>({ app: null, experiences: [] })

export const editorGizmoAtom = atom<'translate' | 'rotate' | 'scale' | null>(
  'translate'
)

// * Consider using the experience's UUID instead.
export const currEditingExperienceIndexAtom = atom<number | null>(null)

export const currEditingAssetInstanceIDAtom = atom('')

export const editorAppAtom = focusAtom<EditorState, App | null, void>(
  editorAtom,
  (optic: OpticFor<EditorState>) => optic.prop('app')
)

export const editorExperiencesAtom = focusAtom<EditorState, Experience[], void>(
  editorAtom,
  (optic: OpticFor<EditorState>) => optic.prop('experiences')
)

export const currEditingExperienceAtom = atom(
  get => {
    const expIndex = get(currEditingExperienceIndexAtom)
    const exps = get(editorExperiencesAtom)
    if (expIndex === null || exps.length === 0) return null
    return exps[expIndex]
  },
  (get, set, action: SetStateAction<Experience | null>) => {
    const expIndex = get(currEditingExperienceIndexAtom)
    const exps = get(editorExperiencesAtom)
    if (expIndex === null || exps.length === 0) return
    const newValue =
      typeof action === 'function' ? action(exps[expIndex]) : action
    const update = newValue
      ? [...exps.slice(0, expIndex), newValue, ...exps.slice(expIndex + 1)]
      : [...exps.slice(0, expIndex), ...exps.slice(expIndex + 1)]
    set(editorExperiencesAtom, update)
    if (newValue === null) {
      set(currEditingExperienceIndexAtom, null)
      set(currEditingAssetInstanceIDAtom, '')
    }
  }
)

export const currEditingAssetAtom = atom(
  get => {
    const currExp = get(currEditingExperienceAtom)
    const currAssetInstanceID = get(currEditingAssetInstanceIDAtom)
    if (currExp === null || currAssetInstanceID === '') return null
    const contents = currExp.contents
    if (!contents?.length) return null
    return contents.find(c => c.instance_id === currAssetInstanceID) ?? null
  },
  (get, set, action: SetStateAction<ContentTransform | null>) => {
    const currExp = get(currEditingExperienceAtom)
    const currAssetInstanceID = get(currEditingAssetInstanceIDAtom)
    if (currExp === null || currAssetInstanceID === '') return
    const contents = currExp.contents
    if (!contents?.length) return
    const currAssetIndex = contents.findIndex(
      c => c.instance_id === currAssetInstanceID
    )
    if (currAssetIndex < 0) return
    const newValue =
      typeof action === 'function' ? action(contents[currAssetIndex]) : action
    const update = newValue
      ? [
          ...contents.slice(0, currAssetIndex),
          newValue,
          ...contents.slice(currAssetIndex + 1)
        ]
      : [
          ...contents.slice(0, currAssetIndex),
          ...contents.slice(currAssetIndex + 1)
        ]
    set(currEditingExperienceAtom, { ...currExp, contents: update })
    if (newValue === null) {
      set(currEditingAssetInstanceIDAtom, '')
    }
  }
)
