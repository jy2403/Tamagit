/**
 * El vocabulario de la app, en inglés.
 *
 * El backend habla español (`nombre`, `correo`, `clave`...). Esa traducción
 * ocurre en un solo sitio, `src/api/`, y de ahí para acá todo se llama igual.
 * Así, si el servidor renombra un campo, solo cambia el archivo que traduce.
 *
 * Los VALORES de las listas (SOLICITANTE, ALTA, RED...) sí van en español:
 * no son nombres de código, son los datos que el servidor guarda y devuelve.
 */

/** Roles del sistema. El backend asigna SOLICITANTE por defecto al registrarse. */
export const ROLES = ['SOLICITANTE', 'AGENTE', 'COORDINADOR', 'ADMINISTRADOR'] as const;
export type Role = (typeof ROLES)[number];

/** Usuario de la sesión. Nunca incluye la contraseña ni su hash. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

// --- Tickets ---------------------------------------------------------------

export const PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = [
  'NUEVO',
  'ASIGNADO',
  'EN_PROCESO',
  'ESPERA_INFORMACION',
  'RESUELTO',
  'CERRADO',
] as const;
export type TicketStatus = (typeof STATUSES)[number];

/**
 * Catálogo de categorías (F03 del documento de visión): la categoría es la que
 * determina el SLA y el grupo de agentes competentes.
 *
 * Está quemado aquí porque el backend todavía no expone el catálogo. Cuando
 * exista F04 ("catálogo configurable"), esta lista se pedirá al servidor.
 */
export const CATEGORIES = [
  'RED',
  'AULAS',
  'CREDENCIALES',
  'PLATAFORMA_ACADEMICA',
  'OTRO',
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Lo que el usuario llena en el formulario de una nueva solicitud. */
export interface NewTicket {
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
}

/** Un ticket ya registrado en el servidor. */
export interface Ticket extends NewTicket {
  id: string;
  status: TicketStatus;
  requesterId: string;
  agentId: string | null;
}