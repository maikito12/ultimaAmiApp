import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../environments/environment';


export interface AutomatizacionAccion {
  id: string;

  orden: number;

  tipo: string;

  contenido: string | null;

  archivoUrl: string | null;

  templateNombre: string | null;

  templateIdioma: string | null;

  delayMinutos: number;

  activo: boolean;
}


export interface Automatizacion {
  id: string;

  profesionalId: string | null;

  nombre: string;

  evento: string;

  anticipacionMinutos: number | null;

  demoraMinutos: number | null;

  horaEnvio: string | null;

  canal: string;

  activo: boolean;

  createdAt: string;

  acciones: AutomatizacionAccion[];
}


export interface GuardarAutomatizacionAccionPayload {
  orden: number;

  tipo: string;

  contenido: string | null;

  archivoUrl: string | null;

  templateNombre: string | null;

  templateIdioma: string | null;

  delayMinutos: number;

  activo: boolean;
}


export interface GuardarAutomatizacionPayload {
  nombre: string;

  evento: string;

  anticipacionMinutos: number | null;

  demoraMinutos: number | null;

  horaEnvio: string | null;

  canal: string;

  profesionalId: string | null;

  activo: boolean;

  acciones:
    GuardarAutomatizacionAccionPayload[];
}


// =====================================================
// WHATSAPP
// =====================================================

export interface GuardarWhatsAppConfiguracionPayload {
  profesionalId: string | null;

  numero: string;

  phoneNumberId: string;

  businessAccountId: string;

  accessToken: string;
}


export interface WhatsAppConfiguracion {
  id: string;

  profesionalId: string | null;

  numero: string;

  phoneNumberId: string;

  businessAccountId: string;

  activo: boolean;

  createdAt: string;
}


export interface WhatsAppConfiguracionRespuesta {
  conectado: boolean;

  profesionalId: string | null;

  configuracion:
    WhatsAppConfiguracion | null;
}


export interface GuardarWhatsAppConfiguracionRespuesta {
  success: boolean;

  message: string;

  configuracion:
    WhatsAppConfiguracion;
}


export interface DesconectarWhatsAppRespuesta {
  success: boolean;

  message: string;
}


export interface WhatsAppPruebaRespuesta {
  success: boolean;

  message: string;

  profesionalId?: string | null;

  metaResponse?: any;

  detalle?: string;
}


// =====================================================
// R2
// =====================================================

export interface SubirVideoAutomatizacionRespuesta {
  success: boolean;

  message: string;

  url: string;
}


@Injectable({
  providedIn: 'root'
})
export class AutomatizacionesService {

  private readonly apiBaseUrl =
    `${environment.apiUrl}/automatizaciones`;

  private readonly apiR2BaseUrl =
    `${environment.apiUrl}/r2`;

  private readonly apiWhatsAppBaseUrl =
    `${environment.apiUrl}/WhatsApp`;


  constructor(
    private http:
      HttpClient
  ) {}


  // =====================================================
  // WHATSAPP - OBTENER CONFIGURACIÓN
  //
  // null:
  // organización general
  //
  // GUID:
  // profesional específico
  // =====================================================

  obtenerConfiguracionWhatsApp(
    profesionalId:
      string | null = null
  ): Observable<WhatsAppConfiguracionRespuesta> {

    let params =
      new HttpParams();


    if (profesionalId) {
      params =
        params.set(
          'profesionalId',
          profesionalId
        );
    }


    return this.http
      .get<WhatsAppConfiguracionRespuesta>(
        `${this.apiWhatsAppBaseUrl}/configuracion`,
        {
          params
        }
      );
  }


  // =====================================================
  // WHATSAPP - GUARDAR
  // =====================================================

  guardarConfiguracionWhatsApp(
    payload:
      GuardarWhatsAppConfiguracionPayload
  ): Observable<GuardarWhatsAppConfiguracionRespuesta> {

    return this.http
      .put<GuardarWhatsAppConfiguracionRespuesta>(
        `${this.apiWhatsAppBaseUrl}/configuracion`,
        payload
      );
  }


  // =====================================================
  // WHATSAPP - DESCONECTAR
  // =====================================================

  desconectarWhatsApp(
    profesionalId:
      string | null = null
  ): Observable<DesconectarWhatsAppRespuesta> {

    let params =
      new HttpParams();


    if (profesionalId) {
      params =
        params.set(
          'profesionalId',
          profesionalId
        );
    }


    return this.http
      .delete<DesconectarWhatsAppRespuesta>(
        `${this.apiWhatsAppBaseUrl}/configuracion`,
        {
          params
        }
      );
  }


  // =====================================================
  // WHATSAPP - PRUEBA DE CONFIGURACIÓN REAL
  //
  // Usa:
  // profesional → fallback organización
  // =====================================================

  probarWhatsApp(
    numeroDestino: string,
    profesionalId:
      string | null = null,
    nombreTemplate:
      string = 'hello_world',
    codigoIdioma:
      string = 'en_US'
  ): Observable<WhatsAppPruebaRespuesta> {

    return this.http
      .post<WhatsAppPruebaRespuesta>(
        `${this.apiWhatsAppBaseUrl}/prueba-organizacion`,
        {
          profesionalId,
          numeroDestino,
          nombreTemplate,
          codigoIdioma
        }
      );
  }


  // =====================================================
  // R2 - VIDEO
  // =====================================================

  subirVideoAutomatizacion(
    archivo: File
  ): Observable<SubirVideoAutomatizacionRespuesta> {

    const formData =
      new FormData();


    formData.append(
      'archivo',
      archivo
    );


    return this.http
      .post<SubirVideoAutomatizacionRespuesta>(
        `${this.apiR2BaseUrl}/automatizaciones/video`,
        formData
      );
  }


  // =====================================================
  // AUTOMATIZACIONES - LISTAR
  // =====================================================

  listar():
    Observable<Automatizacion[]> {

    return this.http
      .get<Automatizacion[]>(
        this.apiBaseUrl
      );
  }


  // =====================================================
  // AUTOMATIZACIONES - OBTENER
  // =====================================================

  obtener(
    id: string
  ): Observable<Automatizacion> {

    return this.http
      .get<Automatizacion>(
        `${this.apiBaseUrl}/${id}`
      );
  }


  // =====================================================
  // AUTOMATIZACIONES - CREAR
  // =====================================================

  crear(
    payload:
      GuardarAutomatizacionPayload
  ): Observable<any> {

    return this.http
      .post(
        this.apiBaseUrl,
        payload
      );
  }


  // =====================================================
  // AUTOMATIZACIONES - ACTUALIZAR
  // =====================================================

  actualizar(
    id: string,
    payload:
      GuardarAutomatizacionPayload
  ): Observable<any> {

    return this.http
      .put(
        `${this.apiBaseUrl}/${id}`,
        payload
      );
  }


  // =====================================================
  // AUTOMATIZACIONES - DESACTIVAR
  // =====================================================

  desactivar(
    id: string
  ): Observable<any> {

    return this.http
      .delete(
        `${this.apiBaseUrl}/${id}`
      );
  }


  // =====================================================
  // AUTOMATIZACIONES - PRUEBA TURNO CREADO
  //
  // null:
  // prueba organización
  //
  // GUID:
  // prueba profesional + fallback
  // =====================================================

  probarTurnoCreado(
    numeroDestino: string,
    profesionalId:
      string | null = null
  ): Observable<any> {

    let params =
      new HttpParams();


    if (profesionalId) {
      params =
        params.set(
          'profesionalId',
          profesionalId
        );
    }


    return this.http
      .post(
        `${this.apiBaseUrl}/probar-turno-creado`,
        {
          numeroDestino
        },
        {
          params
        }
      );
  }
}