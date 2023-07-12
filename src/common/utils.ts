import { AxiosError, CanceledError } from 'axios'
import { XrpServerResponse } from './types'

export const getAuthorizationHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
})

export const getFormDataFromObject = (object: Record<string, unknown>) =>
  Object.keys(object).reduce((formData, key) => {
    if (object[key] === undefined) return formData
    const value = Array.isArray(object[key])
      ? JSON.stringify(object[key] as Array<unknown>)
      : (object[key] as string | Blob)
    formData.append(key, value)
    return formData
  }, new FormData())

export const isXrpBackendError = (
  reason: unknown
): reason is AxiosError<XrpServerResponse, Error> => {
  return (
    (reason as AxiosError<XrpServerResponse, Error>).response?.data.error !==
    undefined
  )
}

export const throwNetworkError = (r: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(r)
  }
  if (r instanceof CanceledError) throw r
  if (isXrpBackendError(r))
    throw new Error(r?.response?.data?.error ?? undefined)
  throw new Error('An error has occured.')
}
