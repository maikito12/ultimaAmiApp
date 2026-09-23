import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// ==========================================================
// BLOQUEO DE AGENDA
// ==========================================================

export interface BloqueoAgenda {
  id: string;
  profesionalOrganizacionId: string;
  sucursalId: string | null;
  sucursal: string | null;
  fechaDesde: string;
  fechaHasta: string;
  horaDesde: string | null;
  horaHasta: string | null;
  todoElDia: boolean;
  tipo: string;
  motivo: string | null;
  activo: boolean;
  createdAt: string;
}


// ==========================================================
// CREAR BLOQUEO
// ==========================================================

export interface CrearBloqueoAgendaPayload {
  sucursalId: string | null;
  fechaDesde: string;
  fechaHasta: string;
  horaDesde: string | null;
  horaHasta: string | null;
  todoElDia: boolean;
  motivo: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class BloqueosAgendaService {

  private readonly apiUrl =
    `${environment.apiUrl}/BloqueosAgenda`;

  constructor(
    private http: HttpClient
  ) {}


  obtenerMisBloqueos():
    Observable<BloqueoAgenda[]> {

    return this.http.get<BloqueoAgenda[]>(
      this.apiUrl
    );
  }


  crear(
    payload: CrearBloqueoAgendaPayload
  ): Observable<BloqueoAgenda> {

    return this.http.post<BloqueoAgenda>(
      this.apiUrl,
      payload
    );
  }


  eliminar(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}