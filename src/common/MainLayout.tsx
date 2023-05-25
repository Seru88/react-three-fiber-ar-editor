import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <>
      {/* <div>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </div>
      <hr /> */}
      <Outlet />
    </>
  )
}
