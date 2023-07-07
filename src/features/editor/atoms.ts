import { App } from 'features/application/api'
import { Experience } from 'features/experience/api'
import { atom } from 'jotai'
// import { atomsWithQuery } from 'jotai-tanstack-query'
// import { GetAppsQuery, getApp, getApps } from './api'

// export const appQueryAtom = atom<number | null>(null)
// export const appsQueryAtom = atom<GetAppsQuery>({})

// export const [, appAtom] = atomsWithQuery(get => ({
//   refetchOnWindowFocus: false,
//   queryKey: ['app', get(appQueryAtom)],
//   queryFn: async ({ queryKey: [, query] }) => {
//     if (query === null) return null
//     return await getApp(query as number)
//   }
// }))

// export const [, appsAtom] = atomsWithQuery(get => ({
//   refetchOnWindowFocus: false,
//   queryKey: ['apps', get(appsQueryAtom)],
//   queryFn: async ({ queryKey: [, query] }) => {
//     return await getApps(query as GetAppsQuery)
//   }
// }))

export type EditorState = {
  app: App | null
  experiences: Experience[]
}

export const editorAtom = atom<EditorState>({ app: null, experiences: [] })
