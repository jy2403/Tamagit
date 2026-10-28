export const colores = {
  acento: '#10b981',
} as const;

export const pantalla = {
  root: 'flex-1 bg-neutral-950',
  rootCentered: 'flex-1 items-center justify-center bg-neutral-950',
  header: 'flex-row items-center px-5 pb-3 pt-16',
  contenido: { padding: 16, gap: 20 },
} as const;

export const tipografia = {
  titulo: 'flex-1 text-2xl font-bold text-white',
  tituloCentrado: 'text-2xl font-bold text-white',
  seccion: 'text-lg font-semibold text-white',
  subtitulo: 'text-sm text-neutral-400',
  etiqueta: 'text-sm font-medium text-neutral-400',
  cuerpo: 'text-sm text-neutral-300',
  muted: 'text-sm text-neutral-500',
  error: 'text-sm text-red-400',
  hint: 'text-xs text-neutral-500',
  enlace: 'text-emerald-400',
} as const;

export const tarjeta = {
  base: 'rounded-2xl border border-neutral-800 bg-neutral-900 p-4',
  grande: 'rounded-2xl border border-neutral-800 bg-neutral-900 p-5',
  fila: 'flex-row items-center rounded-xl border border-neutral-800 bg-neutral-900 p-3',
  presionable: 'rounded-2xl border border-neutral-800 bg-neutral-900 p-4 active:bg-neutral-800',
} as const;

export const boton = {
  base: 'items-center justify-center rounded-xl px-5 py-3',
  primario: 'bg-emerald-600 active:bg-emerald-700',
  secundario: 'bg-white/10 active:bg-white/20',
  fantasma: 'bg-transparent',
  peligro: 'bg-red-600 active:bg-red-700',
  textoPrimario: 'text-white',
  textoSecundario: 'text-white',
  textoFantasma: 'text-emerald-400',
  textoDanger: 'text-white',
  deshabilitado: 'opacity-50',
  enlace: 'rounded-lg px-3 py-2',
} as const;

export const lista = {
  fila: 'mb-2 flex-row items-center rounded-xl border border-neutral-800 bg-neutral-900 p-3',
  icono: 'mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/10',
  pill: 'rounded-full bg-neutral-800 px-2.5 py-1',
  pillTexto: 'text-xs text-neutral-300',
  pillAcento: 'rounded-full bg-emerald-900/60 px-2.5 py-1',
  pillAcentoTexto: 'text-xs font-medium text-emerald-300',
  vacio: 'py-8 text-center text-sm text-neutral-500',
} as const;

export const formulario = {
  filaEtiqueta: 'flex-row items-center justify-between',
  etiqueta: 'text-sm font-medium text-neutral-400',
  requerido: 'text-red-400',
  contador: 'text-xs text-neutral-500',
  input: 'rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white',
  textarea:
    'mt-3 min-h-[80px] rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white',
  busqueda: 'mb-4 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white',
  error: 'text-xs text-red-400',
} as const;

export const mensajesError = {
  bloque: 'rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400',
  inline: 'text-sm text-red-400',
} as const;

export const mensajes = {
  exito: {
    bloque:
      'flex-row items-center gap-2.5 rounded-2xl border border-emerald-700 bg-emerald-950/90 px-4 py-3',
    icono: 'text-lg font-bold text-emerald-400',
    texto: 'flex-1 text-sm text-emerald-300',
  },
  error: {
    bloque:
      'flex-row items-center gap-2.5 rounded-2xl border border-red-800 bg-red-950/90 px-4 py-3',
    icono: 'text-lg font-bold text-red-400',
    texto: 'flex-1 text-sm text-red-300',
  },
} as const;

export const mascota = {
  tarjeta: 'overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900',
  escena: 'w-full overflow-hidden rounded-t-2xl',
  rotulo: 'px-3 pb-3 pt-2',
  nombre: 'text-sm font-semibold text-white',
} as const;

export const modal = {
  overlay: 'flex-1 items-center justify-center bg-black/70 px-6',
  overlayInferior: 'flex-1 justify-end bg-black/70',
  fondo: 'w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-5',
  fondoInferior: 'max-h-[70%] rounded-t-2xl border border-neutral-800 bg-neutral-900 p-4',
} as const;

export const equipar = {
  hoja: 'h-[85%] rounded-t-2xl border border-neutral-800 bg-neutral-900 p-4',
  encabezado: 'mb-1 flex-row items-center justify-between gap-3',
  titulo: 'text-xs text-emerald-300',
  tituloFuente: { fontFamily: 'PressStart2P_400Regular', lineHeight: 20 },
  cerrar: 'h-12 w-12 items-center justify-center rounded-full bg-white/10 active:bg-white/20',
  cerrarTexto: 'text-lg font-semibold text-white',
  subtitulo: 'mb-3 text-xs text-neutral-400',
  huecos: 'flex-row gap-2',
  hueco:
    'min-h-[112px] flex-1 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950 p-2',
  huecoActivo: 'border-emerald-500 bg-emerald-950/50',
  huecoEtiqueta: 'text-[10px] font-semibold uppercase tracking-wide text-neutral-300',
  huecoPreview: 'mt-1 h-10 w-10 items-center justify-center rounded-full bg-white/10',
  huecoImagen: 'h-8 w-8',
  huecoEmoji: 'text-2xl',
  huecoPlaceholder: 'text-2xl text-neutral-400',
  huecoNombre: 'mt-1 text-center text-[11px] font-medium text-white',
  huecoVacio: 'mt-1 text-center text-[11px] text-neutral-400',
  equipado: 'mt-0.5 text-[10px] font-semibold text-emerald-300',
  seccion: 'mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-300',
  filtros: 'flex-row flex-wrap gap-2',
  chip: 'min-h-[48px] justify-center rounded-full border border-neutral-700 bg-neutral-950 px-3 active:bg-neutral-800',
  chipActivo: 'border-emerald-500 bg-emerald-900/60',
  chipTexto: 'text-xs font-medium text-neutral-300',
  chipTextoActivo: 'text-xs font-medium text-emerald-200',
  demo: 'mt-3 flex-row flex-wrap items-center gap-2',
  demoEtiqueta: 'text-[10px] font-semibold uppercase tracking-wide text-neutral-400',
  listaContenedor: 'mt-3 flex-1',
  listaContenido: { gap: 8, paddingBottom: 8 },
  fila: 'min-h-[64px] flex-row items-center rounded-xl border border-neutral-800 bg-neutral-950 p-3 active:bg-neutral-800',
  filaActiva: 'border-emerald-600 bg-emerald-950/40',
  filaImagen: 'mr-3 h-12 w-12 items-center justify-center rounded-full bg-white/10',
  filaImagenImg: 'h-9 w-9',
  filaEmoji: 'text-2xl',
  filaInfo: 'flex-1',
  filaNombre: 'text-sm font-semibold text-white',
  filaSlot: 'text-xs text-neutral-400',
  filaEstado: 'ml-2 items-end',
  estado: 'text-xs font-semibold text-emerald-300',
  accion: 'text-xs font-semibold text-emerald-300',
  estadoBloque: 'items-center gap-2 py-8',
  estadoTexto: 'text-sm text-neutral-300',
  vacioBloque: 'items-center gap-2 rounded-xl border border-dashed border-neutral-700 py-8',
  vacioEmoji: 'text-3xl',
  vacioTitulo: 'text-sm font-semibold text-neutral-200',
  vacioHint: 'px-4 text-center text-xs text-neutral-400',
  resumenTitulo: 'mt-3 text-[10px] font-semibold uppercase tracking-wide text-neutral-400',
  resumen: 'mt-1 flex-row flex-wrap gap-2',
  resumenHueco: 'min-w-[30%] flex-1 rounded-xl border border-neutral-800 bg-neutral-950 p-2',
  resumenEtiqueta: 'text-[10px] font-semibold uppercase tracking-wide text-neutral-400',
  resumenValor: 'mt-0.5 text-xs font-medium text-white',
  resumenVacio: 'mt-0.5 text-xs text-neutral-400',
  botonVestir: { marginTop: 12 },
} as const;

export const confirmar = {
  overlay: 'flex-1 items-center justify-center bg-black/75 px-8',
  fondo: 'w-full items-center rounded-3xl border border-neutral-800 bg-neutral-900 p-6',
  icono: 'h-14 w-14 items-center justify-center rounded-full bg-red-500/10',
  iconoLlave: 'text-2xl font-bold text-red-400',
  titulo: 'mt-4 text-center text-lg font-bold text-white',
  mensaje: 'mt-2 text-center text-sm text-neutral-400',
  acciones: 'mt-6 w-full flex-row gap-3',
} as const;

export type Gradiente = readonly [string, string];

/**
 * Tokens del rediseño claymorfista. Todos los colores, gradientes, radios,
 * sombras y tipografías nuevas viven aquí; las pantallas no deben llevar hex.
 */
export const clay = {
  fondo: ['#F4F4F6', '#B9B9BE'] as Gradiente,
  fondoClaro: ['#FFFFFF', '#E9E9EE'] as Gradiente,
  blanco: ['#FFFFFF', '#E4E4E8'] as Gradiente,
  negro: ['#2A2A2E', '#0B0B0D'] as Gradiente,
  oscuro: '#1A1A1F',
  panelOscuro: ['#26262B', '#141418'] as Gradiente,
  texto: '#242428',
  textoSuave: '#5E5E67',
  textoTenue: '#8A8A93',
  textoClaro: '#FFFFFF',
  borde: '#D6D6DC',
  rojo: ['#E8322B', '#B81408'] as Gradiente,
  naranja: ['#FF7A3D', '#FF4F2E'] as Gradiente,
  ambar: ['#FFB020', '#FF8A1F'] as Gradiente,
  verde: ['#A8D83F', '#4DB848'] as Gradiente,
  violeta: ['#8A4DE8', '#5B2BC9'] as Gradiente,
  turquesa: ['#3FD1C6', '#12A0A8'] as Gradiente,
  rosa: ['#FF7AB8', '#E0408F'] as Gradiente,
  azul: ['#6AA8FF', '#3D6FE8'] as Gradiente,
  amarillo: ['#FFE06A', '#FFC12E'] as Gradiente,
  lila: ['#C9A8FF', '#8A4DE8'] as Gradiente,
  menta: ['#B8F0B0', '#5BCB6B'] as Gradiente,
  sombra: '#5B5B66',
} as const;

export const radios = {
  tarjeta: 28,
  tarjetaGrande: 32,
  boton: 22,
  chip: 18,
  pastilla: 999,
  input: 18,
} as const;

export const sombras = {
  tarjeta: {
    shadowColor: clay.sombra,
    shadowOffset: { width: 6, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
  boton: {
    shadowColor: clay.sombra,
    shadowOffset: { width: 4, height: 7 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
    elevation: 7,
  },
  suave: {
    shadowColor: clay.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  hundido: {
    shadowColor: clay.sombra,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 1,
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

/** Orden visual de la semana (lunes a domingo). */
export const SEMANA: readonly DiaSemana[] = [
  { indice: 1, inicial: 'L', nombre: 'Lunes', gradiente: clay.rojo, textoSobre: '#FFFFFF' },
  { indice: 2, inicial: 'M', nombre: 'Martes', gradiente: clay.naranja, textoSobre: '#1A1A1C' },
  { indice: 3, inicial: 'X', nombre: 'Miércoles', gradiente: clay.ambar, textoSobre: '#1A1A1C' },
  { indice: 4, inicial: 'J', nombre: 'Jueves', gradiente: clay.verde, textoSobre: '#1A1A1C' },
  { indice: 5, inicial: 'V', nombre: 'Viernes', gradiente: clay.violeta, textoSobre: '#FFFFFF' },
  { indice: 6, inicial: 'S', nombre: 'Sábado', gradiente: clay.turquesa, textoSobre: '#1A1A1C' },
  { indice: 0, inicial: 'D', nombre: 'Domingo', gradiente: clay.rosa, textoSobre: '#1A1A1C' },
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
  { nombre: 'Verde', hex: '#5BCB6B', gradiente: clay.verde },
  { nombre: 'Morado', hex: '#8A4DE8', gradiente: clay.violeta },
  { nombre: 'Naranja', hex: '#FF7A3D', gradiente: clay.naranja },
  { nombre: 'Turquesa', hex: '#1EB0B5', gradiente: clay.turquesa },
  { nombre: 'Rosa', hex: '#E0408F', gradiente: clay.rosa },
  { nombre: 'Amarillo', hex: '#FFC12E', gradiente: clay.amarillo },
  { nombre: 'Azul', hex: '#4D7CFE', gradiente: clay.azul },
  { nombre: 'Rojo', hex: '#E8322B', gradiente: clay.rojo },
  { nombre: 'Menta', hex: '#7BD65C', gradiente: clay.menta },
  { nombre: 'Lila', hex: '#B98AFF', gradiente: clay.lila },
  { nombre: 'Negro', hex: '#2A2A2E', gradiente: clay.negro },
  { nombre: 'Gris', hex: '#8E8E96', gradiente: clay.blanco },
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
  health: '#4DB848',
  hunger: '#FF8A1F',
  happiness: '#FFB020',
} as const;
