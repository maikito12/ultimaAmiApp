export interface Plan {
  id: string;
  nombre: string;
  maxProfesionales: number;
  maxUsuarios: number;
  maxSecretarias: number;
  maxSucursales: number;
  precio: number;
  activo: boolean;
}