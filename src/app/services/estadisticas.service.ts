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


export interface EstadisticasConsulta {
  desde?: string;
  hasta?: string;
  profesionalOrganizacionId?: string;
  sucursalId?: string;
  especialidadId?: string;
}


export interface EstadisticasKpis {
  turnosTotales: number;
  atendidos: number;
  cancelados: number;
  noAsistio: number;
  pendientes: number;
  confirmados: number;
  pacientesUnicos: number;
  pacientesQueVolvieron: number;
  porcentajeAsistencia: number;
  porcentajeCancelacion: number;
  porcentajeRetorno: number;
  promedioTurnosPorDia: number;
}


export interface EstadisticaEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
}


export interface EstadisticaOrigen {
  origen: string;
  cantidad: number;
  porcentaje: number;
}


export interface EstadisticaHorario {
  hora: string;
  cantidad: number;
  porcentaje: number;
}


export interface EstadisticaObraSocial {
  obraSocialId: string | null;
  nombre: string;
  cantidad: number;
  porcentaje: number;
}


export interface EstadisticaDia {
  fecha: string;
  cantidad: number;
}


export interface EstadisticaDiaSemana {
  diaNumero: number;
  dia: string;
  cantidad: number;
  porcentaje: number;
}


export interface EstadisticaProfesional {
  profesionalOrganizacionId: string;
  profesional: string;
  cantidad: number;
  atendidos: number;
  porcentajeDelTotal: number;
}


export interface EstadisticaSucursal {
  sucursalId: string;
  sucursal: string;
  cantidad: number;
  porcentaje: number;
}


export interface EstadisticaEspecialidad {
  especialidadId: string;
  especialidad: string;
  cantidad: number;
  porcentaje: number;
}


export interface EstadisticasResponse {
  desde: string;
  hasta: string;
  alcance: 'ORGANIZACION' | 'MI_AGENDA';
  kpis: EstadisticasKpis;
  porEstado: EstadisticaEstado[];
  porOrigen: EstadisticaOrigen[];
  porHorario: EstadisticaHorario[];
  porObraSocial: EstadisticaObraSocial[];
  porDia: EstadisticaDia[];
  porDiaSemana: EstadisticaDiaSemana[];
  porProfesional: EstadisticaProfesional[];
  porSucursal: EstadisticaSucursal[];
  porEspecialidad: EstadisticaEspecialidad[];
}


export interface EstadisticaFiltroOpcion {
  id: string;
  nombre: string;
}


export interface EstadisticasFiltrosResponse {
  profesionales: EstadisticaFiltroOpcion[];
  sucursales: EstadisticaFiltroOpcion[];
  especialidades: EstadisticaFiltroOpcion[];
}


@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  private readonly url =
    `${environment.apiUrl}/estadisticas`;


  constructor(
    private readonly http:
      HttpClient
  ) {}


  obtener(
    filtro:
      EstadisticasConsulta
  ): Observable<EstadisticasResponse> {

    let params =
      new HttpParams();


    if (filtro.desde) {
      params =
        params.set(
          'desde',
          filtro.desde
        );
    }


    if (filtro.hasta) {
      params =
        params.set(
          'hasta',
          filtro.hasta
        );
    }


    if (
      filtro.profesionalOrganizacionId
    ) {
      params =
        params.set(
          'profesionalOrganizacionId',
          filtro.profesionalOrganizacionId
        );
    }


    if (filtro.sucursalId) {
      params =
        params.set(
          'sucursalId',
          filtro.sucursalId
        );
    }


    if (filtro.especialidadId) {
      params =
        params.set(
          'especialidadId',
          filtro.especialidadId
        );
    }


    return this.http
      .get<EstadisticasResponse>(
        this.url,
        {
          params
        }
      );
  }


  obtenerFiltros():
    Observable<EstadisticasFiltrosResponse> {

    return this.http
      .get<EstadisticasFiltrosResponse>(
        `${this.url}/filtros`
      );
  }
}
