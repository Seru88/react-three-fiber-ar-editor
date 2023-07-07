import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateAppRequest, createApp, updateApp } from './api'
import { useAtom } from 'jotai'
import { appQueryAtom, appsQueryAtom } from './atoms'
import { toast } from 'react-hot-toast'

export function useAppMutation() {
  const [appQuery, setAppQuery] = useAtom(appQueryAtom)
  const [appsQuery] = useAtom(appsQueryAtom)
  const queryClient = useQueryClient()

  const create = useMutation(createApp, {
    onSuccess: data => {
      setAppQuery(data.id)
      // queryClient.invalidateQueries(['app', query])
      queryClient.invalidateQueries(['apps', appsQuery])
    },
    onError: error => {
      toast.error((error as Error).message)
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
        toast.success('Saved!')
      },
      onError: error => {
        toast.error((error as Error).message)
      }
    }
  )

  return { create, update }
}
