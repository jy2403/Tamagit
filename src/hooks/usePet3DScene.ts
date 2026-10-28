import { useCallback, useRef } from 'react';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { applyToonOutline } from '@/lib/toonOutline';
import MODEL_ASSET from '../../assets/tamagit-mascota-base.glb';

if (!(globalThis as { THREE?: unknown }).THREE) {
  (globalThis as { THREE?: unknown }).THREE = THREE;
}

const MODEL_HEIGHT = 1.9;
const MODEL_FACING = -Math.PI / 2;

// Ajusta aquí el look: [sombra, luz] (0..1), grosor del borde y overrides.
// El .glb exportado no trae colores (todos los materiales llegan blancos),
// por eso los ojos se fuerzan a negro aquí hasta corregirlo en Blender.
const TOON_OPTIONS = {
  tones: [0.35, 1] as [number, number],
  thickness: 0.012,
  outlineColor: 0x000000,
  materialColors: {
    'Material.002': 0x000000,
  },
  debug: true,
};

type UsePet3DSceneOptions = {
  simple: boolean;
  yawRef: React.MutableRefObject<number>;
  distRef: React.MutableRefObject<number>;
};

function disposeObject(object: THREE.Object3D | null) {
  object?.traverse((child) => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material?.dispose();
    }
  });
}

async function loadModel() {
  const asset = Asset.fromModule(MODEL_ASSET);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const buffer = await new File(uri).arrayBuffer();
  const gltf = await new Promise<GLTF>((resolve, reject) => {
    new GLTFLoader().parse(buffer, '', resolve, reject);
  });
  return gltf.scene;
}

function fitToHeight(object: THREE.Object3D, targetHeight: number) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  object.scale.multiplyScalar(targetHeight / (size.y || 1));
  box.setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= box.min.y;
}

export function usePet3DScene({ simple, yawRef, distRef }: UsePet3DSceneOptions) {
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);
  const gradientMapRef = useRef<THREE.Texture | null>(null);
  const cancelledRef = useRef(false);

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    disposeObject(meshRef.current);
    meshRef.current = null;
    gradientMapRef.current?.dispose();
    gradientMapRef.current = null;
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
  }, []);

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      cancelledRef.current = false;

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor(0x171717, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      rendererRef.current = renderer;

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

      // Luz suave para que el toon tenga un tono de sombra legible.
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(2, 3, 4);
      scene.add(key);

      let model: THREE.Object3D;
      try {
        model = await loadModel();
      } catch {
        return;
      }

      if (cancelledRef.current) {
        disposeObject(model);
        return;
      }

      const group = new THREE.Group();
      group.add(model);
      fitToHeight(model, MODEL_HEIGHT);
      gradientMapRef.current?.dispose();
      gradientMapRef.current = applyToonOutline(model, TOON_OPTIONS);
      group.rotation.y = MODEL_FACING + yawRef.current;
      scene.add(group);
      meshRef.current = group;

      const lookAtY = MODEL_HEIGHT * 0.5;
      const fitDistance = (MODEL_HEIGHT / (2 * Math.tan((camera.fov * Math.PI) / 360))) * 1.18;

      if (simple) {
        camera.position.set(0, lookAtY + 0.15, fitDistance);
        camera.lookAt(0, lookAtY, 0);
        renderer.render(scene, camera);
        gl.endFrameEXP();
        return;
      }

      camera.position.set(0, lookAtY + 0.2, distRef.current);
      camera.lookAt(0, lookAtY, 0);

      const loop = () => {
        if (cancelledRef.current) return;
        yawRef.current += 0.006;
        group.rotation.y = MODEL_FACING + yawRef.current;
        camera.position.z = distRef.current;
        renderer.render(scene, camera);
        gl.endFrameEXP();
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    },
    [simple, yawRef, distRef]
  );

  return { onContextCreate, cleanup };
}
