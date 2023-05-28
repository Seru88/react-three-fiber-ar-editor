import LoadingScreen from 'common/LoadingScreen'
import { FC, PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from './useAuth'

const RequireAuth: FC<PropsWithChildren> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (user === null) {
    return <Navigate to='login' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default RequireAuth
