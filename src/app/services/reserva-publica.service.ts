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
import { environmentProduccion } from '../../environments/environment';

export type EstadoDisponibilidadPublica =
  | 'muchos'
  | 'pocos'
  | 'sin-turnos'
  | 'sin-atencion';

export interface DisponibilidadDiaPublica {
  fecha: string;
  estado: EstadoDisponibilidadPublica;
  cantidadTurnos: number;
  fueraDeRango: boolean;
  horarios: string[];
}

export interface CrearReservaPublicaPayload {
  profesionalOrganizacionId: string;
  profesionalEspecialidadId: string;
  sucursalId: string;

  fecha: string;
  hora: string;

  nombre: string;
  apellido: string;
  dni: string;
genero: string | null;

  email: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;

  obraSocialId: string | null;
  obraSocialNombre: string | null;
  numeroAfiliado: string | null;

  atencionParticular: boolean;

  motivoConsulta: string | null;
  observaciones: string | null;

  aceptaCondicionesReservaYPrivacidad: boolean;
}

export interface CrearReservaPublicaRespuesta {
  ok: boolean;
  turnoId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  requiereConfirmacion: boolean;
  message: string;
}

export interface DisponibilidadMesPublica {
  anio: number;
  mes: number;
  duracionTurno: number;
  diasMaximosAnticipacion: number;
  dias: DisponibilidadDiaPublica[];
}

export interface ConfiguracionReservaPublica {
  permitirReservaOnline: boolean;
  diasMaximosAnticipacion: number;
  permitirElegirProfesional: boolean;
  permitirElegirSucursal: boolean;
  requiereConfirmacion: boolean;

  solicitarDni: boolean;
  solicitarEmail: boolean;
  solicitarTelefono: boolean;
  solicitarFechaNacimiento: boolean;
  solicitarObraSocial: boolean;
  solicitarMotivoConsulta: boolean;
  solicitarObservaciones: boolean;

  tituloReserva: string | null;
  descripcionReserva: string | null;
}

export interface EspecialidadPublica {
  id: string;
  nombre: string;
  color: string | null;
  icono: string | null;
}

export interface SucursalReservaPublica {
  id: string;
  nombre: string;
  calle: string;
  altura: string;
  pisoDepto: string | null;
  ciudad: string;
  fotoUrl: string | null;
  latitud: number | null;
  longitud: number | null;
  direccion: string;
}

export interface ObraSocialReservaPublica {
  id: string;
  nombre: string;
  siglas: string | null;
}

export interface ProfesionalReservaPublica {
  profesionalId: string;
  profesionalOrganizacionId: string;
  profesionalEspecialidadId: string;

  nombre: string;
  matricula: string | null;
  slug: string | null;
  fotoUrl: string | null;
  descripcion: string | null;

  especialidadId: string;
  especialidad: string;
  duracionTurno: number;

  sucursales: SucursalReservaPublica[];
  obrasSociales: ObraSocialReservaPublica[];
}

export interface ReservaPublicaInicial {
  organizacionId: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  colorPrincipal: string;
  colorSecundario: string;

  configuracion: ConfiguracionReservaPublica;
  especialidades: EspecialidadPublica[];
  obrasSociales: ObraSocialReservaPublica[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservaPublicaService {

private readonly apiBaseUrl =
  `${environmentProduccion.apiUrl}/publico/reserva`;

  constructor(
    private http: HttpClient
  ) {}

  obtenerInicial(
    slug: string
  ): Observable<ReservaPublicaInicial> {

    return this.http
      .get<ReservaPublicaInicial>(
        `${this.apiBaseUrl}/${encodeURIComponent(slug)}`
      );
  }

  obtenerProfesionales(
    slug: string,
    especialidadId: string
  ): Observable<ProfesionalReservaPublica[]> {

    const params =
      new HttpParams()
        .set(
          'especialidadId',
          especialidadId
        );

    return this.http
      .get<ProfesionalReservaPublica[]>(
        `${this.apiBaseUrl}/${encodeURIComponent(slug)}/profesionales`,
        {
          params
        }
      );
  }

  obtenerDisponibilidad(
    slug: string,
    profesionalOrganizacionId: string,
    profesionalEspecialidadId: string,
    sucursalId: string,
    anio: number,
    mes: number
  ): Observable<DisponibilidadMesPublica> {

    const params =
      new HttpParams()
        .set(
          'profesionalOrganizacionId',
          profesionalOrganizacionId
        )
        .set(
          'profesionalEspecialidadId',
          profesionalEspecialidadId
        )
        .set(
          'sucursalId',
          sucursalId
        )
        .set(
          'anio',
          anio.toString()
        )
        .set(
          'mes',
          mes.toString()
        );

    return this.http.get<DisponibilidadMesPublica>(
      `${this.apiBaseUrl}/${encodeURIComponent(slug)}/disponibilidad`,
      {
        params
      }
    );
  }

  crearTurno(
    slug: string,
    payload: CrearReservaPublicaPayload
  ): Observable<CrearReservaPublicaRespuesta> {

    return this.http.post<CrearReservaPublicaRespuesta>(
      `${this.apiBaseUrl}/${encodeURIComponent(slug)}/turno`,
      payload
    );
  }
}
