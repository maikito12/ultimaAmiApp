import { RolOrganizacion } from './rol-organizacion';

export enum EstadoInvitacion {
  Activa = 1,
  Utilizada = 2,
  Expirada = 3,
  Cancelada = 4
}

// ==========================================
// INVITACIÓN
// ==========================================

export interface Invitacion {

  id: string;

  codigo: string;

  organizacionId: string;

  rol: RolOrganizacion;

  estado: EstadoInvitacion;

  expiraEn: string;

  usosActuales: number;

  usosMaximos: number;

}


// ==========================================
// CREAR INVITACIÓN
// ==========================================

export interface CreateInvitacion {

  rol: RolOrganizacion;

  diasValidez: number;

  usosMaximos: number;

}


// ==========================================
// REGISTRARSE CON INVITACIÓN
// ==========================================

export interface RegistroConInvitacion {

  codigo: string;

  nombre: string;

  apellido: string;

  email: string;

  password: string;

}


// ==========================================
// UNIRSE CON USUARIO EXISTENTE
// ==========================================

export interface UnirseOrganizacion {

  codigo: string;

}