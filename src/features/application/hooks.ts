import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'

import { createApp, CreateAppRequest, deleteApp, updateApp } from './api'
import { appQueryAtom, appsQueryAtom } from './atoms'

export function useAppMutation() {
  const [appQuery, setAppQuery] = useAtom(appQueryAtom)
  const [appsQuery] = useAtom(appsQueryAtom)
  const queryClient = useQueryClient()

  const create = useMutation(createApp, {
    onSuccess: data => {
      setAppQuery(data.id)
      // queryClient.invalidateQueries(['app', appQuery])
      queryClient.invalidateQueries(['apps', appsQuery])
    }
  })

  const update = useMutation(
    (req: Partial<CreateAppRequest>) => {
      if (appQuery !== null) {
        return updateApp(appQuery, req)
      }
      throw new Error('No app selected to update.')
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['app', appQuery])
        queryClient.invalidateQueries(['apps', appsQuery])
      }
    }
  )

  const remove = useMutation(deleteApp, {
    onSuccess: () => {
      // queryClient.invalidateQueries(['app', appQuery])
      queryClient.invalidateQueries(['apps', appsQuery])
    }
  })

  return { create, update, remove }
}
