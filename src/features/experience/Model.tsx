import {
  Center,
  CenterProps,
  OnCenterCallbackProps,
  Resize,
  useGLTF,
  useSelect
} from '@react-three/drei'
import { PrimitiveProps } from '@react-three/fiber'
import { FC, memo, useCallback, useEffect, useRef } from 'react'

type Props = {
  name: string
  src: string
  centerProps?: Omit<CenterProps, 'name'> & Record<string, any>
  primitiveProps?: Omit<PrimitiveProps, 'object'>
}

const Model: FC<Props> = memo(
  ({ name, src, centerProps, primitiveProps }: Props) => {
    // const $state = useProxy(state)
    const selected = useSelect().find(mesh => {
      return mesh.name === name
    })

    console.log(selected)
    // $state.current = isSelected ? name : null

    const { scene: rootObj } = useGLTF(src)
    rootObj.children[0].name = name

    const handleOnCentered = useCallback((args: OnCenterCallbackProps) => {
      // const {
      //   container,
      //   boundingSphere: { radius },
      // } = args
      // container.position.setY(container.position.y + radius / 2)
    }, [])

    // useEffect(() => {
    //   $state.current = selected ? name : null
    // }, [selected, name])

    return (
      <Center
        {...centerProps}
        name={`${name}-bound`}
        onCentered={handleOnCentered}
      >
        <Resize>
          <primitive {...primitiveProps} object={rootObj} />
        </Resize>
      </Center>
    )
  }
)
Model.displayName = 'Model'

export default Model
