import clsx from 'clsx'
import useAuth from 'features/auth/useAuth'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

type LoginFormData = {
  email_or_username: string
  password: string
}

export default function LoginPage() {
  const { loginMutation } = useAuth()

  const navigate = useNavigate()

  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const onSubmit: SubmitHandler<LoginFormData> = async data => {
    await loginMutation.mutateAsync({ domain: 'postreality', ...data })
    navigate('/', { state: { from: location.state?.from?.pathname || '/' } })
  }

  return (
    <div className='relative flex h-screen flex-col justify-center overflow-hidden p-5'>
      <div className='card-bordered card m-auto w-full shadow-2xl lg:max-w-lg'>
        <div className='card-body'>
          <h1 className='text-center text-3xl font-semibold'>SpearXR Studio</h1>
          <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className='label'>
                <span className='label-text text-base'>Email</span>
              </label>
              <input
                type='text'
                placeholder='Email Address'
                defaultValue=''
                className={clsx(
                  'input-bordered input w-full',
                  errors.email_or_username && 'input-error'
                )}
                {...register('email_or_username', { required: 'Required' })}
              />
              {errors.email_or_username && (
                <label className='label'>
                  <span className='label-text-alt text-error'>
                    {errors.email_or_username.message}
                  </span>
                </label>
              )}
            </div>
            <div>
              <label className='label'>
                <span className='label-text text-base'>Password</span>
              </label>
              <input
                type='password'
                placeholder='Enter Password'
                defaultValue=''
                className={clsx(
                  'input-bordered input w-full',
                  errors.password && 'input-error'
                )}
                {...register('password', {
                  required: 'Required',
                  minLength: {
                    value: 6,
                    message: 'Too short, 6 characters minimum.'
                  }
                })}
              />
              {errors.password && (
                <label className='label'>
                  <span className='label-text-alt text-error'>
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>
            {/* <a
            href='#'
            className='text-xs text-gray-600 hover:text-blue-600 hover:underline'
          >
            Forget Password?
          </a> */}
            <div>
              <button
                className='btn-neutral btn-block btn'
                disabled={loginMutation.isLoading}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
