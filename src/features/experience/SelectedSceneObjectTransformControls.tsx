import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { FC } from 'react'

import { expSceneAtom } from './state'
import { getSceneObjectParentByName } from './utils'

const SelectedSceneObjectTransformControls: FC = () => {
  const expScene = useAtomValue(expSceneAtom)
  const scene = useThree(state => state.scene)

  if (expScene.current) {
    const obj = scene.getObjectByName(expScene.current)
    return obj ? (
      <TransformControls
        object={getSceneObjectParentByName(obj, `${obj.name}-bound`)}
        mode={expScene.gizmo}
        space='world'
      />
    ) : null
  }
  return null
}

export default SelectedSceneObjectTransformControls
