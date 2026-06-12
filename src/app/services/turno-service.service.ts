import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  private readonly URL_BASE = 'https://localhost:7203/api';

  constructor(private http: HttpClient) {}

  // =========================
  // TURNOS
  // =========================

  obtenerTurnos(soloHoy: boolean = false): Observable<any[]> {
    let params = new HttpParams();
    if (soloHoy) {
      params = params.set('soloHoy', 'true');
    }
    return this.http.get<any[]>(`${this.URL_BASE}`, { params });
  }

  obtenerDetalleTurno(turnoId: string): Observable<any> {
    return this.http.get<any>(`${this.URL_BASE}/${turnoId}`);
  }

  actualizarEstadoTurno(turnoData: { id: string; estado: string }): Observable<any> {
    return this.http.post(`${this.URL_BASE}/actualizar-estado`, turnoData);
  }

  cancelarTurno(turnoId: string, motivo: string = ''): Observable<any> {
    return this.http.post(`${this.URL_BASE}/cancelar/${turnoId}`, { motivo });
  }

  finalizarAtencion(data: any): Observable<any> {
    return this.http.post(`${this.URL_BASE}/finalizar-atencion`, data);
  }










}