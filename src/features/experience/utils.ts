import { Object3D, Event } from 'three'

export function generateInstanceID() {
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

export function getSceneObjectParentByName(
  obj: Object3D<Event>,
  name: string
): Object3D<Event> | undefined {
  if (obj.parent) {
    return obj.parent.name === name
      ? obj.parent
      : getSceneObjectParentByName(obj.parent, name)
  }
  return undefined
}

export function hslStringToValues(hslString: string) {
  return hslString.split(' ').map(v => {
    if (v.includes('%')) {
      return parseFloat(v.slice(0, v.length - 1))
    }
    return parseFloat(v)
  })
}

export function hslToHex(...args: number[]) {
  // eslint-disable-next-line prefer-const
  let [h, s, l] = args
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0') // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
