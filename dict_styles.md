# dict_styles.md - Diccionario de estilos de Tamagit

Diccionario de consulta de los tokens definidos en `src/estilos/index.ts` (sistema
"clay"). La guia de uso y la receta de pantallas estan en `ESTILOS.md`.

---

## marca

Tamagit es el nombre oficial y el wordmark de la app (pantalla de inicio, login y
cabeceras). La estetica es retro de consola con acabado claymorfista: superficies suaves
con brillo, esquinas muy redondeadas y la fuente pixel `PressStart2P` reservada para la
marca y los titulos de hojas.

---

## paleta (`paleta`)

| Clave | `base` | Uso |
| ----- | ------ | --- |
| `menta` | `#84C1B1` | exito, "Guardar", acciones positivas |
| `malva` | `#AD849A` | texto suave, acentos secundarios |
| `rosa` | `#D64783` | acentos, naranja de graficas |
| `fucsia` | `#FD135A` | CTA principal, peligro/error, spinners |
| `vino` | `#40202A` | texto principal, pastillas oscuras, sombras |

Cada color tiene `claro` y `oscuro` para construir degradados `[arriba, abajo]`.

## colores y degradados (`clay`)

| Clave | Uso |
| ----- | --- |
| `fondo` / `fondoClaro` | fondo de pantalla / inputs, chips inactivos y hojas inferiores |
| `blanco` | tarjetas y filas estandar |
| `vino` (`negro`) | pastillas y chips activos |
| `fucsia`, `rosa`, `malva`, `menta` | botones y acentos |
| `verde` | exito y CTA de crear/guardar |
| `rojo` | error, peligro y destructivos |
| `ambar` | pastilla de rol Admin |
| `texto`, `textoSuave`, `textoTenue`, `textoClaro`, `borde`, `oscuro` | colores de texto y bordes |

## forma y relieve

| Token | Valores |
| ----- | ------- |
| `radios` | `tarjeta` 26, `tarjetaGrande` 30, `boton` 22, `chip` 18, `input` 18, `pastilla` 999 |
| `sombras` | `tarjeta`, `boton`, `suave`, `hundido` (en el `View` exterior) |

## tipografia

| Token | Valor | Uso |
| ----- | ----- | --- |
| `fuentes.pixel` | `PressStart2P_400Regular` | marca, titulos de hoja, botones de marca |
| `textoClay` | `titulo` 22, `subtitulo` 15, `cuerpo` 13, `etiqueta` 11, `micro` 9 | modales y hojas |
| titulo de pantalla | 18 / peso 900 / `clay.texto` | `ClayHeader` |
| subtitulo de pantalla | 10 / `clay.textoSuave` | `ClayHeader` |
| eyebrow de seccion | 10 / 900 / `letterSpacing 1.2` / mayusculas / `clay.textoTenue` | agrupar contenido |
