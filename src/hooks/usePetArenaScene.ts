import { useCallback, useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { applyToonOutline } from '@/lib/toonOutline';
import { colorMascotaPorId } from '@/estilos';
import MODEL_ASSET from '../../assets/tamagit-mascota-base.glb';

if (!(globalThis as { THREE?: unknown }).THREE) {
  (globalThis as { THREE?: unknown }).THREE = THREE;
}

const MODEL_HEIGHT = 0.86;
const MAX_PETS = 10;
const EYE_COLOR = 0x000000;
const BOUNDS = { x: 2.25, z: 1.2 };

export type ArenaPet = {
  id: number;
  name: string;
  projectId: number;
  bodyColor?: string | null;
};

type ArenaPetState = {
  pet: ArenaPet;
  group: THREE.Group;
  shadow: THREE.Mesh;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  pauseUntil: number;
  phase: number;
  yaw: number;
  moving: boolean;
};

type UsePetArenaSceneOptions = {
  pets: ArenaPet[];
  paused: boolean;
  onSelect: (pet: ArenaPet) => void;
  background?: string;
};

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

function createFloor() {
  const geometry = new THREE.PlaneGeometry(8, 5, 1, 1);
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3);
  const near = new THREE.Color('#D5D5DB');
  const far = new THREE.Color('#F7F7FA');
  const color = new THREE.Color();

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const ancho = 1 - 0.18 * ((y + 2.5) / 5);
    position.setX(index, x * ancho);
    color.copy(near).lerp(far, (y + 2.5) / 5);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({ vertexColors: true });
  const floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;

  return floor;
}

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

const lerpAngle = (from: number, to: number, amount: number) => {
  let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * Math.min(1, amount);
};

export function usePetArenaScene({
  pets,
  paused,
  onSelect,
  background = '#E7E7EC',
}: UsePetArenaSceneOptions) {
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const statesRef = useRef<ArenaPetState[]>([]);
  const mapsRef = useRef<THREE.Texture[]>([]);
  const pausedRef = useRef(paused);
  const cancelledRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const raycastRef = useRef<((nx: number, ny: number) => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    disposeObject(sceneRef.current);
    sceneRef.current = null;
    statesRef.current = [];
    mapsRef.current.forEach((map) => map.dispose());
    mapsRef.current = [];
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
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 3.25, 5.6);
      camera.lookAt(0, 0.45, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(3, 5, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.55);
      fill.position.set(-4, 3, 2);
      scene.add(fill);

      const floor = createFloor();
      scene.add(floor);

      let baseModel: THREE.Object3D;
      try {
        baseModel = await loadModel();
      } catch {
        return;
      }

      if (cancelledRef.current) {
        disposeObject(baseModel);
        return;
      }

      const visibles = pets.slice(0, MAX_PETS);
      const columns = Math.min(5, visibles.length);
      const rows = Math.max(1, Math.ceil(visibles.length / Math.max(1, columns)));

      visibles.forEach((pet, index) => {
        const column = index % Math.max(1, columns);
        const row = Math.floor(index / Math.max(1, columns));
        const startX = columns > 1 ? -1.8 + (column / (columns - 1)) * 3.6 : 0;
        const startZ = rows > 1 ? -0.65 + (row / (rows - 1)) * 1.3 : 0;

        const model = baseModel.clone(true);
        fitToHeight(model, MODEL_HEIGHT);

        const gradientMap = applyToonOutline(model, {
          tones: [0.35, 1],
          thickness: 0.018,
          outlineColor: 0x000000,
          materialColors: {
            'Material.002': EYE_COLOR,
            'Material.001': pet.bodyColor ?? colorMascotaPorId(pet.id).hex,
          },
          disposeSourceMaterials: false,
        });
        mapsRef.current.push(gradientMap);

        const group = new THREE.Group();
        group.add(model);
        group.userData.petId = pet.id;
        group.userData.projectId = pet.projectId;
        group.position.set(startX, 0, startZ);
        scene.add(group);

        const shadowGeometry = new THREE.CircleGeometry(0.28, 24);
        const shadowMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
        });
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(startX, 0.012, startZ);
        shadow.scale.set(1.2, 0.7, 1);
        scene.add(shadow);

        statesRef.current.push({
          pet,
          group,
          shadow,
          x: startX,
          z: startZ,
          targetX: (Math.random() * 2 - 1) * BOUNDS.x,
          targetZ: (Math.random() * 2 - 1) * BOUNDS.z,
          speed: 0.35 + Math.random() * 0.4,
          pauseUntil: performance.now() + Math.random() * 1400,
          phase: Math.random() * Math.PI * 2,
          yaw: 0,
          moving: false,
        });
      });

      // Los materiales originales se comparten entre clones; se liberan aquí.
      baseModel.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material.dispose());
      });

      const clock = new THREE.Clock();
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const loop = () => {
        if (cancelledRef.current) return;
        rafRef.current = requestAnimationFrame(loop);
        if (pausedRef.current) return;

        const delta = Math.min(clock.getDelta(), 0.05);
        const now = performance.now();

        for (const state of statesRef.current) {
          if (now < state.pauseUntil) {
            state.moving = false;
            state.group.position.y = 0;
            state.shadow.position.set(state.x, 0.012, state.z);
            continue;
          }

          const dx = state.targetX - state.x;
          const dz = state.targetZ - state.z;
          const distance = Math.hypot(dx, dz);

          if (distance < 0.08) {
            state.targetX = (Math.random() * 2 - 1) * BOUNDS.x;
            state.targetZ = (Math.random() * 2 - 1) * BOUNDS.z;
            state.pauseUntil = now + 700 + Math.random() * 2400;
            state.moving = false;
            continue;
          }

          const directionX = dx / distance;
          const directionZ = dz / distance;
          let nextX = state.x + directionX * state.speed * delta;
          let nextZ = state.z + directionZ * state.speed * delta;

          for (const other of statesRef.current) {
            if (other === state) continue;
            const sepX = nextX - other.x;
            const sepZ = nextZ - other.z;
            const sep = Math.hypot(sepX, sepZ);
            if (sep > 0.001 && sep < 0.58) {
              const push = (0.58 - sep) / 0.58;
              nextX += (sepX / sep) * push * 0.035;
              nextZ += (sepZ / sep) * push * 0.035;
            }
          }

          state.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, nextX));
          state.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, nextZ));
          state.moving = true;

          const targetYaw = Math.atan2(-directionZ, directionX);
          state.yaw = lerpAngle(state.yaw, targetYaw, delta * 10);

          const bob = Math.abs(Math.sin(clock.elapsedTime * 6 + state.phase)) * 0.035;
          state.group.position.set(state.x, bob, state.z);
          state.group.rotation.y = state.yaw;
          state.group.rotation.z = Math.sin(clock.elapsedTime * 6 + state.phase) * 0.025;
          state.shadow.position.set(state.x, 0.012, state.z);
          state.shadow.scale.set(1.2 - bob * 1.5, 0.7 - bob, 1);
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      rafRef.current = requestAnimationFrame(loop);

      // Expone el raycast al handler de toque.
      raycastRef.current = (nx: number, ny: number) => {
        pointer.set(nx * 2 - 1, -(ny * 2 - 1));
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(
          statesRef.current.map((state) => state.group),
          true
        );
        if (hits.length === 0) return;
        let object: THREE.Object3D | null = hits[0].object;
        while (object && object.userData.petId == null) {
          object = object.parent;
        }
        if (!object) return;
        const state = statesRef.current.find((item) => item.pet.id === object?.userData.petId);
        if (state) onSelectRef.current(state.pet);
      };
    },
    [background, pets]
  );

  const onTap = useCallback((nx: number, ny: number) => {
    raycastRef.current?.(nx, ny);
  }, []);

  return { onContextCreate, cleanup, onTap };
}
