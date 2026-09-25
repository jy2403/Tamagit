# ESTILOS.md - Sistema de clases de Tamagit

Este documento es la referencia oficial de las cadenas de clases de Tailwind
(NativeWind) que usa la aplicacion. Todas las combinaciones que se repiten **3 veces
o mas** estan centralizadas en `src/estilos/index.ts` y **los componentes las
importan de ahi**, en lugar de repetir la cadena a mano.

> **Regla obligatoria del entregable:** si una combinacion de clases se repite tres
> veces o mas, se convierte en una constante en `src/estilos/index.ts` o en un
> componente en `src/components/`.

---

## Paleta

| Rol                  | Clase                                    |
| -------------------- | ---------------------------------------- |
| Fondo de la app      | `bg-neutral-950`                         |
| Superficie / tarjeta | `bg-neutral-900 border-neutral-800`      |
| Campo de formulario  | `bg-neutral-950 border-neutral-700`      |
| Acento principal     | `bg-emerald-600` / `text-emerald-400`    |
| Acento oscuro pill   | `bg-emerald-900/60 text-emerald-300`     |
| Texto blanco         | `text-white`                             |
| Texto secundario     | `text-neutral-400` / `text-neutral-500`  |
| Peligro / error      | `text-red-400` / `bg-red-500/10`         |

---

## Contenedores de pantalla

Cada pantalla parte de `pantalla.root` (`flex-1 bg-neutral-950`) y el encabezado
con flecha "Atras" usa `pantalla.header` (`flex-row items-center px-5 pb-3 pt-16`).

```ts
pantalla.root        // flex-1 bg-neutral-950
pantalla.rootCentered// flex-1 items-center justify-center bg-neutral-950
pantalla.header      // flex-row items-center px-5 pb-3 pt-16
pantalla.contenido   // { padding: 16, gap: 20 }
```

---

## Tipografia

| Uso               | Clave             | Clases                                |
| ----------------- | ----------------- | ------------------------------------- |
| Titulo de pantalla | `tipografia.titulo` | `flex-1 text-2xl font-bold text-white` |
| Titulo de seccion | `tipografia.seccion` | `text-lg font-semibold text-white`    |
| Subtitulo         | `tipografia.subtitulo` | `text-sm text-neutral-400`         |
| Etiqueta de campo | `formulario.etiqueta` | `text-sm font-medium text-neutral-400` |
| Cuerpo            | `tipografia.cuerpo` | `text-sm text-neutral-300`           |
| Texto atenuado    | `tipografia.muted`  | `text-sm text-neutral-500`           |
| Enlace / acento   | `tipografia.enlace` | `text-emerald-400`                   |
| Error inline      | `mensajesError.inline` | `text-sm text-red-400`             |
| Pista / extra     | `tipografia.hint`   | `text-xs text-neutral-500`           |

---

## Tarjetas

```ts
tarjeta.base        // rounded-2xl border border-neutral-800 bg-neutral-900 p-4
tarjeta.grande      // rounded-2xl border border-neutral-800 bg-neutral-900 p-5
tarjeta.fila        // flex-row items-center rounded-xl border border-neutral-800 bg-neutral-900 p-3
tarjeta.presionable // ... p-4 active:bg-neutral-800 (Pressable)
```

### Tarjeta de mascota (carrusel horizontal)

```ts
mascota.tarjeta     // overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900
mascota.escena      // w-full overflow-hidden rounded-t-2xl (acata 3:2 via aspectRatio)
mascota.rotulo      // px-3 pb-3 pt-2
mascota.nombre      // text-sm font-semibold text-white
```

Las tarjetas muestran solo la cabeza 3D (low-poly, `Pet3DView simple`) en
proporcion **3:2** y en fila horizontal con scroll. Se tocan para ir al detalle.

---

## Botones

`Button` (`src/layout/Button.tsx`) ya es el componente de boton y obtiene sus
clases de `src/estilos/index.ts`.

| Variante   | Clave        | Clases                                 |
| ---------- | ------------ | -------------------------------------- |
| _primary_  | `boton.primario` | `bg-emerald-600 active:bg-emerald-700` |
| _secondary_| `boton.secundario` | `bg-white/10 active:bg-white/20`   |
| _ghost_    | `boton.fantasma` | `bg-transparent` + texto `text-emerald-400` |

Botones de accion en el encabezado (Admin, Perfil, Salir): `boton.enlace`.

---

## Listas

```ts
lista.fila            // fila de lista: flex-row ... p-3
lista.icono           // mr-3 h-11 w-11 ... rounded-full bg-white/10
lista.pill            // rounded-full bg-neutral-800 px-2.5 py-1
lista.pillTexto       // text-xs text-neutral-300
lista.pillAcento      // rounded-full bg-emerald-900/60 px-2.5 py-1
lista.pillAcentoTexto // text-xs font-medium text-emerald-300
lista.vacio           // mensaje de lista vacia
```

---

## Formularios

```ts
formulario.input       // input estandar (rounded-xl border-neutral-700 bg-neutral-950 ...)
formulario.textarea    // area de texto multilinea (ReasonPrompt)
formulario.busqueda    // input de busqueda de las listas (barra superior)
formulario.etiqueta    // label de campo
formulario.contador    // contador "x/max" del campo
formulario.error       // error de validacion del campo (text-xs text-red-400)
formulario.requerido   // asterisco rojo
```

---

## Mensajes y toasts

Los errores del servidor se muestran en pantalla (nunca en consola). `AuthContext`
guarda el error en `authError` y las pantallas lo pintan con `mensajesError`.

```ts
mensajesError.bloque  // rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400
mensajesError.inline  // text-sm text-red-400
```

Feedback de acciones (crear, guardar, eliminar) via toast animado con
`FeedbackBanner` (`src/components/FeedbackBanner.tsx`): banner inferior con animacion
de entrada/salida que se oculta solo al cabo de ~2 segundos.

```ts
mensajes.exito.bloque // flex-row items-center gap-2.5 rounded-2xl border-emerald-700 bg-emerald-950/90
mensajes.exito.icono  // text-lg font-bold text-emerald-400 (check)
mensajes.exito.texto  // flex-1 text-sm text-emerald-300
mensajes.error.bloque // igual que exito pero con border-red-800 / bg-red-950/90
mensajes.error.icono  // text-lg font-bold text-red-400 (!)
mensajes.error.texto  // flex-1 text-sm text-red-300
```

---

## Modales

```ts
modal.overlay         // flex-1 items-center justify-center bg-black/70 px-6
modal.fondo           // w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-5
modal.overlayInferior // flex-1 justify-end bg-black/70 (bottom sheet)
modal.fondoInferior   // max-h-[70%] rounded-t-2xl ...
```

---

## Reglas de uso

1. Importa desde `@/estilos` (alias de `src/estilos`): `import { tarjeta, tipografia } from '@/estilos';`
2. Si necesitas una combinacion nueva que se usara en 3+ lugares, agregala aqui
   (y a este documento) antes de usarla.
3. Si un bloque de UI completo se repite (etiqueta + campo + error, tarjeta de
   lista, toast de feedback, etc.), extrae un componente en `src/components/` o
   `src/layout/`.
4. Los colores se pueden cambiar despues tocando unicamente estas constantes, sin
   reescribir pantallas.