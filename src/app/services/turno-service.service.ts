import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  private readonly URL_BASE =
    `${environment.apiUrl}/Turnos`;

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // AGENDA
  // ==========================================

  obtenerAgenda(filtro: any): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.URL_BASE}/agenda`,
      filtro
    );
  }


  // ==========================================
  // DETALLE
  // ==========================================

  obtenerDetalleTurno(
    turnoId: string
  ): Observable<any> {

    return this.http.get<any>(
      `${this.URL_BASE}/${turnoId}`
    );
  }


  // ==========================================
  // CREAR
  // ==========================================

  crearTurno(
    turno: any
  ): Observable<any> {

    return this.http.post<any>(
      this.URL_BASE,
      turno
    );
  }


  // ==========================================
  // REPROGRAMAR / EDITAR
  // ==========================================

  actualizarTurno(
    turnoId: string,
    turno: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.URL_BASE}/${turnoId}`,
      turno
    );
  }


  // ==========================================
  // CONFIRMAR
  // ==========================================

  confirmarTurno(
    turnoId: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.URL_BASE}/${turnoId}/confirmar`,
      {}
    );
  }


  // ==========================================
  // CANCELAR
  // ==========================================

  cancelarTurno(
    turnoId: string,
    motivo: string = ''
  ): Observable<any> {

    return this.http.post<any>(
      `${this.URL_BASE}/${turnoId}/cancelar`,
      {
        motivo
      }
    );
  }


  // ==========================================
  // CHECK-IN
  // ==========================================

  hacerCheckIn(
    turnoId: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.URL_BASE}/${turnoId}/check-in`,
      {}
    );
  }


  // ==========================================
  // INICIAR ATENCIÓN
  // ==========================================

  iniciarAtencion(
    turnoId: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.URL_BASE}/${turnoId}/iniciar-atencion`,
      {}
    );
  }


  // ==========================================
  // FINALIZAR
  // ==========================================

  finalizarAtencion(
    turnoId: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.URL_BASE}/${turnoId}/finalizar`,
      {}
    );
  }


  // ==========================================
  // NO ASISTIÓ
  // ==========================================

  registrarNoAsistio(
    turnoId: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.URL_BASE}/${turnoId}/no-asistio`,
      {}
    );
  }


  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminarTurno(
    turnoId: string
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.URL_BASE}/${turnoId}`
    );
  }

  
}