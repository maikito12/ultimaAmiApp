import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';

export interface ContextoReagendamiento {
  ok: boolean;
  turnoId: string;
  organizacionNombre: string;
  organizacionSlug: string;
  logoUrl: string | null;
  colorPrincipal: string | null;
  colorSecundario: string | null;
  profesionalOrganizacionId: string;
  profesionalEspecialidadId: string;
  sucursalId: string;
  profesional: string;
  especialidad: string;
  sucursal: string;
  fechaActual: string;
  horaActual: string;
}

export interface ResultadoReagendamiento {
  ok: boolean;
  turnoId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ReagendamientoPublicoService {
  // Corresponde al controller incluido en /backend.
  private readonly base = `${environmentProduccion.apiUrl}/publico/reagendamiento`;

  constructor(private readonly http: HttpClient) {}

  contexto(token: string): Observable<ContextoReagendamiento> {
    return this.http.get<ContextoReagendamiento>(`${this.base}/contexto`, {
      params: new HttpParams().set('token', token)
    });
  }

  confirmar(token: string, fecha: string, hora: string): Observable<ResultadoReagendamiento> {
    return this.http.post<ResultadoReagendamiento>(
      `${this.base}/confirmar`,
      { fecha, hora },
      { params: new HttpParams().set('token', token) }
    );
  }
}
