import { Object3D, Event } from 'three'

export const generateInstanceID = () => {
  const length = 9
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const getSceneObjectParentByName = (
  obj: Object3D<Event>,
  name: string
): Object3D<Event> | undefined => {
  if (obj.parent) {
    return obj.parent.name === name
      ? obj.parent
      : getSceneObjectParentByName(obj.parent, name)
  }
  return undefined
}
