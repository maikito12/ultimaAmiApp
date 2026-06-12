import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardHome } from '../interfaces/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = 'https://localhost:7203/api';

  constructor(private http: HttpClient) {}

  // Llama al DashboardController -> Obtiene stats y cumples
  obtenerDatosHome(): Observable<DashboardHome> {
    return this.http.get<DashboardHome>(`${this.baseUrl}/dashboard/home`);
  }

  // Llama al TurnosController -> Obtiene la lista de turnos (filtrada por hoy)
  obtenerTurnosHoy(): Observable<any[]> {
    // Usamos el parámetro soloHoy=true que configuramos en el backend
    return this.http.get<any[]>(`${this.baseUrl}/turnos?soloHoy=true`);
  }
}