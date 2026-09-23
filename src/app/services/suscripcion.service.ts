import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Suscripcion } from '../interfaces/suscripcion';
import { environment } from '../../environments/environment';


// =====================================================
// WHATSAPP - CUPO
// =====================================================

export interface WhatsAppEstadoCupo {

  success: boolean;

  periodoInicio: string;

  periodoFin: string;

  cantidadProfesionales: number;

  mensajesPorProfesional: number;

  mensajesIncluidos: number;

  mensajesConsumidos: number;

  mensajesIncluidosDisponibles: number;

  mensajesExtraDisponibles: number;

  mensajesDisponiblesTotales: number;

  porcentajeConsumido: number;

}


// =====================================================
// WHATSAPP - PAQUETES
// =====================================================

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


// =====================================================
// WHATSAPP - COMPRAS
// =====================================================

export interface WhatsAppCompraMensajes {

  id: string;

  paqueteId: string;

  paquete: string;

  cantidadMensajes: number;

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


@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {

  private readonly apiUrl =
    `${environment.apiUrl}/suscripciones`;


  private readonly whatsappApiUrl =
    `${this.apiUrl}/whatsapp`;


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // SUSCRIPCIÓN ACTUAL
  // ==========================================

  obtenerActual():
    Observable<Suscripcion> {

    return this.http.get<Suscripcion>(
      `${this.apiUrl}/actual`
    );

  }


  // ==========================================
  // CREAR CHECKOUT
  // ==========================================

  crearCheckout(
    data: {
      planId: string;
      cantidadProfesionales: number;
      modalidad: string;
    }
  ):
    Observable<Suscripcion> {

    return this.http.post<Suscripcion>(
      `${this.apiUrl}/checkout`,
      data
    );

  }


  // ==========================================
  // COTIZAR
  // ==========================================

  cotizar(
    planId: string,
    cantidadProfesionales: number
  ):
    Observable<any> {

    return this.http.get(
      `${this.apiUrl}/cotizar`,
      {
        params: {
          planId,
          cantidadProfesionales
        }
      }
    );

  }


  // ==========================================
  // CAMBIAR CANTIDAD DE PROFESIONALES
  // ==========================================

  cambiarCantidadProfesionales(
    cantidadProfesionales: number
  ):
    Observable<any> {

    return this.http.put(
      `${this.apiUrl}/cantidad-profesionales`,
      {
        cantidadProfesionales
      }
    );

  }


  // ==========================================
  // CANCELAR
  // ==========================================

  cancelar():
    Observable<any> {

    return this.http.post(
      `${this.apiUrl}/cancelar`,
      {}
    );

  }


  // ==========================================
  // HISTORIAL
  // ==========================================

  obtenerHistorial():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/historial`
    );

  }


  // ==========================================
  // WHATSAPP - ESTADO DEL CUPO
  // ==========================================

  obtenerEstadoWhatsApp():
    Observable<WhatsAppEstadoCupo> {

    return this.http.get<WhatsAppEstadoCupo>(
      this.whatsappApiUrl
    );

  }


  // ==========================================
  // WHATSAPP - PAQUETES DISPONIBLES
  // ==========================================

  obtenerPaquetesWhatsApp():
    Observable<WhatsAppPaquetesResponse> {

    return this.http.get<WhatsAppPaquetesResponse>(
      `${this.whatsappApiUrl}/paquetes`
    );

  }


  // ==========================================
  // WHATSAPP - CREAR COMPRA PENDIENTE
  // ==========================================

  comprarPaqueteWhatsApp(
    paqueteId: string
  ):
    Observable<WhatsAppCompraResponse> {

    return this.http.post<WhatsAppCompraResponse>(
      `${this.whatsappApiUrl}/compras`,
      {
        paqueteId
      }
    );

  }


  // ==========================================
  // WHATSAPP - HISTORIAL DE COMPRAS
  // ==========================================

  obtenerComprasWhatsApp():
    Observable<WhatsAppComprasResponse> {

    return this.http.get<WhatsAppComprasResponse>(
      `${this.whatsappApiUrl}/compras`
    );

  }

}
