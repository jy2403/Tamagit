# dict_styles.md - Diccionario de estilos de Tamagit

Estilo visual de la app, descrito en tres dimensiones: la **marca** (quién es el
proyecto), la **paleta** (los colores que lo visten) y la **tipografía** (cómo
habla). La tabla es un diccionario máquina-de-consulta de las constantes
definidas en `src/estilos/index.ts`.

---

## marca

Identidad de marca del proyecto. Tamagit es el nombre oficial de la app y el
wordmark que aparece en la intro animada, el splash, la autenticación y las
cabeceras. El logotipo (`assets/logo.jpeg`) se emplea como imagen de referencia
en IntroAnimation, splash y la pantalla de bienvenida, siempre renderizado con
`resizeMode: contain` y un tamaño de referencia de 96x96. El proyecto tiene una
estética retro de consola, y en toda cabecera se refuerza el nombre para que el
usuario siempre sepa dónde está.

| Clave     | Valor                          | Uso |
| --------- | ------------------------------ | --- |
| `nombre`  | `Tamagit`                      | wordmark, splash, auth, cabeceras |
| `logo`    | `assets/logo.jpeg`             | IntroAnimation, splash, bienvenida |
| `tamano`  | `96x96` (`resizeMode: contain`) | dimensión de referencia del logo en IntroAnimation |

---

## paleta (esquema de colores)

La paleta está construida sobre una base oscura casi negra (`#0a0a0a`,
`bg-neutral-950`) que da protagonismo al contenido, con tarjetas en un gris muy
oscuro (`#171717`) y bordes sutiles en escala de neutrales. Sobre ese fondo
oscuro, el verde esmeralda actúa como acento de acción: el verde `#059669`
(`emerald-600`) marca el botón principal, mientras que sus variantes más claras
(`#34d399` y `#6ee7b7`) se usan para enlaces, textos de éxito y badges. El rojo
se reserva únicamente para errores y acciones destructivas (botones de peligro,
mensajes de error). Esta combinación de neutros oscuros con un único acento
verde mantiene una estética coherente y legible en toda la app.

Los valores de la tabla se derivan del uso real en `src/estilos/index.ts` e
`IntroAnimation.tsx`. El fondo del overlay de intro usa `#0f0f0f`; el resto son
equivalentes Tailwind.

| Rol             | Clase Tailwind        | Hex      | Componentes |
| --------------- | --------------------- | -------- | ----------- |
| fondo pantalla  | `bg-neutral-950`      | `#0a0a0a`| pantalla.root, formulario.input |
| fondo intro     | (estilo inline)       | `#0f0f0f`| IntroAnimation |
| fondo tarjeta   | `bg-neutral-900`      | `#171717`| tarjeta, lista, modal, confirmar |
| fondo acento    | `bg-white/10`         | `rgba(255,255,255,0.10)` | boton.secundario, lista.icono |
| borde           | `border-neutral-800/700` | `#262626` / `#404040` | tarjeta, formulario, lista |
| texto primario  | `text-white`          | `#ffffff`| tipografia.titulo |
| texto cuerpo    | `text-neutral-300`    | `#d4d4d4`| tipografia.cuerpo |
| texto secundario| `text-neutral-400`    | `#a3a3a3`| tipografia.subtitulo, etiqueta |
| texto silenciado| `text-neutral-500`    | `#737373`| tipografia.muted, hint |
| acento primario | `bg-emerald-600`      | `#059669`| boton.primario |
| acento texto    | `text-emerald-400`    | `#34d399`| tipografia.enlace, boton.textoFantasma |
| acento suave    | `text-emerald-300`    | `#6ee7b7`| mensajes.exito.texto, lista.pillAcentoTexto |
| fondo exito     | `bg-emerald-950`      | `#022c22`| mensajes.exito.bloque |
| peligro fondo   | `bg-red-600`          | `#dc2626`| boton.peligro |
| peligro texto   | `text-red-400`        | `#f87171`| tipografia.error |
| fondo error     | `bg-red-950`          | `#450a0a`| mensajes.error.bloque |
| overlay         | `bg-black/70`         | `rgba(0,0,0,0.70)` | modal, confirmar |

---

## tipografia

La tipografía refuerza la identidad retro de la marca: la fuente pixelada
`PressStart2P` se reserva para el wordmark `Tamagit` en la intro, índice y
splash, dándole carácter de videojuego. El resto del texto sigue una jerarquía
funcional: los títulos son grandes, blancos y en negrita (`text-2xl font-bold
text-white`); las secciones usan un tamaño intermedio; y los subtítulos,
etiquetas, cuerpo y avisos degradan progresivamente en tamaño y luminosidad
hasta el gris silenciado para hints. El verde claro distingue los enlaces del
texto común, y el rojo queda reservado para errores. Esa jerarquía permite
escanear la pantalla de un vistazo: primero el título, luego el subtítulo y por
último el resto del contenido.

| Clave             | Clases                                     | Uso |
| ----------------- | ------------------------------------------ | --- |
| `marca`           | `fontFamily: 'PressStart2P_400Regular'`   | IntroAnimation, index, splash (fuente retro del wordmark Tamagit) |
| `titulo`          | `flex-1 text-2xl font-bold text-white`     | admin, projects, profile, project/[id], AdminCrudList, users, users/[id], pets/[petId] |
| `tituloCentrado`  | `text-2xl font-bold text-white`            | (sin uso) |
| `seccion`         | `text-lg font-semibold text-white`         | ReasonPrompt, AdminCrudList |
| `subtitulo`       | `text-sm text-neutral-400`                 | admin, profile, AdminCrudList, users, users/[id], pets/[petId] |
| `etiqueta`        | `text-sm font-medium text-neutral-400`     | (sin uso; usar `formulario.etiqueta`) |
| `cuerpo`          | `text-sm text-neutral-300`                 | projects |
| `muted`           | `text-sm text-neutral-500`                 | projects, project/[id] |
| `error`           | `text-sm text-red-400`                     | projects, profile, project/[id], AdminCrudList, users |
| `hint`            | `text-xs text-neutral-500`                 | projects, project/[id] |
| `enlace`          | `text-emerald-400`                         | admin, projects, profile, project/[id], AdminCrudList, users/[id], pets/[petId] |