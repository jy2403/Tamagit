# Tamagit — Cheat Sheet de sustentación

## 1. Qué es

App móvil (Expo / React Native + TypeScript) donde te autenticas con **GitHub OAuth**, ves tus repositorios y por cada repo tienes una **mascota virtual** que puedes crear, alimentar, entrenar, renombrar y eliminar. Un **panel admin** gestiona items, comidas, usuarios (baneos) y mascotas de otros usuarios.

- **Front:** Expo SDK 57, React Native 0.86, React 19, Expo Router, NativeWind (Tailwind), three.js + expo-gl + expo-three (mascota 3D).
- **Back:** Node + Express 5, Prisma ORM, PostgreSQL, JWT. Desplegado en Vercel: `https://tama-git-backend.vercel.app`.

## 2. Estructura del front

```
app/                    → RUTAS (Expo Router: archivo = pantalla)
  _layout.tsx          → Stack de navegación + AuthProvider + fuente pixel + intro
  index.tsx            → Landing (START)
  login.tsx            → Botón "Conectar con GitHub"
  auth.tsx             → Pantalla de retorno del deep link OAuth
  projects.tsx         → Lista de proyectos + sync + notificaciones
  project/[id].tsx     → Detalle: mascota (3D + stats) y commits
  profile.tsx          → Perfil del usuario
  admin.tsx            → Menú admin (protege con user.isAdmin)
  admin/items.tsx      → CRUD items (usa AdminCrudList)
  admin/foods.tsx      → CRUD comidas (usa AdminCrudList)
  admin/users.tsx      → Lista usuarios + ban
  admin/users/[id].tsx → Mascotas de un usuario (feature en desarrollo)
  admin/pets/[petId].tsx → Detalle mascota admin (feature en desarrollo)

src/
  context/AuthContext.tsx → CORAZÓN: sesión, OAuth, deep links, ban
  lib/api.ts             → Cliente HTTP único (apiFetch)
  lib/storage.ts         → Token/usuario en expo-secure-store
  lib/types.ts           → Tipos compartidos
  lib/notifications.ts   → Avisos del admin (endpoint no implementado aún)
  components/            → Pet3DView, AdminCrudList, Field, Button, IntroAnimation, ReasonPrompt
  layout/Button.tsx      → Botón con variantes primary/secondary/ghost
```

## 3. Flujo de autenticación (LA pregunta segura)

1. `login.tsx` llama `signIn()` de **AuthContext**.
2. `signIn` construye la redirect URI con `Linking.createURL('auth')` → scheme `tamagit://auth`, y abre `expo-web-browser` (`openAuthSessionAsync`) contra `${API_URL}/auth/github/login?redirect_uri=...`.
3. Backend (`authController.login`): firma la redirect URI dentro de un **JWT temporal de 10 min** (el `state` de OAuth) y redirige a la página de autorización de GitHub.
4. GitHub vuelve a `/auth/github/callback` con `code` + `state`. El backend:
   - Verifica el `state` (recupera la deep link).
   - Canjea `code` por `access_token` de GitHub (client_id/secret del .env).
   - Pide el perfil a `https://api.github.com/user`.
   - Hace **upsert** del usuario en Postgres (guarda el `githubAccessToken` para usar la API de GitHub luego).
   - Genera **su propio JWT** (`sub: user.id`, 30 días) y **redirige a la app**: `tamagit://auth?token=...&username=...&avatar=...`.
5. La app recibe el deep link: `AuthContext` escucha `Linking.addEventListener('url')`, extrae el token y llama `applyToken`:
   - Guarda token en **SecureStore** (`lib/storage.ts`).
   - Valida el token pidiendo `GET /users/me` y guarda el usuario.
6. `auth.tsx` ve el token y hace `Redirect` a `/projects`.

**Puntos clave para explicar:** por qué JWT (stateless, el back no guarda sesiones), por qué SecureStore (almacenamiento cifrado nativo vs AsyncStorage), qué es el `state` (protección CSRF + transporte de la deep link), y que al arrancar la app `AuthContext` restaura la sesión y revalida con `/users/me` (y cierra sesión si el usuario está baneado).

## 4. Flujo de proyectos y mascota

1. `projects.tsx`: `GET /projects` (proyectos del dueño, con su mascota si existe).
2. Botón **Sincronizar**: `POST /projects/sync` → backend:
   - Usa el `githubAccessToken` guardado del usuario.
   - Lista TODOS sus repos (paginado, `githubApi.js`).
   - Por cada repo baja el árbol de archivos y el `package.json`.
   - `detectTools` (lib/tools.js) deduce tecnologías (docker, prisma, react, python...) por rutas de archivos y dependencias.
   - `upsert` de cada repo como Project (`githubRepoId` único).
   - La **especie de la mascota** se deduce del lenguaje principal (`speciesFromLanguage`).
3. Al tocar un proyecto → `project/[id].tsx`:
   - `GET /projects/:id/pet` → mascota (o botón "Crear mascota" → `POST /projects/:id/pet`).
   - `GET /github/repos/:owner/:repo/commits` → últimos 50 commits (el backend **proxea** la API de GitHub con el token del usuario; el front nunca habla directo con GitHub).
   - Acciones de mascota: `PATCH /pets/:id` (alimentar = hunger+15, entrenar = xp+10, renombrar) y `DELETE /pets/:id`.
4. **Mascota 3D** (`Pet3DView.tsx`): `GLView` de expo-gl crea el contexto (WebGL 1), `expo-three/p Renderer` envuelve `THREE.WebGLRenderer`, construye la mascota con geometrías (boxes + spheres), y un `requestAnimationFrame` la gira. Gestos: PanResponder para giro (1 dedo) y zoom (pinch).

## 5. Panel admin

- Acceso: doble capa → el front oculta si `!user.isAdmin`, y el back protege con el middleware **`requireAdmin`**.
- CRUD genérico: **`AdminCrudList`** recibe campos, filas y callbacks (onCreate/onUpdate/onDelete); los screens de items y foods solo definen campos y endpoints. Incluye búsqueda, validación (obligatorio, número, maxLength) y diff de cambios (PATCH solo envía lo que cambió).
- Users: ban/un ban → `PATCH /users/:id/ban`; un admin no puede banearse a sí mismo.
- Avisos: al entrar a proyectos, `showNotificationsOnce` pregunta `GET /notifications` **(endpoint aún no implementado en el backend → feature a medias, igual que los items de mascota)**.
- Seguridad real: un ban lo aplica el back; el front solo oculta botones. Si un banado tiene token viejo, el middleware `verifyToken` lo rechaza (403).

## 6. Backend (mapa de rutas → controlador)

| Ruta | Controlador | Nota |
|---|---|---|
| GET `/auth/github/login` | authController.login | genera state JWT y redirige a GitHub |
| GET `/auth/github/callback` | authController.tokenResponse | upsert user + JWT propio + redirect a la app |
| GET `/github/repos` | githubController.listRepos | proxea API GitHub |
| GET `/github/repos/:owner/:repo/commits` | githubController.listCommits | proxea API GitHub (50 commits) |
| POST `/projects/sync` | projectController.sync | detecta tools, upsert proyectos |
| GET `/projects` | projectController.listProjects | del dueño, incluye pet |
| POST / GET `/projects/:projectId/pet` | projectController.createPet / getPetByProject | especie según lenguaje |
| PATCH / DELETE `/pets/:id` | petController.updatePet / deletePet | dueño o admin |
| GET `/users/me` | userController.me | validar token |
| GET/POST/PATCH/DELETE `/users...` | userController | ban con requireAdmin |
| CRUD `/items` y `/foods` | item/foodController | escritura solo admin |

**Modelo de datos (Prisma, PostgreSQL):** `User` (githubId, githubAccessToken, isAdmin, isBanned) → `Project` (githubRepoId único, mainLanguage, tools[], ownerId) → `Pet` (health, hunger, xp, level, projectId único) · `Item` y `Food` (catálogo admin). Borrado en cascada: al borrar usuario se borran sus proyectos y mascotas.

**Middlewares:** `verifyToken` (Bearer JWT → busca usuario → rechaza baneados) y `requireAdmin`.

## 7. Historias para contar (preguntas típicas)

- **El bug de three.js:** three r163+ eliminó soporte de **WebGL 1**, pero expo-gl solo expone contextos WebGL 1 → la mascota 3D crasheaba. Se arregló fijando `three@0.162.0` con **overrides de npm** (porque expo-three pide `three@^0.166` y npm instalaría una copia anidada rota).
- **CRUD genérico:** un solo componente `AdminCrudList` sirve para items y comidas; agilidad DRY.
- **Seguridad:** auth en back (JWT + requireAdmin); front solo oculta UI. Tokens cifrados con SecureStore.
- **Deep link OAuth:** scheme `tamagit://` + state firmado con JWT (transporta la redirect URI de forma segura y conCaducidad de 10 min).
- **Sincronización:** "tools" detectadas del árbol del repo + package.json; upsert idempotente (sync repetido no duplica).

## 8. Features parciales (decirlo con seguridad si preguntan)

- `GET /pets/:id`, `POST/DELETE /pets/:id/items`, `GET /users/:id/pets`, `GET /notifications` → el front ya los consume, el backend aún no los implementa.
- El admin aún no gestiona mascotas de usuarios con datos reales en esas pantallas.
