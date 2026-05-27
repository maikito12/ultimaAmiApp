import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  // 🔥 CAMBIÁ ESTO POR TU BACKEND (n8n / Spring / etc)
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 🔹 FERIADOS
  obtenerFeriados(): Observable<any[]> {
    const year = new Date().getFullYear();
    return this.http.get<any[]>(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`);
  }

  // 🔥 PROFESIONAL POR SLUG (tabla clientes)
  obtenerProfesional(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profesionales/${slug}`);
  }

  // 🔥 SUCURSALES DEL PROFESIONAL (tabla sucursales)
  obtenerSucursales(clienteId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sucursales?cliente_id=${clienteId}`);
  }

  // 🔥 TURNOS DISPONIBLES (NO usa cliente_id ❗)
  obtenerTurnos(profesionalId: string, sucursalId: string, fecha: string, dia: number): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}/turnos-disponibles?profesional_id=${profesionalId}&sucursal_id=${sucursalId}&dia_semana=${dia}&fecha=${fecha}`
  );
}

  // 🔥 RESERVAR TURNO (tabla turnos)
reservarTurno(payload: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/turnos`, payload);
}
}