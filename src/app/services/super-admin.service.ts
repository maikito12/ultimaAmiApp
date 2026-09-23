import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  environment
} from '../../environments/environment';


// =====================================================
// RESUMEN GLOBAL
// =====================================================

export interface SuperAdminResumen {

  organizacionesActivas: number;

  profesionalesActivos: number;

  usuariosRegistrados: number;

}


// =====================================================
// NEGOCIO
// =====================================================

export interface SuperAdminNegocio {

  suscripciones: {

    activas: number;

    enPrueba: number;

    pendientes: number;

    pausadas: number;

    vencidas: number;

    canceladas: number;

  };

  solicitudes: {

    planesPersonalizadosPendientes:
      number;

  };

  ingresos: {

    mrrEstimado: number;

    arrEstimado: number;

    ticketPromedioMensual: number;

  };

}


// =====================================================
// ORGANIZACIÓN
// =====================================================

export interface SuperAdminOrganizacion {

  id: string;

  nombre: string;

  slug: string;

  ciudad: string | null;

  activo: boolean;

  fechaAlta: string;

  planId: string | null;

  planNombre: string | null;

  usuarios: number;

  profesionales: number;

  sucursales: number;

  turnosEsteMes: number;

  suscripcionId: string | null;

  suscripcionEstado: string | null;

  modalidad: string | null;

  cantidadProfesionalesContratados:
    number | null;

  precioPorProfesional:
    number | null;

  importeTotal:
    number | null;

  fechaInicio:
    string | null;

  fechaFin:
    string | null;

  diasParaVencer:
    number | null;

  ultimoPagoImporte:
    number | null;

  ultimoPagoFecha:
    string | null;

  ultimoPagoMetodo:
    string | null;

}




// =====================================================
// DETALLE DE ORGANIZACIÓN PARA SUPER ADMIN
// =====================================================

export interface SuperAdminOrganizacionDetalle {

  organizacion: {
    id: string;
    nombre: string;
    slug: string;
    logoUrl: string | null;
    email: string | null;
    telefono: string | null;
    ciudad: string | null;
    pais: string | null;
    activo: boolean;
    fechaAlta: string;
  };

  plan: {
    id: string;
    nombre: string;
    maxProfesionales: number;
    maxUsuarios: number;
    maxSecretarias: number;
    maxSucursales: number;
    precioPorProfesional: number;
    permitePlanPersonalizado: boolean;
    activo: boolean;
  } | null;

  suscripcion: {
    id: string;
    estado: string;
    modalidad: string;
    cantidadProfesionales: number;
    precioPorProfesional: number;
    importeTotal: number;
    fechaInicio: string;
    fechaFin: string | null;
    fechaFinPrueba: string | null;
    fechaCancelacion: string | null;
  } | null;

  uso: {
    usuarios: number;
    profesionales: number;
    sucursales: number;
    turnosHoy: number;
    turnosEsteMes: number;
    turnosTotales: number;
  };

}

// =====================================================
// SOLICITUD PLAN PERSONALIZADO
// =====================================================

export interface SolicitudPlanPersonalizado {

  id: string;

  estado: string;

  cantidadProfesionales:
    number | null;

  mensaje:
    string | null;

  telefonoContacto:
    string | null;

  fechaSolicitud: string;

  fechaContacto:
    string | null;


  organizacion: {

    id: string;

    nombre: string;

    ciudad:
      string | null;

    activo: boolean;

  };


  solicitadoPor: {

    id: string;

    nombre: string;

    apellido: string;

    email: string;

  };

}


// =====================================================
// PAGOS MANUALES DE SUSCRIPCIÓN
// =====================================================

export type MetodoPagoManual =
  | 'Transferencia'
  | 'Efectivo'
  | 'Otro';


export interface RegistrarPagoManualRequest {

  importe:
    number | null;

  metodoPago:
    MetodoPagoManual;

  referencia?:
    string | null;

  observaciones?:
    string | null;

}


export interface PagoSuscripcion {

  id: string;

  organizacionId: string;

  suscripcionId: string;

  importe: number;

  moneda: string;

  metodoPago: string;

  origen: string;

  estado: string;

  referencia:
    string | null;

  observaciones:
    string | null;

  fechaPago: string;

  suscripcionVigenteHasta:
    string | null;

}


export interface RegistrarPagoManualResponse {

  success: boolean;

  message: string;

  pago:
    PagoSuscripcion;

}


export interface PagosSuscripcionResponse {

  success: boolean;

  items:
    PagoSuscripcion[];

}


export interface ActualizarPrecioSuscripcionRequest {

  importeTotal: number;

  precioPorProfesional?:
    number | null;

}


export interface ActualizarPrecioSuscripcionResponse {

  success: boolean;

  message: string;

  suscripcionId: string;

  organizacionId: string;

  importeAnterior: number;

  importeTotal: number;

  precioPorProfesional: number;

  modalidad: string;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {

  private readonly apiUrl =
    `${environment.apiUrl}/super-admin`;


  private readonly suscripcionesApiUrl =
    `${environment.apiUrl}/superadmin/suscripciones`;


  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // RESUMEN
  // ===================================================

  obtenerResumen():
    Observable<SuperAdminResumen> {

    return this.http.get<SuperAdminResumen>(
      `${this.apiUrl}/resumen`
    );

  }


  // ===================================================
  // NEGOCIO
  // ===================================================

  obtenerNegocio():
    Observable<SuperAdminNegocio> {

    return this.http.get<SuperAdminNegocio>(
      `${this.apiUrl}/negocio`
    );

  }


  // ===================================================
  // ORGANIZACIONES
  // ===================================================

  obtenerOrganizaciones():
    Observable<SuperAdminOrganizacion[]> {

    return this.http.get<
      SuperAdminOrganizacion[]
    >(
      `${this.apiUrl}/organizaciones`
    );

  }




  // ===================================================
  // DETALLE DE UNA ORGANIZACIÓN
  // ===================================================

  obtenerOrganizacion(
    organizacionId:
      string
  ):
    Observable<SuperAdminOrganizacionDetalle> {

    return this.http.get<
      SuperAdminOrganizacionDetalle
    >(
      `${this.apiUrl}/organizaciones/${organizacionId}`
    );

  }


  // ===================================================
  // SOLICITUDES PERSONALIZADAS
  // ===================================================

  obtenerSolicitudesPlanPersonalizado():
    Observable<
      SolicitudPlanPersonalizado[]
    > {

    return this.http.get<
      SolicitudPlanPersonalizado[]
    >(
      `${this.apiUrl}/solicitudes-plan-personalizado`
    );

  }


  // ===================================================
  // REGISTRAR PAGO MANUAL
  // ===================================================

  registrarPagoManual(
    organizacionId:
      string,

    request:
      RegistrarPagoManualRequest
  ):
    Observable<RegistrarPagoManualResponse> {

    return this.http
      .post<RegistrarPagoManualResponse>(
        `${this.suscripcionesApiUrl}/organizacion/${organizacionId}/pago-manual`,
        request
      );

  }


  // ===================================================
  // ACTUALIZAR PRECIO HABITUAL
  // ===================================================

  actualizarPrecioSuscripcion(
    organizacionId:
      string,

    request:
      ActualizarPrecioSuscripcionRequest
  ):
    Observable<ActualizarPrecioSuscripcionResponse> {

    return this.http
      .put<ActualizarPrecioSuscripcionResponse>(
        `${this.suscripcionesApiUrl}/organizacion/${organizacionId}/precio`,
        request
      );

  }


  // ===================================================
  // HISTORIAL DE PAGOS
  // ===================================================

  obtenerPagos(
    organizacionId:
      string
  ):
    Observable<PagosSuscripcionResponse> {

    return this.http
      .get<PagosSuscripcionResponse>(
        `${this.suscripcionesApiUrl}/organizacion/${organizacionId}/pagos`
      );

  }

}
