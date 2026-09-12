/**
 * Endpoints de autenticación (prefijo /api/auth) y la traducción entre el
 * español del servidor y el inglés de la app.
 */

import type { Role, User } from '../types';
import { request } from './client';

/** Forma EXACTA en que el backend devuelve un usuario. No cambiar a la ligera. */
interface UserResponse {
  id: string;
  nombre: string;
  correo: string;
  rol: Role;
  activo: boolean;
}

interface SessionResponse {
  token: string;
  usuario: UserResponse;
}

/** El único lugar donde se convierte la respuesta del servidor al tipo de la app. */
function toUser(data: UserResponse): User {
  return {
    id: data.id,
    name: data.nombre,
    email: data.correo,
    role: data.rol,
    active: data.activo,
  };
}

/** POST /auth/login -> token de sesión y usuario que entró. */
export async function login(email: string, password: string) {
  const session = await request<SessionResponse>('/auth/login', {
    correo: email,
    clave: password,
  });
  return { token: session.token, user: toUser(session.usuario) };
}

/** POST /auth/registro -> el usuario creado (201). Ojo: NO devuelve token. */
export async function register(name: string, email: string, password: string): Promise<User> {
  return toUser(
    await request<UserResponse>('/auth/registro', { nombre: name, correo: email, clave: password }),
  );
}

/** GET /auth/perfil -> el usuario de la sesión actual. Requiere token. */
export async function profile(): Promise<User> {
  return toUser(await request<UserResponse>('/auth/perfil'));
}