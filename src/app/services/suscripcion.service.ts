import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Suscripcion } from '../interfaces/suscripcion';
import { environmentProduccion } from '../../environments/environment';

export interface SolicitudPlanPersonalizadoRequest {
  cantidadProfesionales: number;
  telefonoContacto: string;
  mensaje?: string | null;
}
export interface SolicitudPlanPersonalizadoResponse {
  id: string;
  cantidadProfesionales: number;
  estado: string;
  telefonoContacto: string;
  mensaje: string | null;
  fechaSolicitud: string;
  message: string;
}
export interface WhatsAppEstadoCupo {
  success: boolean;
  periodoInicio: string;
  periodoFin: string;
  cantidadProfesionales: number;
  mensajesPorProfesional: number;
  mensajesIncluidos: number;
  mensajesConsumidos: number;
  mensajesExtraConsumidos?: number;
  mensajesExtraUtilidadDisponibles?: number;
  mensajesExtraMarketingDisponibles?: number;
  mensajesIncluidosDisponibles: number;
  mensajesExtraDisponibles: number;
  mensajesDisponiblesTotales: number;
  porcentajeConsumido: number;
}
export interface WhatsAppPaquete {
  id: string;
  nombre: string;
  cantidadMensajes: number;
  precio: number;
  orden: number;
}
export interface WhatsAppPaquetesResponse {
  success: boolean;
  items: WhatsAppPaquete[];
}
export interface WhatsAppCompraRequest {
  paqueteId: string;
  profesionalId?: string | null;
  cantidadUtilidad: number;
  cantidadMarketing: number;
}
export interface WhatsAppCompraMensajes {
  id: string;
  paqueteId: string;
  paquete: string;
  cantidadMensajes: number;
  cantidadUtilidad?: number;
  cantidadMarketing?: number;
  profesionalId?: string | null;
  importe: number;
  estado: string;
  initPoint: string | null;
  createdAt: string;
}
export interface WhatsAppCompraResponse {
  success: boolean;
  compra: WhatsAppCompraMensajes;
}
export interface WhatsAppComprasResponse {
  success: boolean;
  items: WhatsAppCompraMensajes[];
}

@Injectable({ providedIn: 'root' })
export class SuscripcionService {
  private readonly apiUrl = `${environmentProduccion.apiUrl}/suscripciones`;
  private readonly whatsappApiUrl = `${this.apiUrl}/whatsapp`;

  constructor(private http: HttpClient) {}

  obtenerActual(): Observable<Suscripcion> {
    return this.http.get<Suscripcion>(`${this.apiUrl}/actual`);
  }
  crearCheckout(data: {
    planId: string;
    cantidadProfesionales: number;
    modalidad: string;
  }): Observable<Suscripcion> {
    return this.http.post<Suscripcion>(`${this.apiUrl}/checkout`, data);
  }
  cotizar(planId: string, cantidadProfesionales: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cotizar`, {
      params: { planId, cantidadProfesionales }
    });
  }
  cambiarCantidadProfesionales(cantidadProfesionales: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cantidad-profesionales`, {
      cantidadProfesionales
    });
  }
  cancelar(): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancelar`, {});
  }
  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }
  obtenerEstadoWhatsApp(): Observable<WhatsAppEstadoCupo> {
    return this.http.get<WhatsAppEstadoCupo>(this.whatsappApiUrl);
  }
  obtenerPaquetesWhatsApp(): Observable<WhatsAppPaquetesResponse> {
    return this.http.get<WhatsAppPaquetesResponse>(`${this.whatsappApiUrl}/paquetes`);
  }
  comprarPaqueteWhatsApp(data: WhatsAppCompraRequest): Observable<WhatsAppCompraResponse> {
    return this.http.post<WhatsAppCompraResponse>(
      `${this.whatsappApiUrl}/compras`, data
    );
  }
  obtenerComprasWhatsApp(): Observable<WhatsAppComprasResponse> {
    return this.http.get<WhatsAppComprasResponse>(`${this.whatsappApiUrl}/compras`);
  }
  solicitarPlanPersonalizado(
    data: SolicitudPlanPersonalizadoRequest
  ): Observable<SolicitudPlanPersonalizadoResponse> {
    return this.http.post<SolicitudPlanPersonalizadoResponse>(
      `${this.apiUrl}/plan-personalizado`, data
    );
  }
  reactivar(): Observable<Suscripcion> {
    return this.http.post<Suscripcion>(`${this.apiUrl}/reactivar`, {});
  }
}
