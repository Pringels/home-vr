import React, {
  useRef,
  useState,
  Suspense,
  useEffect,
  useCallback,
} from 'react'
import { useFrame, useLoader, useGraph, useThree } from 'react-three-fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from '@react-three/drei'
import {
  DefaultXRControllers,
  useXR,
  useXREvent,
  Select,
} from '@react-three/xr'
import './index.css'
import * as THREE from 'three'

function Box(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Asset({ url }) {
  const scene = useLoader(OBJLoader, url)
  const { nodes, materials } = useGraph(scene)
  return (
    <mesh
      position={[0, 0, 0]}
      geometry={nodes.MeshBody1.geometry}
      material={materials['Steel_-_Satin']}
    />
  )
}

export const App = () => {
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0))

  const mesh = useRef()
  const { gl, camera } = useThree()

  useEffect(() => {
    const cam = gl.xr.isPresenting ? gl.xr.getCamera(camera) : camera
    mesh.current.add(cam)
    console.log('ADDED', cam, gl.xr.isPresenting)
    gl.xr.isPresenting && cam.position.set(new THREE.Vector3(10, 10, 10))

    return () => mesh.current.remove(cam)
  }, [gl.xr.isPresenting, gl.xr, camera, mesh])

  // bundle add the controllers to the same object as the camera so it all stays together.
  const { controllers } = useXR()

  useEffect(() => {
    if (controllers.length > 0)
      controllers.forEach((c) => mesh.current.add(c.grip))
    return () => controllers.forEach((c) => mesh.current.remove(c.grip))
  }, [controllers, mesh])

  useFrame(() => {
    // console.log(mesh.current.children[0].position)
    if (controllers.length) {
      // console.log(controllers)
      // console.log(controllers[0].inputSource.gamepad.axes)
      const [
        _,
        _,
        direction,
        intensity,
      ] = controllers[0].inputSource.gamepad.axes
      mesh.current.position.set(new THREE.Vector3(direction * intensity * 3, 0))
    }
  })

  const onSqueeze = useCallback(() => console.log('Squeezed', controllers[0]), [
    controllers,
  ])
  useXREvent('squeeze', onSqueeze)
  console.log('position', position)

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <Select
        onSelect={() => {
          console.log('SELECTED')
          mesh.current.children[0].position.set(new THREE.Vector3(10, 10, 10))
          setPosition((s) => new THREE.Vector3(10, 10, 10))
        }}
      >
        <Box position={position} />
      </Select>

      <mesh position={position} ref={mesh}></mesh>

      {mesh.current && (
        <group position={position}>
          <primitive object={mesh.current.children[0]} />
        </group>
      )}

      <Suspense fallback={<Box position={[4, 0, 0]} />}>
        <Asset url="/HOME.obj" />
      </Suspense>
      <DefaultXRControllers />
      <OrbitControls />
    </>
  )
}
