import ReactDOM from "react-dom";
import React, { useRef, useState, Suspense } from "react";
import {  useFrame, useLoader, useGraph } from "react-three-fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from '@react-three/drei'
import { VRCanvas, DefaultXRControllers } from '@react-three/xr'
import './index.css'

function Box(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef();

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
  });

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
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Asset({ url }) {
  const scene = useLoader(OBJLoader, url);
  console.log("obj", scene);
  const { nodes, materials } = useGraph(scene);
  console.log("nodes", nodes, materials);
  return <mesh position={[0,0,0]} geometry={nodes.MeshBody1.geometry} material={materials["Steel_-_Satin"]} />
}

ReactDOM.render(
  <VRCanvas>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <Box position={[-1.2, 0, 0]} />
    <Box position={[1.2, 0, 0]} />

    <Suspense fallback={<Box position={[4, 0, 0]}  />}>
      <Asset url="/HOME.obj" />
    </Suspense>
    <OrbitControls />
    <DefaultXRControllers />
  </VRCanvas>,
  document.getElementById("root")
);
