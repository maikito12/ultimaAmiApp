import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltroEstadisticas,DashboardEstadisticasResponse } from '../interfaces/estadisticas';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  
  // Cambiá esto por la URL real de tu API Gateway o Backend de C#
  private apiUrl = 'https://localhost:7001/api/estadisticas'; 

  constructor(private http: HttpClient) {}

  // Recibe los filtros del panel y trae toda la data consolidada de C#
  obtenerDatosDashboard(filtros: FiltroEstadisticas): Observable<DashboardEstadisticasResponse> {
    return this.http.post<DashboardEstadisticasResponse>(`${this.apiUrl}/dashboard`, filtros);
  }
}