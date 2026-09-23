import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../environments/environment';


export type RolInicio =
  | 'ADMIN'
  | 'PROFESIONAL'
  | 'SECRETARIA';


export type VistaInicio =
  | 'ORGANIZACION'
  | 'MI_AGENDA';


export interface DashboardHomeStats {
  turnosHoy: number;
  pacientesTotal: number;
  turnosAtendidosHoy: number;
  pendientesHoy: number;
  porcentajeAtendidos: number;
  profesionalesActivos: number;
}


export interface DashboardHomeTurno {
  id: string;
  hora: string;
  paciente: string;
  profesional: string;
  especialidad: string;
  sucursal: string;
  estado:
    | 'Pendiente'
    | 'Confirmado'
    | 'En sala'
    | 'En atención'
    | 'Atendido'
    | 'Cancelado'
    | 'No asistió';
  telefono?: string | null;
}


export interface DashboardHomeCumple {
  id: string;
  paciente: string;
  edad?: number | null;
  telefono?: string | null;
}


export interface DashboardHomeResponse {
  nombreUsuario: string;
  rol: RolInicio;
  esProfesional: boolean;
  puedeCambiarVista: boolean;
  vista: VistaInicio;
  fecha: string;
  stats: DashboardHomeStats;
  proximosTurnos: DashboardHomeTurno[];
  cumplesHoy: DashboardHomeCumple[];
}


@Injectable({
  providedIn: 'root'
})
export class DashboardHomeService {

  private readonly url =
    `${environment.apiUrl}/dashboard/home`;


  constructor(
    private readonly http:
      HttpClient
  ) {}


  obtener(
    vista?: VistaInicio
  ): Observable<DashboardHomeResponse> {

    let params =
      new HttpParams();


    if (vista) {

      params =
        params.set(
          'vista',
          vista === 'MI_AGENDA'
            ? 'mi-agenda'
            : 'organizacion'
        );

    }


    return this.http.get<DashboardHomeResponse>(
      this.url,
      {
        params
      }
    );
  }
}
