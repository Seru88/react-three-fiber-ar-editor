import EditorPage from 'pages/EditorPage'
import LoginPage from 'pages/LoginPage'
import MainLayout from 'common/MainLayout'
import RequireAuth from 'features/auth/RequireAuth'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

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
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}
