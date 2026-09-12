/**
 * Cliente HTTP: el ÚNICO archivo de la app que sabe usar `fetch`.
 *
 * Todo lo demás (pantallas, contexto de sesión) llama a funciones con nombre de
 * negocio. Si mañana cambia la forma de hablar con el servidor, se cambia aquí
 * y nada más.
 */

// La URL se lee del archivo .env. Tiene que escribirse EXACTAMENTE así, con
// notación de punto: Expo busca ese texto en el código y lo reemplaza por el
// valor al compilar. Guardarlo en una variable intermedia no funcionaría.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

/**
 * Token JWT de la sesión activa.
 *
 * Vive en memoria: al cerrar la app se pierde y hay que volver a entrar.
 * ponytail: sin almacenamiento persistente. Para que la sesión sobreviva al
 * cierre, instalar `expo-secure-store` y guardarlo/leerlo aquí.
 */
let token: string | null = null;

/** La llama el contexto de sesión al entrar (token) y al salir (null). */
export function setToken(value: string | null): void {
  token = value;
}

/**
 * Hace una petición a la API y devuelve el JSON ya tipado.
 *
 * - Sin `body` -> GET. Con `body` -> POST enviándolo como JSON.
 * - Si hay sesión activa, adjunta la cabecera `Authorization: Bearer <token>`.
 * - Si el servidor responde con error, lanza un Error con SU mensaje, que es
 *   el que la pantalla muestra al usuario.
 *
 * @param path Ruta relativa a la API, empezando por "/". Ej: "/auth/login".
 */
export async function request<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Sintaxis de "propagación condicional": si no hay token, no se añade
        // la cabecera en lugar de mandarla vacía.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // `fetch` solo falla así cuando no hubo respuesta: servidor apagado, URL
    // equivocada o el dispositivo no alcanza esa dirección (ver .env.example).
    throw new Error(`No se pudo conectar con ${API_URL}. ¿Está encendido el servidor?`);
  }

  // El backend responde JSON siempre, pero una caída puede devolver HTML: si no
  // se puede leer como JSON, se sigue con un objeto vacío en vez de reventar.
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    // El backend usa el formato { error: "mensaje legible" }.
    const message = typeof data['error'] === 'string' ? data['error'] : null;
    throw new Error(message ?? `Error ${response.status} al llamar ${path}`);
  }

  return data as T;
}