import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useAtomValue, useSetAtom } from 'jotai'
import { FC } from 'react'

import { getSceneObjectParentByName } from './utils'
import {
  currEditingAssetAtom,
  currEditingAssetInstanceIDAtom,
  editorGizmoAtom
} from 'features/editor/atoms'

const SelectedSceneObjectTransformControls: FC = () => {
  const currAssetInstanceID = useAtomValue(currEditingAssetInstanceIDAtom)
  const setCurrAsset = useSetAtom(currEditingAssetAtom)
  const gizmo = useAtomValue(editorGizmoAtom)
  const scene = useThree(state => state.scene)

  const handleObjectChange = () => {
    const pObj = scene.getObjectByName(currAssetInstanceID)
    if (pObj) {
      const obj = getSceneObjectParentByName(pObj, `${pObj.name}-bound`)
      if (obj) {
        const pos = obj.position.toArray() as [x: number, y: number, z: number]
        const rot = obj.rotation.toArray() as [x: number, y: number, z: number]
        const scl = obj.scale.toArray() as [x: number, y: number, z: number]
        setCurrAsset(
          prev =>
            prev && {
              ...prev,
              position: pos,
              rotation: rot,
              scale: scl
            }
        )
      }
    }
  }

  if (currAssetInstanceID && gizmo) {
    const obj = scene.getObjectByName(currAssetInstanceID)
    return obj ? (
      <TransformControls
        object={getSceneObjectParentByName(obj, `${obj.name}-bound`)}
        mode={gizmo}
        space='world'
        onObjectChange={handleObjectChange}
      />
    ) : null
  }
  return null
}

export default SelectedSceneObjectTransformControls
