import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// ==========================================================
// MI PERFIL PROFESIONAL
// ==========================================================

export interface MiPerfilProfesional {

  id: string;

  nombrePublico: string | null;

  matricula: string | null;

  fotoUrl: string | null;

  descripcion: string | null;

  duracionTurnoDefault: number;

  perfilCompleto: boolean;

}


// ==========================================================
// ACTUALIZAR MI PERFIL
// ==========================================================

export interface UpdateMiPerfilProfesional {

  nombrePublico: string | null;

  matricula: string | null;

  fotoUrl: string | null;

  descripcion: string | null;

  duracionTurnoDefault: number;

}


// ==========================================================
// ESTADO DE CONFIGURACIÓN
// ==========================================================

export interface EstadoConfiguracionProfesional {

  perfilCompleto: boolean;

  tieneEspecialidades: boolean;

  tieneSucursales: boolean;

  tieneHorarios: boolean;

  porcentaje: number;

  siguientePaso: number;

}


// ==========================================================
// RESPUESTA API GENÉRICA
// ==========================================================

export interface ApiResponse<T> {

  success: boolean;

  message: string;

  data: T | null;

}


// ==========================================================
// RESULTADO PAGINADO
// ==========================================================

export interface PagedResult<T> {

  items: T[];

  page: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;

}


// ==========================================================
// PROFESIONAL - ORGANIZACIÓN
// ==========================================================

export interface MiOrganizacionProfesional {

  // IMPORTANTE:
  // Este ID corresponde a profesional_organizacion.id
  id: string;

  organizacion: string;

  logo: string | null;

  rol: string;

  activo: boolean;

}


// ==========================================================
// RESPUESTA AL CONVERTIRME EN PROFESIONAL
// ==========================================================

export interface ConvertirmeProfesionalResponse {

  profesionalOrganizacionId: string;

}


// ==========================================================
// ESPECIALIDAD DEL PROFESIONAL
// ==========================================================

export interface ProfesionalEspecialidad {

  id: string;

  especialidadId: string;

  especialidad: string;

  duracionTurno: number;

  activo: boolean;

}


// ==========================================================
// ESPECIALIDAD A GUARDAR
// ==========================================================

export interface EspecialidadSeleccionada {

  especialidadId: string;

  duracionTurno: number;

}


// ==========================================================
// GUARDAR ESPECIALIDADES
// ==========================================================

export interface GuardarProfesionalEspecialidades {

  profesionalOrganizacionId: string;

  especialidades: EspecialidadSeleccionada[];

}

// ==========================================================
// SUCURSAL DEL PROFESIONAL
// ==========================================================

export interface ProfesionalSucursal {

  id: string;

  sucursalId: string;

  sucursal: string;

  activo: boolean;

}


// ==========================================================
// SUCURSAL A GUARDAR
// ==========================================================

export interface SucursalSeleccionada {

  sucursalId: string;

}


// ==========================================================
// GUARDAR SUCURSALES DEL PROFESIONAL
// ==========================================================

export interface GuardarProfesionalSucursales {

  profesionalOrganizacionId: string;

  sucursales: SucursalSeleccionada[];

}

// ==========================================================
// HORARIO DEL PROFESIONAL
// ==========================================================

export interface HorarioProfesional {

  id: string;

  profesionalOrganizacionId: string;

  profesionalEspecialidadId: string;

  sucursalId: string;

  diaSemana: number;

  horaInicio: string;

  horaFin: string;

}


// ==========================================================
// CREAR HORARIO DEL PROFESIONAL
// ==========================================================

export interface CreateHorarioProfesional {

  profesionalOrganizacionId: string;

  profesionalEspecialidadId: string;

  sucursalId: string;

  diaSemana: number;

  horaInicio: string;

  horaFin: string;

}


// ==========================================================
// ACTUALIZAR HORARIO DEL PROFESIONAL
// ==========================================================

export interface UpdateHorarioProfesional {

  profesionalOrganizacionId: string;

  profesionalEspecialidadId: string;

  sucursalId: string;

  diaSemana: number;

  horaInicio: string;

  horaFin: string;

}

// ==========================================================
// OBRA SOCIAL DEL PROFESIONAL
// ==========================================================

export interface ProfesionalObraSocial {
  id: string;
  nombre: string;
}


// ==========================================================
// GUARDAR OBRAS SOCIALES DEL PROFESIONAL
// ==========================================================

export interface GuardarProfesionalObrasSociales {
  profesionalOrganizacionId: string;
  obrasSocialesIds: string[];
}


// ==========================================================
// RESPUESTA GUARDAR OBRAS SOCIALES
// ==========================================================

export interface GuardarObrasSocialesResponse {
  message: string;
}

export interface UploadImagenResponse {
  success: boolean;
  url: string;
  publicId: string;
}


// ==========================================================
// MI CONFIGURACIÓN DE RESERVA ONLINE
// ==========================================================

export interface MiReservaOnline {
  aceptaTurnosOnline: boolean;
  mostrarEnReservaOnline: boolean;
}


// ==========================================================
// PROFESIONAL - ORGANIZACIÓN RESUMEN
// ==========================================================

export interface ProfesionalOrganizacionResumen {

  id: string;

  profesionalId: string;

  profesional: string;

  consultorio: string | null;

  aceptaTurnosOnline: boolean;

  activo: boolean;
}
// ==========================================================
// SERVICE
// ==========================================================

@Injectable({
  providedIn: 'root'
})
export class ProfesionalService {


  // ========================================================
  // URLS
  // ========================================================

  private readonly apiBaseUrl =
   `${environment.apiUrl}`;


  private readonly profesionalesUrl =
    `${this.apiBaseUrl}/Profesionales`;


  private readonly profesionalOrganizacionUrl =
    `${this.apiBaseUrl}/ProfesionalOrganizacion`;


  private readonly profesionalEspecialidadUrl =
    `${this.apiBaseUrl}/ProfesionalEspecialidad`;

private readonly profesionalSucursalUrl =
  `${this.apiBaseUrl}/ProfesionalSucursal`;
private readonly horarioUrl =
  `${this.apiBaseUrl}/Horario`;

  private readonly profesionalObraSocialUrl =
  `${this.apiBaseUrl}/profesionales-obras-sociales`;
  // ========================================================
  // CONSTRUCTOR
  // ========================================================

  constructor(
    private http: HttpClient
  ) {}


  // ========================================================
  // CONVERTIRME EN PROFESIONAL
  // ========================================================

  convertirme():
    Observable<ConvertirmeProfesionalResponse> {

    return this.http.post<ConvertirmeProfesionalResponse>(
      `${this.profesionalOrganizacionUrl}/convertirme`,
      {}
    );

  }


  // ========================================================
  // MIS ORGANIZACIONES COMO PROFESIONAL
  // ========================================================

  obtenerMisOrganizaciones():
    Observable<MiOrganizacionProfesional[]> {

    return this.http.get<MiOrganizacionProfesional[]>(
      `${this.profesionalOrganizacionUrl}/mis-organizaciones`
    );

  }


  // ========================================================
  // OBTENER MI PERFIL
  // ========================================================

  obtenerMiPerfil():
    Observable<MiPerfilProfesional> {

    return this.http.get<MiPerfilProfesional>(
      `${this.profesionalesUrl}/mi-perfil`
    );

  }


  // ========================================================
  // ACTUALIZAR MI PERFIL
  // ========================================================

  actualizarMiPerfil(
    data: UpdateMiPerfilProfesional
  ): Observable<MiPerfilProfesional> {

    return this.http.put<MiPerfilProfesional>(
      `${this.profesionalesUrl}/mi-perfil`,
      data
    );

  }


  // ========================================================
  // ESTADO DE CONFIGURACIÓN
  // ========================================================

  obtenerEstadoConfiguracion():
    Observable<EstadoConfiguracionProfesional> {

    return this.http.get<EstadoConfiguracionProfesional>(
      `${this.profesionalesUrl}/estado-configuracion`
    );

  }


  // ========================================================
  // ESPECIALIDADES DEL PROFESIONAL
  // ========================================================

  obtenerProfesionalEspecialidades(
    profesionalOrganizacionId: string
  ): Observable<ProfesionalEspecialidad[]> {

    return this.http.get<ProfesionalEspecialidad[]>(
      `${this.profesionalEspecialidadUrl}/${profesionalOrganizacionId}`
    );

  }


  // ========================================================
  // GUARDAR ESPECIALIDADES DEL PROFESIONAL
  // ========================================================

  guardarProfesionalEspecialidades(
    data: GuardarProfesionalEspecialidades
  ): Observable<void> {

    return this.http.put<void>(
      this.profesionalEspecialidadUrl,
      data
    );

  }
// ========================================================
// SUCURSALES DEL PROFESIONAL
// ========================================================

obtenerProfesionalSucursales(
  profesionalOrganizacionId: string
): Observable<ProfesionalSucursal[]> {

  return this.http.get<ProfesionalSucursal[]>(
    `${this.profesionalSucursalUrl}/${profesionalOrganizacionId}`
  );

}


// ========================================================
// GUARDAR SUCURSALES DEL PROFESIONAL
// ========================================================

guardarProfesionalSucursales(
  data: GuardarProfesionalSucursales
): Observable<void> {

  return this.http.put<void>(
    this.profesionalSucursalUrl,
    data
  );

}

// ========================================================
// HORARIOS DEL PROFESIONAL
// ========================================================

obtenerHorariosProfesional():
  Observable<HorarioProfesional[]> {

  return this.http.get<HorarioProfesional[]>(
    this.horarioUrl
  );

}


// ========================================================
// CREAR HORARIO
// ========================================================

crearHorarioProfesional(
  data: CreateHorarioProfesional
): Observable<HorarioProfesional> {

  return this.http.post<HorarioProfesional>(
    this.horarioUrl,
    data
  );

}


// ========================================================
// ACTUALIZAR HORARIO
// ========================================================

actualizarHorarioProfesional(
  id: string,
  data: UpdateHorarioProfesional
): Observable<HorarioProfesional> {

  return this.http.put<HorarioProfesional>(
    `${this.horarioUrl}/${id}`,
    data
  );

}


// ========================================================
// ELIMINAR HORARIO
// ========================================================

eliminarHorarioProfesional(
  id: string
): Observable<void> {

  return this.http.delete<void>(
    `${this.horarioUrl}/${id}`
  );

}

// ========================================================
// OBRAS SOCIALES DEL PROFESIONAL
// ========================================================

obtenerProfesionalObrasSociales(
  profesionalOrganizacionId: string
): Observable<ProfesionalObraSocial[]> {

  return this.http.get<ProfesionalObraSocial[]>(
    `${this.profesionalObraSocialUrl}/${profesionalOrganizacionId}`
  );

}


// ========================================================
// GUARDAR OBRAS SOCIALES DEL PROFESIONAL
// ========================================================

guardarProfesionalObrasSociales(
  data: GuardarProfesionalObrasSociales
): Observable<GuardarObrasSocialesResponse> {

  return this.http.put<GuardarObrasSocialesResponse>(
    this.profesionalObraSocialUrl,
    data
  );

}

subirFotoProfesional(
  archivo: File
): Observable<UploadImagenResponse> {

  const formData = new FormData();

  formData.append(
    'archivo',
    archivo
  );

  return this.http.post<UploadImagenResponse>(
    `${this.apiBaseUrl}/cloudinary/profesional`,
    formData
  );
}

// ========================================================
// MI CONFIGURACIÓN DE RESERVA ONLINE
// ========================================================

obtenerMiReservaOnline():
  Observable<MiReservaOnline> {

  return this.http.get<MiReservaOnline>(
    `${this.profesionalOrganizacionUrl}/mi-reserva-online`
  );

}


actualizarMiReservaOnline(
  data: MiReservaOnline
): Observable<MiReservaOnline> {

  return this.http.put<MiReservaOnline>(
    `${this.profesionalOrganizacionUrl}/mi-reserva-online`,
    data
  );

}


// ========================================================
// PROFESIONALES DE LA ORGANIZACIÓN ACTIVA
// ========================================================

obtenerProfesionalesOrganizacion():
  Observable<ProfesionalOrganizacionResumen[]> {

  return this.http.get<ProfesionalOrganizacionResumen[]>(
    this.profesionalOrganizacionUrl
  );
}
}