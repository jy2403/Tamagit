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
const EYE_COLOR = 0x000000;

const TOON_OPTIONS = {
  tones: [0.35, 1] as [number, number],
  thickness: 0.012,
  outlineColor: 0x000000,
};

type Backdrop = 'none' | 'egg';

type UsePet3DSceneOptions = {
  simple: boolean;
  yawRef: React.MutableRefObject<number>;
  distRef: React.MutableRefObject<number>;
  autoRotate?: boolean;
  idle?: boolean;
  backdrop?: Backdrop;
  bodyColor?: string | null;
  background?: string;
  pausedRef?: React.MutableRefObject<boolean>;
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

function createEggBackdrop(height: number) {
  const geometry = new THREE.SphereGeometry(1, 48, 48);
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3);
  const top = new THREE.Color('#F7F7FA');
  const bottom = new THREE.Color('#D3D3DA');
  const color = new THREE.Color();

  for (let index = 0; index < position.count; index += 1) {
    const y = position.getY(index);
    color.copy(bottom).lerp(top, (y + 1) / 2);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshBasicMaterial({ vertexColors: true });
  const egg = new THREE.Mesh(geometry, material);
  egg.scale.set(1.12, 1.5, 0.6);
  egg.position.set(0, height * 0.55, -1.05);

  const shadowGeometry = new THREE.CircleGeometry(0.72, 48);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.012, 0.05);
  shadow.scale.set(1.25, 0.42, 1);

  return { egg, shadow };
}

export function usePet3DScene({
  simple,
  yawRef,
  distRef,
  autoRotate = !simple,
  idle = false,
  backdrop = 'none',
  bodyColor,
  background = '#EDEDF0',
  pausedRef,
}: UsePet3DSceneOptions) {
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);
  const gradientMapRef = useRef<THREE.Texture | null>(null);
  const extrasRef = useRef<THREE.Object3D[]>([]);
  const cancelledRef = useRef(false);

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    disposeObject(meshRef.current);
    meshRef.current = null;
    extrasRef.current.forEach((extra) => disposeObject(extra));
    extrasRef.current = [];
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
      renderer.setClearColor(new THREE.Color(background), 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(background);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(2, 3, 4);
      scene.add(key);

      if (backdrop === 'egg') {
        const { egg, shadow } = createEggBackdrop(MODEL_HEIGHT);
        scene.add(egg);
        scene.add(shadow);
        extrasRef.current.push(egg, shadow);
      }

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

      const materialColors: Record<string, number | string> = {
        'Material.002': EYE_COLOR,
      };
      if (bodyColor) materialColors['Material.001'] = bodyColor;

      gradientMapRef.current?.dispose();
      gradientMapRef.current = applyToonOutline(model, {
        ...TOON_OPTIONS,
        materialColors,
      });

      group.rotation.y = MODEL_FACING + yawRef.current;
      scene.add(group);
      meshRef.current = group;

      const lookAtY = MODEL_HEIGHT * 0.5;
      const fitDistance =
        (MODEL_HEIGHT / (2 * Math.tan((camera.fov * Math.PI) / 360))) *
        (backdrop === 'egg' ? 1.82 : 1.18);

      if (simple) {
        camera.position.set(0, lookAtY + 0.15, fitDistance);
        camera.lookAt(0, lookAtY, 0);
        renderer.render(scene, camera);
        gl.endFrameEXP();
        return;
      }

      camera.position.set(0, lookAtY + 0.2, distRef.current);
      camera.lookAt(0, lookAtY, 0);

      const clock = new THREE.Clock();

      const loop = () => {
        if (cancelledRef.current) return;
        rafRef.current = requestAnimationFrame(loop);
        if (pausedRef?.current) return;

        const elapsed = clock.getElapsedTime();
        if (autoRotate) yawRef.current += 0.006;
        group.rotation.y = MODEL_FACING + yawRef.current;

        if (idle) {
          const breath = Math.sin(elapsed * 2.1) * 0.012;
          group.scale.set(1 + breath * 0.4, 1 + breath, 1 + breath * 0.4);
          group.position.y = Math.sin(elapsed * 2.1) * 0.008;
        }

        camera.position.z = distRef.current;
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      rafRef.current = requestAnimationFrame(loop);
    },
    [autoRotate, backdrop, background, bodyColor, distRef, idle, pausedRef, simple, yawRef]
  );

  return { onContextCreate, cleanup };
}
