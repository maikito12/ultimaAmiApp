
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  FiltroEstadisticas,
  DashboardEstadisticasResponse
} from '../interfaces/estadisticas';

import { environmentProduccion } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  private readonly apiUrl =
    `${environmentProduccion.apiUrl}/estadisticas`;

  constructor(private http: HttpClient) {}

  obtenerDatosDashboard(
    filtros: FiltroEstadisticas
  ): Observable<DashboardEstadisticasResponse> {

    return this.http.post<DashboardEstadisticasResponse>(
      `${this.apiUrl}/dashboard`,
      filtros
    );

  }
}
