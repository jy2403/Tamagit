# TamaGit - Frontend (app movil)

Aplicacion movil **Expo / React Native** (Expo Router + NativeWind/Tailwind) de
TamaGit, un Tamagotchi para desarrolladores: sincroniza tus repositorios de GitHub
y crea una mascota por cada proyecto.

## Despliegue (importante)

El backend **ya esta desplegado en Vercel** y funcionando:

https://tama-git-backend.vercel.app

Para usar la app **no hace falta levantar ni volver a desplegar el backend**: el
front apunta por defecto a esa URL de produccion. Solo si quieres trabajar sobre el
backend (o probarlo en local) mira `back/README.md`.

- Repo backend: [`JuanmaTheBuilder/TamaGit-Backend`](https://github.com/JuanmaTheBuilder/TamaGit-Backend)
- **Guia de estilos:** [`ESTILOS.md`](./ESTILOS.md)

## Requisitos

- Node.js 20 o superior
- Expo Go en el dispositivo o un emulador Android/iOS

## Puesta en marcha

```bash
npm install
npm start        # o: npx expo start
npx expo start --web
```

Escanea el QR con Expo Go (Android) o la camara (iOS).

### Variables de entorno

| Variable              | Requerida | Descripcion |
| --------------------- | --------- | ----------- |
| `EXPO_PUBLIC_API_URL` | No        | URL del backend. Por defecto apunta a produccion en Vercel. |

```bash
# opcional, para apuntar a un backend local
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Para que la app levante y haga el login con OAuth asegurate de que el backend
tenga configurado `TAMAGIT_DEEP_LINK="tamagit://auth"` y el scheme `tamagit`
(ya esta en `app.json`).

## Login con GitHub

La app no maneja contrasenas: el registro y el inicio de sesion se hacen contra el
backend mediante **GitHub OAuth**. Al abrir la app, "Conectar con GitHub" abre la
ventana de autorizacion; el backend crea/actualiza el usuario en la base y devuelve
un token JWT que la app guarda en `expo-secure-store`. Si el servidor responde con
un error (p. ej. cuenta suspendida), el mensaje se muestra directamente en pantalla.

## Estructura

```
app/                   Pantallas (expo-router)
  index.tsx            Landing / START
  login.tsx, auth.tsx  OAuth con GitHub
  projects.tsx         Lista de proyectos (con busqueda) y tarjetas de mascotas
  project/[id].tsx     Detalle del proyecto: mascota 3D, alimentar/entrenar/CRUD
  profile.tsx          Mi perfil
  admin/               Panel admin: items, comidas, usuarios y mascotas
src/
  components/
    Field.tsx          Campo de formulario con etiqueta, contador y error (ESTILOS.md)
    FeedbackBanner.tsx Toast animado de exito/error (ESTILOS.md)
    ConfirmModal.tsx   Modal de confirmacion para eliminar
    AdminCrudList.tsx  CRUD generico del panel admin (items y comidas)
    Pet3DView.tsx      Mascota 3D low-poly con giro y zoom
    IntroAnimation.tsx Animacion de bienvenida
    ReasonPrompt.tsx   Modal para pedir un motivo (p. ej. al suspender una cuenta)
  layout/Button.tsx    Boton (variantes primary/secondary/ghost, ESTILOS.md)
  estilos/index.ts     Sistema de clases de Tailwind documentado en ESTILOS.md
  context/             AuthContext (sesion, token, errores en pantalla)
  lib/                 api.ts, types.ts, storage.ts, notifications.ts
ESTILOS.md             Sistema de estilos (paleta, contenedores, formularios...)
global.css             Directivas de Tailwind / NativeWind
```

## CRUD completo desde la app (3 entidades)

| Entidad     | Pantalla                                                         | Crear | Buscar | Modificar | Eliminar |
| ----------- | ---------------------------------------------------------------- | ----- | ------ | --------- | -------- |
| **Mascota** | `project/[id].tsx` y tarjetas en `projects.tsx`                  | Si    | Si (busqueda por nombre/proyecto) | Si (nombre, alimentar, entrenar) | Si (con confirmacion) |
| **Item**    | `admin/items.tsx` (componente `AdminCrudList`)                   | Si    | Si (buscar por texto) | Si (datos precargados) | Si (con confirmacion) |
| **Comida**  | `admin/foods.tsx` (componente `AdminCrudList`)                   | Si    | Si (buscar por texto) | Si (datos precargados) | Si (con confirmacion) |

Todas las operaciones se hacen contra el backend; ninguna entidad se maneja solo
en memoria. El formulario de creacion valida campos (requeridos, numeros y maximo
de caracteres), confirma al guardar y muestra toasts de exito/error con diseno
propio (`src/components/FeedbackBanner.tsx`).

## Estilos con Tailwind

Tailwind/NativeWind esta configurado (preset de NativeWind, `content` apuntando a
`app/` y `src/`, directivas en `global.css`, ajustes en `babel.config.js` y
`metro.config.js`). Todas las pantallas usan clases y **las cadenas repetidas viven
en `src/estilos/index.ts`, documentadas en `ESTILOS.md`**; cambiar el tema se hace
ahi, sin reescribir pantallas.

## Scripts

```bash
npm run lint    # eslint + prettier
npm run format  # autocorrige y formatea
npm run web     # modo web
```