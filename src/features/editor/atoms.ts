import { App } from 'features/application/api'
import { ContentTransform, Experience } from 'features/experience/api'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import type { OpticFor } from 'optics-ts'
import { SetStateAction } from 'react'

export type EditorState = {
  app: App | null
  experiences: Experience[]
}

export const editorAtom = atom<EditorState>({ app: null, experiences: [] })

export const currEditingExperienceIndexAtom = atom<number | null>(null)

export const currEditingAssetIndexAtom = atom<number | null>(null)

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
      set(currEditingAssetIndexAtom, null)
    }
  }
)

export const currEditingAssetAtom = atom(
  get => {
    const currExp = get(currEditingExperienceAtom)
    const assetIndex = get(currEditingAssetIndexAtom)
    if (currExp === null || assetIndex === null) return null
    const contents = currExp.transform
    if (!contents?.length) return null
    return contents[assetIndex]
  },
  (get, set, action: SetStateAction<ContentTransform | null>) => {
    const currExp = get(currEditingExperienceAtom)
    const assetIndex = get(currEditingAssetIndexAtom)
    if (currExp === null || assetIndex === null) return
    const contents = currExp.transform
    if (!contents?.length) return
    const newValue =
      typeof action === 'function' ? action(contents[assetIndex]) : action
    const update = newValue
      ? [
          ...contents.slice(0, assetIndex),
          newValue,
          ...contents.slice(assetIndex + 1)
        ]
      : [...contents.slice(0, assetIndex), ...contents.slice(assetIndex + 1)]
    set(currEditingExperienceAtom, { ...currExp, transform: update })
    if (newValue === null) {
      set(currEditingAssetIndexAtom, null)
    }
  }
)
