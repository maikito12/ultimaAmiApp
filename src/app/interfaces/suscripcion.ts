export interface Suscripcion {

  id: string;

  organizacionId: string;

  planId: string;

  plan: string;

  precio: number;

  cantidadProfesionales: number;

  estado: string;

  mercadoPagoPreapprovalId?: string;

  fechaInicio: string;

  fechaFin?: string;

  fechaCancelacion?: string;

  initPoint?: string;
}