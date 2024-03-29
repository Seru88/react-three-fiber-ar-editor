import EditorPage from 'pages/EditorPage'
import LoginPage from 'pages/LoginPage'
import MainLayout from 'common/MainLayout'
import RequireAuth from 'features/auth/components/RequireAuth'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import ViewerPage from 'pages/ViewerPage'

const Index = () => {
  return <Navigate to='/edit' />
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Index />} />
          <Route path='edit' element={<EditorPage />} />
        </Route>
        <Route path='/app/:appID' element={<ViewerPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route
          path='*'
          element={
            <div className='flex h-screen w-screen items-center justify-center'>
              404 Not Found!
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
