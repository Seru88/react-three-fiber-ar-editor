import EditorPage from 'EditorPage'
import MainLayout from 'common/MainLayout'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

const Index = () => {
  return <Navigate to='/edit' />
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Index />} />
          <Route path='/edit' element={<EditorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
