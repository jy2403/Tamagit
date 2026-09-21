# Banco de preguntas para sustentación

 Respuestas cortas para responder en voz alta. Marca ⚠️ donde ojo con la pregunta.

## Expo / React Native

**¿Por qué Expo Router y no React Navigation directo?**
Expo Router es navegación basada en archivos: cada archivo en `app/` es una pantalla, con tipado de rutas y deep links integrados. El Stack se declara en `app/_layout.tsx`.

**¿Qué es una ruta dinámica?**
`app/project/[id].tsx` o `admin/users/[id].tsx`: el segmento entre corchetes es un parámetro que se lee con `useLocalSearchParams` (p. ej. el id del proyecto o usuario).

**¿Cómo navegas entre pantallas?**
Con `useRouter()` y `router.push('/ruta')` o `router.back()`. Y con `<Redirect href="..."/>` para redirecciones condicionales (sin token → `/login`).

**¿Cómo se estiliza la app?**
NativeWind (Tailwind para React Native): clases como `flex-1 bg-neutral-950` compilan a estilos nativos. También `StyleSheet`/inline en casos puntuales (la vista 3D).

**¿Dónde vive la fuente pixel?**
`@expo-google-fonts/press-start-2p`, cargada con `useFonts` en `app/_layout.tsx` (mientras no carga, devuelve null para no mostrar pantalla sin fuente).

**¿Cómo gestionas el estado?**
Estado local con hooks (useState/useCallback) y un Context global para la sesión (AuthContext). No hay Redux/Zustand porque el estado global es solo la sesión.

**¿Cómo evitas re-render innecesarios?**
useCallback para funciones que pasan a hijos/useEffect, useMemo para valores derivados (ej. el PanResponder y la lista filtrada del CRUD).

## Autenticación

**¿Cómo funciona el login con GitHub?** (LA pregunta segura — ensáyala)
1. La app abre una sesión de navegador con `openAuthSessionAsync` hacia GET `/auth/github/login?redirect_uri=tamagit://auth`.
2. El backend firma la redirect_uri dentro de un JWT de 10 min (el `state`) y redirige a GitHub.
3. GitHub autoriza y vuelve al callback del backend con `code`.
4. El backend canjea el code por un access_token, consulta el perfil, hace upsert del usuario en Postgres, emite SU PROPIO JWT (sub: user.id, 30 días) y redirige a la app `tamagit://auth?token=...`.
5. AuthContext escucha el deep link, guarda el token en SecureStore y valida con GET /users/me.

**¿Por qué el JWT lo emite tu backend y no usas el token de GitHub?**
Porque el token de GitHub es de una API externa (scope, expiración y revocación fuera de nuestro control) y guardar permiso/estado propio (isAdmin, isBanned) requiere autoridad propia. El JWT es stateless: el backend solo necesita la firma para autorizar.

**¿Dónde guardas el token y por qué?**
En expo-secure-store: almacenamiento cifrado del SO (Keychain en iOS / Keystore en Android). AsyncStorage no está cifrado.

**¿Qué pasa si un usuario baneado abre la app con sesión activa?**
Al restaurar la sesión, AuthContext llama /users/me y si `isBanned` limpia token y usuario (y a nivel de API el middleware verifyToken devolvería 403).

**¿Qué es el `state` de OAuth y para qué lo usas?**
Valor que GitHub devuelve tal cual en el callback para prevenir CSRF. Aquí además transporta (firmado con JWT, caduca en 10 min) la deep link a la que el backend debe devolver al usuario.

## Arquitectura front

**¿Cómo llama la app al backend?**
Una sola función `apiFetch` en `src/lib/api.ts`: arma headers (Accept, Content-Type, Authorization Bearer con el token), serializa el body, y en error intenta leer `data.error`/`data.details` para mostrar el mensaje del servidor. La URL base viene de `EXPO_PUBLIC_API_URL` (variable de entorno de Expo).

**¿Por qué no llama el front directo a la API de GitHub?**
Por seguridad y centralización: el token de GitHub del usuario vive solo en el backend; el front pide `/github/...` a nuestro API. Así no exponemos tokens y podemos mapear/cachear/limitar.

**¿Cómo organizas componentes reutilizables?**
Button (variantes primary/secondary/ghost), Field (input con label, error y contador), AdminCrudList (CRUD genérico), ReasonPrompt (modal con motivo), IntroAnimation (overlay animado).

⚠️ **¿Cómo funciona el CRUD de items y comidas?**
Ambas pantallas son casi idénticas y usan `AdminCrudList`, que recibe: `fields` (definición de columnas/inputs con validación), `rows`, y callbacks onCreate/onUpdate/onDelete que hacen las llamadas a la API y recargan. El componente maneja búsqueda, validación, edición y diff (en PATCH solo envía campos cambiados).

**¿Cómo funciona la pet 3D?**
`GLView` de expo-gl crea un contexto GL y notifica por `onContextCreate`; ahí instanciamos `expo-three`'s Renderer (un THREE.WebGLRenderer), armamos la escena con luces y geometrías (boxes/esferas: cuerpo, cabeza, ojos...), y un bucle requestAnimationFrame rota la mascota y llama `gl.endFrameEXP()` para presentar el frame. Los gestos (giro con 1 dedo, zoom con pinch) son un PanResponder que actualiza refs de yaw/distancia.

**¿Cuenta alguna historia técnica interesante?**
Sí: la de three.js. three r163+ eliminó soporte de WebGL 1, pero expo-gl solo entrega contexto WebGL 1, así que la mascota crasheaba ("WebGL 1 is not supported since r163"). La solución: fijar three@0.162.0 (última con WebGL 1) usando overrides de npm, porque expo-three declaraba peer three@^0.166 y cachaba una copia rota anidada.

## Backend

**¿Qué es Prisma y por qué?**
ORM para Node con schema declarativo (prisma/schema.prisma) y cliente tipado. Maneja migraciones y relaciones (User → Project → Pet, con onDelete: Cascade).

**¿Cómo proteges las rutas?**
Middleware `verifyToken`: lee el header Authorization Bearer, verifica el JWT con JWT_SECRET, busca al usuario en la BD (req.user) y rechaza baneados (403). `requireAdmin` se encadena en rutas admin (items/foods/ POST-PATCH-DELETE/users ban).

**¿Qué es el "sync" de proyectos?**
POST /projects/sync: con el access_token de GitHub guardado, lista todos los repos del usuario (paginado), baja el árbol de archivos y el package.json de cada uno, deduce las tecnologías con detectTools (rutas como Dockerfile, prisma/schema.prisma, deps como react/express...) y hace upsert del Project por githubRepoId (idempotente, se puede resincronizar).

**¿De dónde sale la especie de la mascota?**
`speciesFromLanguage(mainLanguage)`: mapa lenguaje → especie; si no coincide, "egg".

**¿Qué hay en la base de datos?**
Postgres con models User, Project, Pet, Item, Food. Pet es 1-1 con Project. Borrar un usuario borra en cascada sus proyectos y mascotas.

## Seguridad

**¿Dónde termina tu seguridad real? El front oculta cosas ¿y eso basta?**
No: el front solo quiere UX (ocultar admin, confirmaciones). La autoridad está en el back: JWT obligatorio, requireAdmin, checks de ownership (dueño del proyecto/mascota o admin) en cada controlador. Ej.: si intentaras PATCH a una mascota ajena, el back responde 404/403 aunque el front lo permitiera.

⚠️ **¿Qué partes no están terminadas?** (di "en desarrollo" con confianza)
- Items por mascota y notificaciones: el front ya consume los endpoints (`/pets/:id/items`, `/notifications`, `/users/:id/pets`, `GET /pets/:id`), pero el backend todavía no los implementa: son features parcialmente integradas.
- El resto (auth OAuth, sync, mascotas CRUD, CRUD admin de items/comidas, ban de usuarios) funciona end-to-end.

## Extras que suelen preguntar

**¿Qué es el deep link scheme?**
`tamagit://` declarado en app.json (`scheme`). Permite que el backend (navegador) vuelva a abrir la app tras el OAuth; se construye con `Linking.createURL('auth')` y se escucha con `Linking.addEventListener('url')`.

**¿Cómo manejas errores en las pantallas?**
try/catch en callbacks con setError y mensajes del servidor cuando existen (apiFetch los parsea). Alert para errores en flujos admin; el login muestra authError en pantalla.

**¿Alguna validación?**
AdminCrudList valida obligatorio, numérico y maxLength por campo; Field muestra el error bajo el input; el back también valida (400 si falta name, isBanned debe ser boolean, no puedes autobanearte...).
