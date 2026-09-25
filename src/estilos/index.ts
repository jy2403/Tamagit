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
  textarea: 'mt-3 min-h-[80px] rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white',
  busqueda: 'mb-4 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white',
  error: 'text-xs text-red-400',
} as const;

export const mensajesError = {
  bloque: 'rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400',
  inline: 'text-sm text-red-400',
} as const;

export const mensajes = {
  exito: {
    bloque: 'flex-row items-center gap-2.5 rounded-2xl border border-emerald-700 bg-emerald-950/90 px-4 py-3',
    icono: 'text-lg font-bold text-emerald-400',
    texto: 'flex-1 text-sm text-emerald-300',
  },
  error: {
    bloque: 'flex-row items-center gap-2.5 rounded-2xl border border-red-800 bg-red-950/90 px-4 py-3',
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

export const confirmar = {
  overlay: 'flex-1 items-center justify-center bg-black/75 px-8',
  fondo: 'w-full items-center rounded-3xl border border-neutral-800 bg-neutral-900 p-6',
  icono: 'h-14 w-14 items-center justify-center rounded-full bg-red-500/10',
  iconoLlave: 'text-2xl font-bold text-red-400',
  titulo: 'mt-4 text-center text-lg font-bold text-white',
  mensaje: 'mt-2 text-center text-sm text-neutral-400',
  acciones: 'mt-6 w-full flex-row gap-3',
} as const;