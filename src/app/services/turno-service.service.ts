import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';



export interface MotivoConsultaInterno {
  id: string;
  nombre: string;
  precio: number | null;
  duracionMinutos: number | null;
}

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private readonly URL_BASE = `${environment.apiUrl}/Turnos`;

  constructor(private http: HttpClient) {}

  obtenerAgenda(filtro: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.URL_BASE}/agenda`, filtro);
  }

  obtenerDetalleTurno(turnoId: string): Observable<any> {
    return this.http.get<any>(`${this.URL_BASE}/${turnoId}`);
  }

  crearTurno(turno: any): Observable<any> {
    return this.http.post<any>(this.URL_BASE, turno);
  }

  actualizarTurno(turnoId: string, turno: any): Observable<any> {
    return this.http.put<any>(`${this.URL_BASE}/${turnoId}`, turno);
  }

  confirmarTurno(turnoId: string): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${turnoId}/confirmar`, {});
  }

  cancelarTurno(turnoId: string, motivo: string = ''): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${turnoId}/cancelar`, { motivo });
  }

  hacerCheckIn(turnoId: string): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${turnoId}/check-in`, {});
  }

  iniciarAtencion(turnoId: string): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${turnoId}/iniciar-atencion`, {});
  }

  finalizarAtencion(turnoId: string): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${turnoId}/finalizar`, {});
  }

  registrarNoAsistio(turnoId: string): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${turnoId}/no-asistio`, {});
  }

  eliminarTurno(turnoId: string): Observable<any> {
    return this.http.delete<any>(`${this.URL_BASE}/${turnoId}`);
  }

  // Prestaciones: centralizamos la llamada HTTP en el servicio.
  obtenerMotivosInternos(
    profesionalOrganizacionId: string,
    profesionalEspecialidadId: string
  ): Observable<MotivoConsultaInterno[]> {
    const params = new HttpParams()
      .set('profesionalOrganizacionId', profesionalOrganizacionId)
      .set('profesionalEspecialidadId', profesionalEspecialidadId);

    return this.http.get<MotivoConsultaInterno[]>(
      `${environment.apiUrl}/turnos-internos/motivos`,
      { params }
    );
  }
}
