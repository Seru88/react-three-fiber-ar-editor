import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useAtom, useAtomValue } from 'jotai'
import { FC } from 'react'
import { Event, Object3D } from 'three'
import { currentContentAtom, expSceneAtom } from './atoms'
// import { useSnapshot } from 'valtio'
// import { state } from './store'

const GizmoControls: FC = () => {
  const expScene = useAtomValue(expSceneAtom)
  const scene = useThree(state => state.scene)

  const getParentByName = (
    obj: Object3D<Event>,
    name: string
  ): Object3D<Event> | undefined => {
    if (obj.parent) {
      return obj.parent.name === name
        ? obj.parent
        : getParentByName(obj.parent, name)
    }
    return undefined
  }

  if (expScene.current) {
    const obj = scene.getObjectByName(expScene.current)
    return obj ? (
      <TransformControls
        object={getParentByName(obj, `${obj.name}-bound`)}
        mode={expScene.gizmo}
        space='world'
      />
    ) : null
  }
  return null
}

export default GizmoControls
