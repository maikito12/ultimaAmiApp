import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // 🔥 CAMBIÁ ESTO POR TU URL REAL (n8n o backend)
  private apiUrl = 'https://tu-api.com'; 

  constructor(private http: HttpClient) {}

  // 🔹 TRAER TURNOS DEL PROFESIONAL
  obtenerTurnos(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/turnos?cliente_id=${clienteId}`);
  }

  // 🔹 CANCELAR TURNO
  cancelarTurno(turnoId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/turnos/${turnoId}`);
  }

  // 🔹 TRAER CLIENTES
  obtenerClientes(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes?cliente_id=${clienteId}`);
  }

  // 🔹 ESTADÍSTICAS
  obtenerEstadisticas(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas?cliente_id=${clienteId}`);
  }

}