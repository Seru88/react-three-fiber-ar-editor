import { AxiosError, CanceledError } from 'axios'
import { XrpServerResponse } from './types'

export const getAuthorizationHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
})

export const isXrpBackendError = (
  reason: unknown
): reason is AxiosError<XrpServerResponse, Error> => {
  return (
    (reason as AxiosError<XrpServerResponse, Error>).response?.data.error !==
    undefined
  )
}

export const throwNetworkError = (r: unknown) => {
  if (r instanceof CanceledError) throw r
  if (isXrpBackendError(r))
    throw new Error(r?.response?.data?.error ?? undefined)
  throw new Error('An error has occured.')
}
