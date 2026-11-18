// Clases NativeWind que aún usan authScreen y StatBar (fuera del sistema clay).
export const pantalla = {
  root: 'flex-1 bg-neutral-950',
} as const;

export const tipografia = {
  hint: 'text-xs text-neutral-500',
} as const;

export type Gradiente = readonly [string, string];

/**
 * Tokens del rediseño claymorfista.
 * Toda la paleta se construye a partir de:
 * - menta: #84C1B1
 * - malva: #AD849A
 * - rosa: #D64783
 * - fucsia: #FD135A
 * - vino: #40202A
 */
export const paleta = {
  menta: {
    base: '#84C1B1',
    claro: '#A6D5C9',
    oscuro: '#5EA291',
    fondoSuave: '#F1F8F6',
  },
  malva: {
    base: '#AD849A',
    claro: '#C7A7B7',
    oscuro: '#8E647A',
    fondoSuave: '#F7F2F5',
  },
  rosa: {
    base: '#D64783',
    claro: '#E471A1',
    oscuro: '#B73169',
  },
  fucsia: {
    base: '#FD135A',
    claro: '#FE4B82',
    oscuro: '#D40645',
  },
  vino: {
    base: '#40202A',
    claro: '#5A2F3D',
    oscuro: '#2B141B',
  },
} as const;

export const clay = {
  // Fondos derivados de la paleta (muy claros con tinte malva/menta, no gris neutro)
  fondo: ['#F9F4F6', '#EDE1E7'] as Gradiente,
  fondoClaro: ['#FFFFFF', '#F6EFF3'] as Gradiente,
  blanco: ['#FFFFFF', '#F2ECEF'] as Gradiente,

  // Vino reemplaza al negro puro (#000, #2A2A2E)
  vino: [paleta.vino.claro, paleta.vino.oscuro] as Gradiente,
  negro: [paleta.vino.claro, paleta.vino.oscuro] as Gradiente, // compatibilidad
  oscuro: paleta.vino.base,
  panelOscuro: ['#4C2734', '#281219'] as Gradiente,

  // Textos
  texto: paleta.vino.base,
  textoSuave: paleta.malva.base,
  textoTenue: '#9C7A8B',
  textoClaro: '#FFFFFF',
  borde: '#E2D4DC',

  // Colores principales de la paleta
  fucsia: [paleta.fucsia.claro, paleta.fucsia.oscuro] as Gradiente,
  rosa: [paleta.rosa.claro, paleta.rosa.oscuro] as Gradiente,
  malva: [paleta.malva.claro, paleta.malva.oscuro] as Gradiente,
  menta: [paleta.menta.claro, paleta.menta.oscuro] as Gradiente,

  // Mezclas requeridas para los 7 días
  mentaMalva: ['#A2BFB6', '#7F8E8C'] as Gradiente,
  rosaMalva: ['#D67499', '#AC577B'] as Gradiente,

  // Alias retrocompatibles mapeados a la paleta claymorfista
  rojo: [paleta.fucsia.claro, paleta.fucsia.oscuro] as Gradiente,
  naranja: [paleta.rosa.claro, paleta.rosa.oscuro] as Gradiente,
  ambar: ['#F59D77', '#DE6D43'] as Gradiente,
  verde: [paleta.menta.claro, paleta.menta.oscuro] as Gradiente,
  violeta: [paleta.malva.claro, paleta.malva.oscuro] as Gradiente,
  turquesa: [paleta.menta.claro, paleta.menta.oscuro] as Gradiente,
  azul: ['#8BA7CE', '#6480B0'] as Gradiente,
  amarillo: ['#F6D090', '#DE9C45'] as Gradiente,
  lila: [paleta.malva.claro, paleta.malva.oscuro] as Gradiente,

  // Sombra teñida con vino a baja opacidad
  sombra: 'rgba(64, 32, 42, 0.28)',
} as const;

export const radios = {
  tarjeta: 26,
  tarjetaGrande: 30,
  boton: 22,
  chip: 18,
  pastilla: 999,
  input: 18,
} as const;

export const sombras = {
  tarjeta: {
    shadowColor: paleta.vino.base,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  boton: {
    shadowColor: paleta.vino.base,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  suave: {
    shadowColor: paleta.vino.base,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  hundido: {
    shadowColor: paleta.vino.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;

export const fuentes = {
  pixel: 'PressStart2P_400Regular',
  cuerpo: undefined,
} as const;

export const textoClay = {
  titulo: 22,
  subtitulo: 15,
  cuerpo: 13,
  etiqueta: 11,
  micro: 9,
} as const;

export type DiaSemana = {
  indice: number;
  inicial: string;
  nombre: string;
  gradiente: Gradiente;
  textoSobre: string;
};

/**
 * Orden visual de la semana (Lunes a Domingo) con la nueva paleta:
 * L fucsia, M rosa, X malva, J menta, V vino, S menta+malva, D rosa+malva.
 * Contraste verificado (>= 4.5:1).
 */
export const SEMANA: readonly DiaSemana[] = [
  { indice: 1, inicial: 'L', nombre: 'Lunes', gradiente: clay.fucsia, textoSobre: '#FFFFFF' },
  { indice: 2, inicial: 'M', nombre: 'Martes', gradiente: clay.rosa, textoSobre: '#FFFFFF' },
  { indice: 3, inicial: 'X', nombre: 'Miércoles', gradiente: clay.malva, textoSobre: '#FFFFFF' },
  { indice: 4, inicial: 'J', nombre: 'Jueves', gradiente: clay.menta, textoSobre: paleta.vino.base },
  { indice: 5, inicial: 'V', nombre: 'Viernes', gradiente: clay.vino, textoSobre: '#FFFFFF' },
  { indice: 6, inicial: 'S', nombre: 'Sábado', gradiente: clay.mentaMalva, textoSobre: '#FFFFFF' },
  { indice: 0, inicial: 'D', nombre: 'Domingo', gradiente: clay.rosaMalva, textoSobre: '#FFFFFF' },
] as const;

export function indiceSemana(fecha: Date): number {
  return (fecha.getDay() + 6) % 7;
}

export function diaSemana(fecha: Date): DiaSemana {
  return SEMANA[indiceSemana(fecha)];
}

export type ColorMascota = {
  nombre: string;
  hex: string;
  gradiente: Gradiente;
};

export const COLORES_MASCOTA: readonly ColorMascota[] = [
  { nombre: 'Menta', hex: paleta.menta.base, gradiente: clay.menta },
  { nombre: 'Rosa', hex: paleta.rosa.base, gradiente: clay.rosa },
  { nombre: 'Fucsia', hex: paleta.fucsia.base, gradiente: clay.fucsia },
  { nombre: 'Malva', hex: paleta.malva.base, gradiente: clay.malva },
  { nombre: 'Vino', hex: paleta.vino.base, gradiente: clay.vino },
  { nombre: 'Pastel', hex: '#A2BFB6', gradiente: clay.mentaMalva },
  { nombre: 'Berry', hex: '#D67499', gradiente: clay.rosaMalva },
  { nombre: 'Blanco', hex: '#FFFFFF', gradiente: clay.blanco },
] as const;

export function colorMascotaPorId(id: number): ColorMascota {
  return COLORES_MASCOTA[Math.abs(id) % COLORES_MASCOTA.length];
}

export function tonoPorHex(hex: string | null | undefined): Gradiente {
  if (!hex) return clay.blanco;
  const encontrado = COLORES_MASCOTA.find((color) => color.hex.toLowerCase() === hex.toLowerCase());
  return encontrado?.gradiente ?? ([hex, hex] as Gradiente);
}

export const colorStats = {
  health: paleta.menta.base,
  hunger: paleta.fucsia.base,
  happiness: paleta.rosa.base,
} as const;
