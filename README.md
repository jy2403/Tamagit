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
  components/          Button/Field derivados de ESTILOS.md y componentes reutilizables
  estilos/index.ts     Sistema de clases de Tailwind documentado en ESTILOS.md
  context/             AuthContext (sesion, token, errores en pantalla)
  lib/                 api.ts, types.ts, storage.ts, notifications.ts
  layout/Button.tsx    Boton
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

## Cosmeticos (menu "Vestir")

`EquipMenu` / `EquippedStrip` consumen el backend a traves de `useAppearance(petId)`
(`src/hooks/useAppearance.ts`):

| Accion | Endpoint |
| ------ | -------- |
| Catalogo de prendas | `GET /items` |
| Prendas que posee y lleva puestas la mascota | `GET /pets/:id` (`items[].equipped`) |
| Equipar | `POST /pets/:petId/items/:itemId/equip` |
| Desequipar | `POST /pets/:petId/items/:itemId/unequip` |

La regla de negocio vive en el backend (una prenda por slot, solo prendas que la
mascota posee y con slot). El front no la replica: lista todo el catalogo y, si se
intenta equipar algo invalido, muestra tal cual el motivo que devuelve el backend
(`La mascota no posee este item`, `Este item no es equipable`,
`No tienes permiso para equipar items en esta mascota`...) en un `FeedbackBanner`.
Para que una mascota posea prendas, un admin las asigna desde el panel admin.

## Notificaciones push

Complementan a los avisos internos (`src/lib/notifications.ts`, que sigue mostrando
`GET /notifications` en un `Alert`). Usan `expo-notifications`:

- `src/lib/push.ts`: handler de primer plano, `getPushToken()` (crea el canal
  `default` en Android, pide permiso y obtiene el Expo push token) y
  `savePushToken()` (`PUT /auth/push-token` con `{ token }`).
- `src/hooks/usePushNotifications.ts` (montado por `PushBridge` en `app/_layout.tsx`):
  registra el dispositivo cuando hay sesion (tambien al arrancar con sesion guardada)
  y, al tocar un aviso con `data.projectId`, abre `/project/[id]`.
- `signOut` envia `{ token: null }` antes de borrar la sesion (si no hay red, cierra igual).

En web el push no aplica: `getPushToken()` devuelve `null`.

### Requisitos

1. **Development build, no Expo Go**: Expo Go ya no soporta push remoto en Android.
2. **Firebase**: crear un proyecto, agregar una app Android con el package
   `com.juanf24steam.tamagit` y descargar `google-services.json` a la raiz del repo
   (este archivo **si** se versiona).
3. Referenciarlo en `app.json` (todavia no esta, se agrega cuando exista el archivo):

   ```json
   "android": { "googleServicesFile": "./google-services.json" }
   ```

4. **Clave FCM V1**: en Firebase > Configuracion del proyecto > Cuentas de servicio,
   generar una clave privada (JSON) y subirla a EAS:

   ```bash
   npx eas-cli credentials   # Android > Google Service Account > FCM V1
   ```

   Esa clave **no** se versiona (`*-firebase-adminsdk-*.json` y
   `service-account*.json` estan en `.gitignore`).
5. Generar e instalar el development build:

   ```bash
   npx eas-cli build --profile development --platform android
   npx expo start --dev-client
   ```

### Probar

1. Abrir la app en el dispositivo, iniciar sesion y aceptar el permiso de notificaciones.
2. Obtener el Expo push token (`ExponentPushToken[...]`) desde el backend (el que
   guardo `PUT /auth/push-token`); la app no lo imprime en consola.
3. En https://expo.dev/notifications pegar el token, escribir titulo/mensaje y, en
   _Data (JSON)_, por ejemplo:

   ```json
   { "notificationId": "1", "type": "test", "projectId": "<id de un proyecto>" }
   ```

4. Con la app en primer plano se ve el banner; al tocarlo (en primer plano, segundo
   plano o con la app cerrada) navega al detalle del proyecto. Sin `projectId` no navega.

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