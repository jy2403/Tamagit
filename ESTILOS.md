# ESTILOS.md - Sistema de diseño "clay" de Tamagit

Toda la app (Inicio, Perfil, detalle de mascota **y el panel de administrador**) usa
el mismo sistema visual: superficies "clay" con degradado, brillo y sombra suave sobre
un fondo claro rosado. Los tokens viven en `src/estilos/index.ts` y los componentes en
`src/components/clay/`. **No se usan clases de Tailwind/NativeWind en pantallas nuevas**:
se estila con `style` y los tokens.

> Regla: si un bloque visual se repite tres veces o mas, se extrae a un componente en
> `src/components/clay/` (asi nacieron `ClayHeader`, `ClayRow`, `ClayField` y `ClayStates`).

---

## Tokens (`src/estilos/index.ts`)

| Token | Contenido |
| ----- | --------- |
| `paleta` | `menta`, `malva`, `rosa`, `fucsia`, `vino` (cada una con `base`, `claro`, `oscuro`) |
| `clay` | Degradados `[arriba, abajo]` y colores de texto: `fondo`, `fondoClaro`, `blanco`, `vino`/`negro`, `fucsia`, `rosa`, `malva`, `menta`, `verde` (exito), `rojo` (error/peligro), `ambar` (rol admin), `violeta`, `texto`, `textoSuave`, `textoTenue`, `textoClaro`, `borde` |
| `radios` | `tarjeta` 26, `tarjetaGrande` 30, `boton` 22, `chip` 18, `input` 18, `pastilla` 999 |
| `sombras` | `tarjeta`, `boton`, `suave`, `hundido` (se aplican a un `View` **exterior**, nunca dentro de `ClaySurface`) |
| `fuentes` | `pixel` (PressStart2P) solo para marca y titulos de hoja; el cuerpo usa la fuente del sistema |
| `textoClay` | `titulo` 22, `subtitulo` 15, `cuerpo` 13, `etiqueta` 11, `micro` 9 |

Tipografia habitual: titulos 18-19 / peso 900, nombres 13-16 / 900, etiquetas y botones
11-14 / 800, texto secundario 10-12 en `clay.textoSuave`, "eyebrow" de seccion 10 / 900 /
`letterSpacing 1.2` / mayusculas en `clay.textoTenue`.

---

## Componentes (`src/components/clay/`)

| Componente | Para que sirve |
| ---------- | -------------- |
| `ClayBackground` | Raiz de toda pantalla (degradado + circulos decorativos) |
| `ClaySurface` | Bloque base: degradado, brillo, `border`, `shadow`, `radius` |
| `ClayHeader` | Cabecera de pantalla secundaria: flecha atras + titulo + subtitulo + `right` opcional |
| `ClayButton` | Boton (`colors`, `size="md"\|"lg"`, `pixel`). Primario `clay.fucsia`, exito `clay.verde`, secundario `clay.blanco`, peligro `clay.rojo` |
| `ClayIconButton` | Boton circular con icono (`accessibilityLabel` obligatorio) |
| `ClayPill` | Pastilla de estado (`clay.vino`, `clay.ambar`, `clay.rojo`, `clay.fondoClaro`) |
| `ClayInput` / `ClayField` | Input suelto / input con etiqueta, `*` requerido, contador y error |
| `ClayRow` | Fila de lista: icono, titulo, subtitulo, `children`, `right`, `footer` (acciones) y `onPress` |
| `ClayStates` | `ClayLoadingScreen`, `ClayForbiddenScreen`, `ClayEmptyState`, `ClayErrorState` |
| `IconoImagen` | Iconos SVG vectoriales (`vida`, `hambre`, `perchero`, `usuario`, `engranaje`...) |

Compartidos fuera de `clay/`: `FeedbackBanner` (toast exito/error), `ConfirmModal`
(confirmacion centrada), `ReasonPrompt` (confirmacion con motivo).

---

## Receta de una pantalla

```tsx
const insets = useSafeAreaInsets();
const authStatus = useRequireAuth({ admin: true });      // pantallas de admin

if (authStatus === 'loading') return <ClayLoadingScreen />;
if (authStatus === 'anonymous') return <Redirect href="/login" />;
if (authStatus === 'forbidden') return <ClayForbiddenScreen title="Titulo" />;

return (
  <ClayBackground>
    <ClayHeader title="Titulo" subtitle="Subtitulo" />
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom + 24, 36),
        gap: 12,
      }}
      /* renderItem -> <ClayRow ... /> */
    />
  </ClayBackground>
);
```

- Tarjetas: `<View style={sombras.tarjeta}><ClaySurface colors={clay.blanco} radius={radios.tarjetaGrande} border contentStyle={{ padding: 16 }}>`.
- Hojas inferiores (selectores): `Modal slide` + `ClaySurface colors={clay.fondoClaro}` como en `EquipMenu` y en el selector de items de `adminPetDetailScreen`.
- Acciones destructivas: `ClayButton colors={clay.rojo}` + `ConfirmModal` o `ReasonPrompt`.
- Accesibilidad: `accessibilityRole="button"` y `accessibilityLabel` en todo `Pressable`.

---

## Estilos heredados

Solo quedan dos grupos NativeWind en `src/estilos/index.ts`: `pantalla.root` (usado por
`authScreen`) y `tipografia.hint` (usado por `StatBar`). No deben usarse en pantallas nuevas.
