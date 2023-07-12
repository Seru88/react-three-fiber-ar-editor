import { App } from 'features/application/api'
import { Experience } from 'features/experience/api'
import { atom } from 'jotai'

export type EditorState = {
  app: App | null
  experiences: Experience[]
}

export const editorAtom = atom<EditorState>({ app: null, experiences: [] })

export const currEditorExpIndexAtom = atom<number | null>(null)

export const currEditingExperienceAtom = atom(
  get => {
    const index = get(currEditorExpIndexAtom)
    const exps = get(editorAtom).experiences
    if (index === null) return null
    return exps[index]
  }
  // (get, set, action) => {
  //   const index = get(currEditorExpIndexAtom)
  //   const exps = get(editorAtom).experiences
  //   if (index === null) return
  // }
)
