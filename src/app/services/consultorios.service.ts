import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';

export interface Consultorio {
  id: string;
  organizacionId: string;
  sucursalId: string;
  nombre: string;
  piso: string | null;
  activo: boolean;
  ocupado: boolean;
  profesionalOrganizacionId: string | null;
  nombreProfesional: string | null;
  ocupadoDesde: string | null;
}
export interface CrearConsultorio {
  sucursalId: string;
  nombre: string;
  piso: string | null;
}
export interface ActualizarConsultorio {
  nombre: string;
  piso: string | null;
  activo: boolean;
}
export interface OcuparConsultorio {
  sucursalId: string;
  consultorioId: string;
}
export interface ConsultorioOcupacion {
  ocupacionId: string;
  consultorioId: string;
  sucursalId: string;
  profesionalOrganizacionId: string;
  nombreConsultorio: string;
  piso: string | null;
  inicioAt: string;
  finAt: string | null;
  activa: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConsultoriosService {
  private readonly baseUrl = `${environmentProduccion.apiUrl}`;
  constructor(private readonly http: HttpClient) {}
  obtenerPorSucursal(sucursalId: string): Observable<Consultorio[]> {
    return this.http.get<Consultorio[]>(`${this.baseUrl}/Consultorios/sucursal/${sucursalId}`);
  }
  crear(data: CrearConsultorio): Observable<Consultorio> {
    return this.http.post<Consultorio>(`${this.baseUrl}/Consultorios`, data);
  }
  actualizar(id: string, data: ActualizarConsultorio): Observable<Consultorio> {
    return this.http.put<Consultorio>(`${this.baseUrl}/Consultorios/${id}`, data);
  }
  obtenerMiOcupacion(): Observable<ConsultorioOcupacion | null> {
    return this.http.get<ConsultorioOcupacion | null>(`${this.baseUrl}/ConsultorioOcupaciones/mi-ocupacion`);
  }
  ocupar(data: OcuparConsultorio): Observable<ConsultorioOcupacion> {
    return this.http.post<ConsultorioOcupacion>(`${this.baseUrl}/ConsultorioOcupaciones/ocupar`, data);
  }
  finalizar(): Observable<ConsultorioOcupacion> {
    return this.http.post<ConsultorioOcupacion>(`${this.baseUrl}/ConsultorioOcupaciones/finalizar`, {});
  }
  liberarPorAdmin(consultorioId: string): Observable<ConsultorioOcupacion> {
    return this.http.post<ConsultorioOcupacion>(`${this.baseUrl}/ConsultorioOcupaciones/${consultorioId}/liberar`, {});
  }
}
