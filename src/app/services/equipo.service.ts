import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export type RolEquipoBackend =
  | number
  | 'Admin'
  | 'Profesional'
  | 'Secretaria'
  | string;


export interface IntegranteEquipo {
  // ID de usuario_organizacion.
  id: string;

  usuarioId: string;

  nombre: string;

  email: string;

  rol: RolEquipoBackend;

  activo: boolean;

  profesionalOrganizacionId:
    string | null;

  createdAt: string;
}


export interface EquipoLimites {
  maxProfesionales: number;

  maxSecretarias: number;

  maxUsuarios: number;

  profesionalesActuales: number;

  secretariasActuales: number;

  usuariosActuales: number;
}


export interface EquipoResponse {
  limites: EquipoLimites;

  integrantes: IntegranteEquipo[];
}


export interface DesactivarIntegranteResponse {
  success: boolean;

  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class EquipoService {

  private readonly apiUrl =
    `${environment.apiUrl}/equipo`;


  constructor(
    private readonly http:
      HttpClient
  ) {}


  // ==========================================
  // OBTENER EQUIPO + LÍMITES
  // ==========================================

  obtenerEquipo():
    Observable<EquipoResponse> {

    return this.http
      .get<EquipoResponse>(
        this.apiUrl
      );

  }


  // ==========================================
  // DESACTIVAR MEMBRESÍA
  // ==========================================

  desactivarIntegrante(
    membresiaId:
      string
  ): Observable<DesactivarIntegranteResponse> {

    return this.http
      .put<DesactivarIntegranteResponse>(
        `${this.apiUrl}/${membresiaId}/desactivar`,
        {}
      );

  }

}
