import ExperienceScene from 'features/experience/ExperienceScene'
import { useSearchParams } from 'react-router-dom'

export default function EditorPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div className='h-dynamic-screen w-full bg-[#303035]'>
      <ExperienceScene
        mode='editor'
        uuid={searchParams.get('uuid') ?? undefined}
        short_code={searchParams.get('short_code') ?? undefined}
      />
    </div>
  )
}
