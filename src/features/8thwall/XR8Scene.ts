import { MutableRefObject } from 'react'
import {
  WebGLCubeRenderTarget,
  RGBAFormat,
  LinearMipMapLinearFilter,
  sRGBEncoding,
  CubeCamera,
  Texture,
  Scene,
  MeshBasicMaterial,
  DoubleSide,
  SphereGeometry,
  Mesh,
  Camera
} from 'three'

import { isMobile } from 'react-device-detect'

export default function XR8Scene(
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  R3Scene: MutableRefObject<Scene | null>
) {
  const renderTarget = new WebGLCubeRenderTarget(256, {
    format: RGBAFormat,
    generateMipmaps: true,
    minFilter: LinearMipMapLinearFilter,
    encoding: sRGBEncoding
  })
  const cubeCamera = new CubeCamera(1, 1000, renderTarget)
  const onxrloaded = () => {
    console.log('starting XRscene')
    const camTexture_ = new Texture()
    let texProps = null
    const cubeMapScene = new Scene()

    const initXrScene = ({
      scene,
      camera
    }: {
      scene: Scene
      camera: Camera
    }) => {
      //Creating a sphere to use as a background
      const refMat = new MeshBasicMaterial({
        side: DoubleSide,
        color: 0xffffff,
        map: camTexture_
      })
      const sphere = new SphereGeometry(100, 15, 15)
      const sphereMesh = new Mesh(sphere, refMat)
      sphereMesh.scale.set(-1, 1, 1)
      sphereMesh.rotation.set(Math.PI, -Math.PI / 2, 0)
      cubeMapScene.add(sphereMesh)

      if (R3Scene.current) scene.add(R3Scene.current)
      camera.position.set(0, 3, 5)
    }

    window.XR8.addCameraPipelineModules([
      window.XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.
      window.XR8.Threejs.pipelineModule(), // Creates a ThreeJS AR Scene.
      window.XR8.XrController.pipelineModule({
        disableWorldTracking: !isMobile,
        enableLighting: true
        // imageTargets: ['HolidayCookie_Bottle', 'CandyCane_Bottle']
      }), // Enables SLAM tracking.
      window.LandingPage.pipelineModule(), // Detects unsupported browsers and gives hints.
      window.XRExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
      window.XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
      window.XRExtras.RuntimeError.pipelineModule() // Shows an error image on runtime error.
    ])
    window.XR8.addCameraPipelineModule({
      name: 'react-fiber-8thwall',
      onStart: (/* { canvasWidth, canvasHeight } */) => {
        const { scene, camera } = window.XR8.Threejs.xrScene()
        initXrScene({ scene, camera })
        window.XR8.XrController.updateCameraProjectionMatrix({
          origin: camera.position,
          facing: camera.quaternion
        })
      }, //END OF ONSTART
      onUpdate: ({ processCpuResult }: { processCpuResult: any }) => {
        const { /* scene, camera, */ renderer } = window.XR8.Threejs.xrScene()
        cubeCamera.update(renderer, cubeMapScene)
        const { reality } = processCpuResult
        if (!reality) {
          return
        }
      },
      onProcessCpu: ({ frameStartResult }: { frameStartResult: any }) => {
        const { cameraTexture } = frameStartResult
        // force initialization
        const { /* scene, camera, */ renderer } = window.XR8.Threejs.xrScene() // Get the 3js scene from window.XR8.Threejs
        texProps = renderer.properties.get(camTexture_)
        texProps.__webglTexture = cameraTexture
      }
    })
    if (canvasRef.current) {
      canvasRef.current.addEventListener('touchstart', () => {
        window.XR8.XrController.recenter()
      })
    }
    window.XR8.run({
      canvas: canvasRef.current,
      allowedDevices: isMobile
        ? window.XR8.XrConfig.device().MOBILE
        : window.XR8.XrConfig.device().ANY
    })
  }

  //cubeCamera holds the texture of the scene, in case you need to use for
  //reflections, refractions, etc (see DreiRefraction.jsx for example)
  return { onxrloaded, renderTarget, cubeCamera }
}
