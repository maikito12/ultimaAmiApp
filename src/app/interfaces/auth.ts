export interface LoginRequest {
  email: string;
  password: string;
}

export interface Organizacion {
  id: string;
  nombre: string;
  rol: number;
}

export interface LoginResponse {
  token: string;
  usuarioId: string;
  nombre: string;
  apellido: string;
  email: string;
  organizaciones: Organizacion[];
}