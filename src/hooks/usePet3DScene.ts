import { useCallback, useRef } from 'react';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';

if (!(globalThis as { THREE?: unknown }).THREE) {
  (globalThis as { THREE?: unknown }).THREE = THREE;
}

const BODY_DARK = 0x0d9a6e;
const HEAD = 0x45d8a5;
const EYE_WHITE = 0xffffff;
const EYE = 0x1f2937;
const ACCENT = 0xf9a8d4;

type UsePet3DSceneOptions = {
  simple: boolean;
  color: number | string;
  yawRef: React.MutableRefObject<number>;
  distRef: React.MutableRefObject<number>;
};

export function usePet3DScene({ simple, color, yawRef, distRef }: UsePet3DSceneOptions) {
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    meshRef.current = null;
  }, []);

  const onContextCreate = useCallback(
    (gl: ExpoWebGLRenderingContext) => {
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x171717, 1);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        50,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        100
      );
      if (simple) {
        camera.position.set(0, 0.4, 1.35);
        camera.lookAt(0, 0.18, 0);
      } else {
        camera.position.set(0, 0.85, distRef.current);
        camera.lookAt(0, 0.85, 0);
      }

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));

      const key = new THREE.DirectionalLight(0xffffff, 1.1);
      key.position.set(2, 3, 4);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0x7dd3fc, 0.45);
      fill.position.set(-3, 1, -2);
      scene.add(fill);

      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        metalness: 0.08,
      });
      const darkMat = new THREE.MeshStandardMaterial({ color: BODY_DARK, roughness: 0.5 });
      const headMat = new THREE.MeshStandardMaterial({ color: HEAD, roughness: 0.4 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: EYE, roughness: 0.3 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: EYE_WHITE, roughness: 0.2 });
      const accentMat = new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.4 });

      const addBox = (
        parent: THREE.Object3D,
        w: number,
        h: number,
        d: number,
        mat: THREE.Material,
        x: number,
        y: number,
        z: number
      ) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
      };

      const addSphere = (
        parent: THREE.Object3D,
        r: number,
        mat: THREE.Material,
        x: number,
        y: number,
        z: number,
        sx = 1,
        sy = 1,
        sz = 1
      ) => {
        const segW = simple ? 12 : 24;
        const segH = simple ? 10 : 18;
        const geo = new THREE.SphereGeometry(r, segW, segH);
        geo.scale(sx, sy, sz);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
      };

      if (simple) {
        addSphere(group, 0.32, headMat, 0, 1.58, 0, 1, 1.05, 0.95);
        addSphere(group, 0.11, whiteMat, -0.12, 1.64, 0.27, 1, 1.25, 0.55);
        addSphere(group, 0.11, whiteMat, 0.12, 1.64, 0.27, 1, 1.25, 0.55);
        addSphere(group, 0.055, eyeMat, -0.12, 1.63, 0.36, 1, 1.2, 0.6);
        addSphere(group, 0.055, eyeMat, 0.12, 1.63, 0.36, 1, 1.2, 0.6);
        addSphere(group, 0.07, accentMat, -0.23, 1.5, 0.25, 1, 0.7, 0.5);
        addSphere(group, 0.07, accentMat, 0.23, 1.5, 0.25, 1, 0.7, 0.5);
        addSphere(group, 0.1, darkMat, 0, 1.96, 0, 0.7, 1, 0.7);
        group.position.y = -1.74;
        group.rotation.y = -0.55;
      } else {
        addBox(group, 0.24, 0.14, 0.34, darkMat, -0.16, 0.07, 0.03);
        addBox(group, 0.24, 0.14, 0.34, darkMat, 0.16, 0.07, 0.03);
        addBox(group, 0.22, 0.5, 0.24, darkMat, -0.16, 0.38, 0);
        addBox(group, 0.22, 0.5, 0.24, darkMat, 0.16, 0.38, 0);
        addBox(group, 0.56, 0.62, 0.36, bodyMat, 0, 0.94, 0);
        addSphere(group, 0.2, accentMat, 0, 0.94, 0.14, 1, 0.8, 0.6);
        addBox(group, 0.16, 0.58, 0.16, bodyMat, -0.38, 0.94, 0);
        addBox(group, 0.16, 0.58, 0.16, bodyMat, 0.38, 0.94, 0);
        addSphere(group, 0.11, headMat, -0.42, 1.18, 0, 1, 1, 0.8);
        addSphere(group, 0.11, headMat, 0.42, 1.18, 0, 1, 1, 0.8);
        addSphere(group, 0.32, headMat, 0, 1.58, 0, 1, 1.05, 0.95);
        addSphere(group, 0.11, whiteMat, -0.12, 1.64, 0.27, 1, 1.25, 0.55);
        addSphere(group, 0.11, whiteMat, 0.12, 1.64, 0.27, 1, 1.25, 0.55);
        addSphere(group, 0.055, eyeMat, -0.12, 1.63, 0.36, 1, 1.2, 0.6);
        addSphere(group, 0.055, eyeMat, 0.12, 1.63, 0.36, 1, 1.2, 0.6);
        addSphere(group, 0.07, accentMat, -0.23, 1.5, 0.25, 1, 0.7, 0.5);
        addSphere(group, 0.07, accentMat, 0.23, 1.5, 0.25, 1, 0.7, 0.5);
        addSphere(group, 0.1, darkMat, 0, 1.96, 0, 0.7, 1, 0.7);
        addBox(group, 0.08, 0.3, 0.18, accentMat, -0.5, 1.0, -0.05);
        addBox(group, 0.08, 0.3, 0.18, accentMat, 0.5, 1.0, -0.05);
      }

      group.scale.setScalar(1.18);
      scene.add(group);
      meshRef.current = group;

      if (simple) {
        renderer.render(scene, camera);
        gl.endFrameEXP();
      } else {
        const loop = () => {
          yawRef.current += 0.008;
          if (meshRef.current) {
            meshRef.current.rotation.y = yawRef.current;
            meshRef.current.position.y = -0.12;
          }
          camera.position.z = distRef.current;
          renderer.render(scene, camera);
          gl.endFrameEXP();
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      }
    },
    [simple, color, yawRef, distRef]
  );

  return { onContextCreate, cleanup };
}
