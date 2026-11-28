import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DisponibilidadMesPublica,
  ReservaPublicaService
} from './reserva-publica.service';
import { environmentProduccion } from '../../environments/environment';



export interface MotivoPublico {
  id: string;
  nombre: string;
  precio: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaMotivosPublicosService {

  private readonly baseUrl =
    `${environmentProduccion.apiUrl}/publico/reserva`;

  constructor(
    private http: HttpClient,
    private reservaPublicaService: ReservaPublicaService
  ) {}

  // ==========================================
  // OBTENER MOTIVOS DE CONSULTA
  // ==========================================

  obtenerMotivos(
    slug: string,
    profesionalOrganizacionId: string,
    profesionalEspecialidadId: string,
    sucursalId?: string
  ): Observable<MotivoPublico[]> {

    let params = new HttpParams()
      .set(
        'profesionalOrganizacionId',
        profesionalOrganizacionId
      )
      .set(
        'profesionalEspecialidadId',
        profesionalEspecialidadId
      );

    if (sucursalId) {
      params = params.set(
        'sucursalId',
        sucursalId
      );
    }

    return this.http.get<MotivoPublico[]>(
      `${this.baseUrl}/${encodeURIComponent(slug)}/motivos`,
      { params }
    );
  }

  // ==========================================
  // DISPONIBILIDAD SEGÚN MOTIVO
  // ==========================================

  obtenerDisponibilidad(
    slug: string,
    profesionalOrganizacionId: string,
    profesionalEspecialidadId: string,
    sucursalId: string,
    anio: number,
    mes: number,
    motivoConsultaId: string | null
  ): Observable<DisponibilidadMesPublica> {

    return this.reservaPublicaService.obtenerDisponibilidad(
      slug,
      profesionalOrganizacionId,
      profesionalEspecialidadId,
      sucursalId,
      anio,
      mes,
      motivoConsultaId
    );
  }
}