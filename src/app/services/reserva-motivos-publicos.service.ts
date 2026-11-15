import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DisponibilidadMesPublica } from './reserva-publica.service';
import { environmentProduccion } from '../../environments/environment';


export interface MotivoPublico {
  id: string;
  nombre: string;
  precio: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReservaMotivosPublicosService {
  private readonly baseUrl = `${environmentProduccion.apiUrl}/publico/reserva`;
  constructor(private http: HttpClient) {}

  obtenerMotivos(slug: string, profesionalOrganizacionId: string,
    profesionalEspecialidadId: string): Observable<MotivoPublico[]> {
    const params = new HttpParams()
      .set('profesionalOrganizacionId', profesionalOrganizacionId)
      .set('profesionalEspecialidadId', profesionalEspecialidadId);
    return this.http.get<MotivoPublico[]>(
      `${this.baseUrl}/${encodeURIComponent(slug)}/motivos`, { params });
  }

  obtenerDisponibilidad(slug: string, profesionalOrganizacionId: string,
    profesionalEspecialidadId: string, sucursalId: string,
    anio: number, mes: number, motivoConsultaId: string | null): Observable<DisponibilidadMesPublica> {
    let params = new HttpParams()
      .set('profesionalOrganizacionId', profesionalOrganizacionId)
      .set('profesionalEspecialidadId', profesionalEspecialidadId)
      .set('sucursalId', sucursalId)
      .set('anio', String(anio)).set('mes', String(mes));
    if (motivoConsultaId) params = params.set('motivoConsultaId', motivoConsultaId);
    return this.http.get<DisponibilidadMesPublica>(
      `${this.baseUrl}/${encodeURIComponent(slug)}/disponibilidad`, { params });
  }
}
