import { useAtom } from 'jotai'
import { experienceQueryAtom, experiencesQueryAtom } from './atoms'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateExperienceRequest,
  Experience,
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
      onSuccess: exp => {
        queryClient.setQueryData(['exp', expQuery], exp)
        queryClient.setQueryData<Experience[]>(['exps', expQuery], prev => {
          if (prev) {
            const index = prev.findIndex(e => e.id === exp.id)
            if (index > 0) {
              return [...prev.slice(0, index), exp, ...prev.slice(index + 1)]
            }
          }
          return prev
        })
        // queryClient.invalidateQueries(['exp', expQuery])
        // queryClient.invalidateQueries(['exps', expsQuery])
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
