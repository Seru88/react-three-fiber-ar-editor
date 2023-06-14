import clsx from 'clsx'
import useAuth from 'features/auth/useAuth'
import { MouseEvent } from 'react'
import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  const { logoutMutation } = useAuth()

  const handleAppsMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    window.apps_modal.showModal()
  }

  const handleLogoutClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    logoutMutation.mutate()
  }

  return (
    <div className='flex h-dynamic-screen w-full flex-col'>
      <div className='navbar bg-base-100'>
        <div className='navbar-start'>
          <div className='dropdown'>
            <label tabIndex={0} className='btn-ghost btn lg:hidden'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 12h8m-8 6h16'
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className='dropdown-content menu rounded-box menu-sm z-50 mt-3 w-52 bg-base-100 p-2 shadow'
            >
              <li>
                <button onClick={handleAppsMenuClick}>Apps</button>
              </li>
              {/* <li>
                <a>Parent</a>
                <ul className='p-2'>
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </li> */}
              <li>
                <button>Templates</button>
              </li>
            </ul>
          </div>
          <a className='btn-ghost btn text-2xl normal-case'>SpearXR Studio</a>
        </div>
        <div className='navbar-center hidden lg:flex'>
          <ul className='menu menu-horizontal px-1'>
            <li>
              <button onClick={handleAppsMenuClick}>Apps</button>
            </li>
            {/* <li tabIndex={0}>
              <details>
                <summary>Parent</summary>
                <ul className='p-2'>
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li> */}
            <li>
              <button>Templates</button>
            </li>
          </ul>
        </div>
        <div className='navbar-end'>
          <button
            className={clsx(
              'btn-primary btn',
              logoutMutation.isLoading && 'btn-disabled'
            )}
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        </div>
      </div>
      <div className='flex-grow'>
        <Outlet />
      </div>
    </div>
  )
}
