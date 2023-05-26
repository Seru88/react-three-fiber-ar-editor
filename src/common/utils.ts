export const getAuthorizationHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
})
