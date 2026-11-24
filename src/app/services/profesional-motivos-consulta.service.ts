import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';




export interface MotivoConsulta {
  id: string;
  profesionalOrganizacionId: string;
  profesionalEspecialidadId: string;
  nombre: string;
  duracionMinutos: number | null;
  precio: number | null;
  orden: number;
  activo: boolean;
  sucursalIds: string[];
}

export interface CrearMotivoConsulta {
  profesionalOrganizacionId: string;
  profesionalEspecialidadId: string;
  nombre: string;
  duracionMinutos: number | null;
  precio: number | null;
  orden: number;
  // Se admite omitirlo solo para compatibilidad con llamadas antiguas.
  sucursalIds?: string[];
}

export type ActualizarMotivoConsulta = Omit<CrearMotivoConsulta, 'profesionalOrganizacionId'>;

// Representa un horario habitual existente del profesional para la especialidad del motivo.
export interface HorarioDisponibleMotivo {
  horarioAtencionId: string;
  sucursalId: string;
  sucursalNombre: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface FranjaMotivo {
  id: string;
  horarioAtencionId: string;
  horaInicio: string;
  horaFin: string;
  exclusivo: boolean;
}

export interface GuardarFranjaMotivo {
  horarioAtencionId: string;
  horaInicio: string;
  horaFin: string;
  exclusivo: boolean;
}

export interface GuardarFranjasMotivo {
  franjas: GuardarFranjaMotivo[];
}

@Injectable({ providedIn: 'root' })
export class ProfesionalMotivosConsultaService {
  private readonly url = `${environmentProduccion.apiUrl}/ProfesionalMotivosConsulta`;

  constructor(private http: HttpClient) {}

  listar(profesionalOrganizacionId: string): Observable<MotivoConsulta[]> {
    return this.http.get<MotivoConsulta[]>(`${this.url}/${profesionalOrganizacionId}`);
  }

  crear(dto: CrearMotivoConsulta): Observable<MotivoConsulta> {
    return this.http.post<MotivoConsulta>(this.url, dto);
  }

  actualizar(id: string, dto: ActualizarMotivoConsulta): Observable<MotivoConsulta> {
    return this.http.put<MotivoConsulta>(`${this.url}/${id}`, dto);
  }

  cambiarEstado(id: string, activo: boolean): Observable<MotivoConsulta> {
    return this.http.patch<MotivoConsulta>(`${this.url}/${id}/estado`, { activo });
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  obtenerHorariosDisponibles(motivoId: string): Observable<HorarioDisponibleMotivo[]> {
    return this.http.get<HorarioDisponibleMotivo[]>(`${this.url}/${motivoId}/horarios-disponibles`);
  }

  obtenerFranjas(motivoId: string): Observable<FranjaMotivo[]> {
    return this.http.get<FranjaMotivo[]>(`${this.url}/${motivoId}/franjas`);
  }

  guardarFranjas(motivoId: string, dto: GuardarFranjasMotivo): Observable<FranjaMotivo[]> {
    return this.http.put<FranjaMotivo[]>(`${this.url}/${motivoId}/franjas`, dto);
  }
}
