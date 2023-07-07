import clsx from 'clsx'
import useAuth from 'features/auth/useAuth'
import { MouseEvent, useRef } from 'react'
import { Outlet } from 'react-router-dom'

import { useEffect } from 'react'
import { themeChange } from 'theme-change'
import { useAppMutation } from 'features/application/hooks'

const themes = [
  'lofi',
  'light',
  'dark',
  // 'cupcake',
  // 'bumblebee',
  // 'emerald',
  // 'corporate',
  // 'synthwave',
  // 'retro',
  // 'cyberpunk',
  // 'valentine',
  // 'halloween',
  'garden',
  // 'forest',
  'aqua',
  // 'pastel',
  // 'fantasy',
  // 'wireframe',
  // 'black',
  // 'luxury',
  'dracula',
  // 'cmyk',
  // 'autumn',
  'business',
  // 'acid',
  // 'lemonade',
  'night',
  // 'coffee',
  'winter'
]

export default function MainLayout() {
  const { logoutMutation } = useAuth()
  const { create } = useAppMutation()

  const appsMenuDetailsRef = useRef<HTMLDetailsElement | null>(null)

  const handleAppCreate = async () => {
    if (appsMenuDetailsRef.current) {
      appsMenuDetailsRef.current.open = false
    }
    await create.mutateAsync({
      name: 'Untitled',
      text: '',
      button_background_color: '#aabbcc',
      button_text: 'START',
      button_text_color: '#000000'
    })
  }

  const handleLoadAppClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (appsMenuDetailsRef.current) {
      appsMenuDetailsRef.current.open = false
    }
    window.apps_modal.showModal()
  }

  const handleLogoutClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    logoutMutation.mutate()
  }

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])

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
              {/* <li>
                <button onClick={handleAppsMenuClick}>Apps</button>
              </li> */}
              <li>
                <a>Apps</a>
                <ul className='p-2'>
                  <li>
                    <button onClick={handleAppCreate}>Create a new app</button>
                  </li>
                  <li>
                    <button onClick={handleLoadAppClick}>Load an app</button>
                  </li>
                </ul>
              </li>
              <li>
                <button>Templates</button>
              </li>
            </ul>
          </div>
          <a className='btn-ghost btn text-2xl normal-case'>SpearXR Studio</a>
        </div>
        <div className='navbar-center z-50 hidden lg:flex'>
          <ul className='menu menu-horizontal px-1'>
            {/* <li>
              <button onClick={handleAppsMenuClick}>Apps</button>
            </li> */}
            <li tabIndex={0}>
              <details ref={appsMenuDetailsRef}>
                <summary>Apps</summary>
                <ul>
                  <li>
                    <button onClick={handleAppCreate}>Create a new app</button>
                  </li>
                  <li>
                    <button onClick={handleLoadAppClick}>Load an app</button>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <button>Templates</button>
            </li>
          </ul>
        </div>
        <div className='navbar-end space-x-2'>
          <select
            className='select-bordered select capitalize'
            data-choose-theme
          >
            {themes.map(theme => (
              <option key={theme} className='capitalize' value={theme}>
                {theme}
              </option>
            ))}
          </select>
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
