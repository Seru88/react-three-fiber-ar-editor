import { useAtom } from 'jotai'
import { experienceQueryAtom, experiencesQueryAtom } from './atoms'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateExperienceRequest,
  createExperience,
  deleteExperience,
  updateExperience
} from './api'
import { toast } from 'react-hot-toast'

export function useExperienceMutation() {
  const [expQuery, setExpQuery] = useAtom(experienceQueryAtom)
  const [expsQuery] = useAtom(experiencesQueryAtom)
  const queryClient = useQueryClient()

  const create = useMutation(createExperience, {
    onSuccess: data => {
      setExpQuery(data.id)
      // queryClient.invalidateQueries(['exp', expQuery])
      queryClient.invalidateQueries(['exps', expsQuery])
    },
    onError: error => {
      toast.error((error as Error).message)
    }
  })

  const update = useMutation(
    (args: { id: number; request: Partial<CreateExperienceRequest> }) => {
      // if (expQuery !== null) {
      return updateExperience(args.id, args.request)
      // }
      // throw new Error('No experience selected to update')
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['exp', expQuery])
        queryClient.invalidateQueries(['exps', expsQuery])
      }
    }
  )

  const remove = useMutation(deleteExperience, {
    onSuccess: () => {
      queryClient.invalidateQueries(['exps', expsQuery])
    }
  })

  return { create, update, remove }
}
