import * as THREE from 'three';

export type ToonOutlineOptions = {
  /** Dos tonos del gradiente: [sombra, luz], en el rango 0..1. */
  tones?: [number, number];
  /** Grosor del outline en unidades del mundo. */
  thickness?: number;
  /** Color del outline. */
  outlineColor?: THREE.ColorRepresentation;
  /** Sobrescribe el color por nombre de material (útil si el glb perdió el color). */
  materialColors?: Record<string, THREE.ColorRepresentation>;
  /** Imprime en consola los materiales originales de cada mesh. */
  debug?: boolean;
  /** Libera los materiales originales al terminar (false si se clona el modelo). */
  disposeSourceMaterials?: boolean;
};

const DEFAULTS: Required<ToonOutlineOptions> = {
  tones: [0.35, 1],
  thickness: 0.01,
  outlineColor: 0x000000,
  materialColors: {},
  debug: false,
  disposeSourceMaterials: true,
};

type SourceMaterial = THREE.Material & {
  color?: THREE.Color;
  map?: THREE.Texture | null;
  alphaMap?: THREE.Texture | null;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  emissiveMap?: THREE.Texture | null;
  vertexColors?: boolean;
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * Crea un gradiente de 2 tonos para MeshToonMaterial.
 * Formato RedFormat + NearestFilter = bandas duras sin interpolación.
 */
function createGradientMap(tones: [number, number]) {
  const data = new Uint8Array([
    Math.round(clamp01(tones[0]) * 255),
    Math.round(clamp01(tones[1]) * 255),
  ]);

  const texture = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Convierte un material del glb en MeshToonMaterial conservando su color,
 * textura, vertex colors, transparencia y emisivos. El color base siempre
 * multiplica el resultado, por lo que un material negro se mantiene negro.
 */
function toToonMaterial(
  source: THREE.Material,
  gradientMap: THREE.Texture,
  materialColors: Record<string, THREE.ColorRepresentation>,
  useVertexColors: boolean
) {
  const original = source as SourceMaterial;
  const override = materialColors[source.name];
  const color =
    override !== undefined
      ? new THREE.Color(override)
      : (original.color?.clone() ?? new THREE.Color(0xffffff));

  const map = original.map ?? null;
  if (map) {
    // Los mapas de color base siempre son sRGB.
    map.colorSpace = THREE.SRGBColorSpace;
  }

  return new THREE.MeshToonMaterial({
    name: source.name,
    color,
    gradientMap,
    map,
    vertexColors: useVertexColors,
    alphaMap: original.alphaMap ?? null,
    transparent: source.transparent,
    opacity: source.opacity,
    side: source.side,
    alphaTest: source.alphaTest,
    depthWrite: source.depthWrite,
    emissive: original.emissive?.clone() ?? new THREE.Color(0x000000),
    emissiveIntensity: original.emissiveIntensity ?? 1,
    emissiveMap: original.emissiveMap ?? null,
  });
}

/**
 * Material negro para el "inverted hull". Se renderiza por dentro (BackSide)
 * y desplaza cada vértice a lo largo de su normal en el vertex shader.
 */
function createOutlineMaterial(color: THREE.ColorRepresentation, thickness: number) {
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.BackSide,
  });

  const thicknessUniform = { value: thickness };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.outlineThickness = thicknessUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float outlineThickness;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed += normalize( normal ) * outlineThickness;'
      );
  };

  // Evita compartir caché de programa con otros MeshBasicMaterial.
  material.customProgramCacheKey = () => 'inverted-hull-outline';

  return material;
}

/**
 * Aplica el look toon + outline a todas las mallas del modelo.
 *
 * - Respeta el color, map, vertex colors y emisivos de cada material original.
 * - Reutiliza un solo gradientMap y cachea los MeshToonMaterial por material.
 * - Agrega una copia inflada de cada malla con BackSide para el borde negro.
 * - Es idempotente: si se vuelve a llamar, reemplaza el outline anterior.
 *
 * @param root Escena o grupo del glb.
 * @param options Tonos, grosor, color del borde, overrides y debug.
 */
export function applyToonOutline(root: THREE.Object3D, options: ToonOutlineOptions = {}) {
  const { tones, thickness, outlineColor, materialColors, debug, disposeSourceMaterials } = {
    ...DEFAULTS,
    ...options,
  };

  const gradientMap = createGradientMap(tones);
  const originalMaterials = new Set<THREE.Material>();
  const meshes: THREE.Mesh[] = [];
  const toonCache = new WeakMap<THREE.Material, Map<boolean, THREE.MeshToonMaterial>>();

  const getToonMaterial = (material: THREE.Material, usesVertexColors: boolean) => {
    let variants = toonCache.get(material);
    if (!variants) {
      variants = new Map();
      toonCache.set(material, variants);
    }

    let toon = variants.get(usesVertexColors);
    if (!toon) {
      toon = toToonMaterial(material, gradientMap, materialColors, usesVertexColors);
      variants.set(usesVertexColors, toon);
    }

    return toon;
  };

  root.updateWorldMatrix(true, true);

  // Recolecta las mallas reales (ignora outlines de llamadas anteriores).
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.isOutline || mesh.userData.isToonOutline) return;
    meshes.push(mesh);
  });

  for (const mesh of meshes) {
    const useVertexColors = Boolean(mesh.geometry.getAttribute('color'));

    // Diagnóstico: qué trae realmente el glb antes de tocarlo.
    if (debug) {
      const currentMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      currentMaterials.forEach((material) => {
        const source = material as SourceMaterial;
        const color = source.color ? `#${source.color.getHexString()}` : '#ffffff';
        console.log(
          `[toon] mesh="${mesh.name || '(sin nombre)'}" material="${
            material.name || '(sin nombre)'
          }" color=${color} map=${Boolean(source.map)} vertexColors=${
            Boolean(source.vertexColors) || useVertexColors
          } emissive=${source.emissive ? `#${source.emissive.getHexString()}` : 'n/a'}`
        );
      });
    }

    // Limpia un outline previo para no duplicarlo al recargar.
    for (const child of [...mesh.children]) {
      if (!child.userData.isOutline && !child.userData.isToonOutline) continue;
      mesh.remove(child);
      const outlineMesh = child as THREE.Mesh;
      const outlineMaterials = Array.isArray(outlineMesh.material)
        ? outlineMesh.material
        : [outlineMesh.material];
      outlineMaterials.forEach((material) => material.dispose());
    }

    // 1) Material toon por material original, cacheado para no duplicar.
    const current = mesh.material;
    const toonFor = (material: THREE.Material) => {
      originalMaterials.add(material);
      const usesVertexColors =
        useVertexColors || Boolean((material as SourceMaterial).vertexColors);
      return getToonMaterial(material, usesVertexColors);
    };

    mesh.material = Array.isArray(current) ? current.map(toonFor) : toonFor(current);

    // 2) Inverted hull: grosor en unidades del mundo, compensando el scale
    //    que el modelo tenga aplicado (para no depender de su origen).
    const worldScale = mesh.getWorldScale(new THREE.Vector3());
    const averageScale =
      (Math.abs(worldScale.x) + Math.abs(worldScale.y) + Math.abs(worldScale.z)) / 3 || 1;
    const localThickness = thickness / averageScale;

    if (!mesh.geometry.getAttribute('normal')) {
      mesh.geometry.computeVertexNormals();
    }

    const outlineMaterial = Array.isArray(mesh.material)
      ? mesh.material.map(() => createOutlineMaterial(outlineColor, localThickness))
      : createOutlineMaterial(outlineColor, localThickness);

    const outline = new THREE.Mesh(mesh.geometry, outlineMaterial);
    outline.name = `${mesh.name || 'mesh'}_outline`;
    outline.userData.isOutline = true;
    outline.frustumCulled = false;
    mesh.add(outline);
  }

  // Los materiales originales del glb ya no se usan.
  if (disposeSourceMaterials) {
    originalMaterials.forEach((material) => material.dispose());
  }

  return gradientMap;
}
