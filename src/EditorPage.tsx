import ExperienceScene from 'features/experience/ExperienceScene'
import {
  experienceAtom,
  expQueryAtom,
  sceneAssetContentsAtom,
  SceneAssetContentState
} from 'features/experience/state'
import { generateInstanceID } from 'features/experience/utils'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const imgs = [
  'https://live.staticflickr.com/4012/4442330781_d1dbe1ef23_b.jpg',
  'https://live.staticflickr.com/8417/8710251481_139d32a3a2_b.jpg',
  'https://live.staticflickr.com/7569/16156533058_50286ac69b.jpg',
  'https://live.staticflickr.com/5201/5334693055_39170325f9_b.jpg'
]

export default function EditorPage() {
  const [searchParams] = useSearchParams()
  const [, setQuery] = useAtom(expQueryAtom)
  const [experience] = useAtom(experienceAtom)
  const [, setSceneContents] = useAtom(sceneAssetContentsAtom)

  useEffect(() => {
    const uuid = searchParams.get('uuid') ?? undefined
    const short_code = searchParams.get('short_code') ?? undefined
    setQuery({ uuid, short_code })
  }, [searchParams, setQuery])

  useEffect(() => {
    if (experience.isSuccess) {
      setSceneContents(
        experience.data?.asset_transform_info?.map<SceneAssetContentState>(
          content => ({
            instanceID: generateInstanceID(),
            position: [0, 0, 0],
            quaternion: [0, 0, 0, 1],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            src: content.url,
            type: content.type
          })
        ) ?? []
      )
    }
  }, [experience, setSceneContents])

  const addImage = () => {
    setSceneContents(prev => [
      ...prev,
      {
        instanceID: generateInstanceID(),
        position: [0, 0, 0],
        quaternion: [0, 0, 0, 1],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        src: imgs[Math.floor(Math.random() * imgs.length)],
        type: 'image'
      }
    ])
  }

  return (
    <div className='relative h-dynamic-screen w-full bg-[#303035]'>
      <ExperienceScene mode='editor' />
    </div>
  )
}
