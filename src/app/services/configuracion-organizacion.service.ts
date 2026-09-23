import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// ==========================================
// RESPUESTA API GENÉRICA
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}


// ==========================================
// PAGINADO
// ==========================================

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ==========================================
// ORGANIZACIÓN - INFORMACIÓN GENERAL
// ==========================================

export interface OrganizacionGeneral {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  colorPrincipal: string;
  colorSecundario: string;
  bannerUrl: string | null;
  faviconUrl: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  pais: string | null;
  timezone: string;
}
// ==========================================
// SUCURSAL
// ==========================================

export interface Sucursal {
  id: string;
  nombre: string;
  calle: string;
  altura: string;
  pisoDepto: string | null;
  ciudad: string;
  telefono: string | null;
  email: string | null;
  fotoUrl: string | null;
  latitud: number | null;
  longitud: number | null;
}

export interface CreateSucursal {
  nombre: string;
  calle: string;
  altura: string;
  pisoDepto?: string | null;
  ciudad: string;
  telefono?: string | null;
  email?: string | null;
  fotoUrl?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}
export interface UploadImagenResponse {
  success: boolean;
  message: string;
  url: string;
}

export interface UploadLogoOrganizacionResponse {
  success: boolean;
  message: string;
  logoUrl: string;
}
export interface UpdateSucursal {
  nombre: string;
  calle: string;
  altura: string;
  pisoDepto?: string | null;
  ciudad: string;
  telefono?: string | null;
  email?: string | null;
  fotoUrl?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

export interface UploadBannerOrganizacionResponse {
  success: boolean;
  message: string;
  bannerUrl: string;
}
// ==========================================
// HORARIO DE APERTURA DE SUCURSAL
// ==========================================

export interface HorarioSucursal {
  id: string;
  sucursalId: string;
  sucursal: string;
  diaSemana: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface CreateHorarioSucursal {
  sucursalId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface UpdateHorarioSucursal {
  sucursalId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface UpdateOrganizacionGeneral {
  nombre: string;
  slug: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  pais: string | null;
  colorPrincipal: string;
  colorSecundario: string;
}

// ==========================================
// ESPECIALIDAD
// ==========================================

export interface Especialidad {
  id: string;
  nombre: string;
  color: string | null;
  icono: string | null;
  activo: boolean;
}

export interface CreateEspecialidad {
  nombre: string;
  color?: string | null;
  icono?: string | null;
}

export interface UpdateEspecialidad {
  nombre: string;
  color?: string | null;
  icono?: string | null;
  activo: boolean;
}
// ==========================================
// OBRA SOCIAL
// ==========================================

export interface ObraSocial {
  id: string;
  nombre: string;
  siglas: string | null;
  codigoPrestador: string | null;
  activo: boolean;
}
export interface ObraSocial {
  id: string;
  nombre: string;
  siglas: string | null;
  codigoPrestador: string | null;
  activo: boolean;
}

export interface CreateObraSocial {
  nombre: string;
  siglas?: string | null;
  codigoPrestador?: string | null;
}

export interface UpdateObraSocial {
  nombre: string;
  siglas?: string | null;
  codigoPrestador?: string | null;
  activo: boolean;
}
// ==========================================
// BLOQUEOS GENERALES DE ORGANIZACIÓN
// ==========================================

export interface BloqueoOrganizacion {
  id: string;
  inicio: string;
  fin: string;
  motivo: string | null;
  activo: boolean;
  createdAt: string;
}

export interface CrearBloqueoOrganizacion {
  inicio: string;
  fin: string;
  motivo: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class ConfiguracionOrganizacionService {

  private readonly apiBaseUrl =
     `${environment.apiUrl}`;

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // SUCURSALES
  // ==========================================

  obtenerSucursales(): Observable<Sucursal[]> {

    return this.http.get<Sucursal[]>(
      `${this.apiBaseUrl}/Sucursales`
    );

  }


  obtenerSucursal(
    id: string
  ): Observable<Sucursal> {

    return this.http.get<Sucursal>(
      `${this.apiBaseUrl}/Sucursales/${id}`
    );

  }


  crearSucursal(
    data: CreateSucursal
  ): Observable<Sucursal> {

    return this.http.post<Sucursal>(
      `${this.apiBaseUrl}/Sucursales`,
      data
    );

  }


  actualizarSucursal(
    id: string,
    data: UpdateSucursal
  ): Observable<Sucursal> {

    return this.http.put<Sucursal>(
      `${this.apiBaseUrl}/Sucursales/${id}`,
      data
    );

  }


  eliminarSucursal(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiBaseUrl}/Sucursales/${id}`
    );

  }


  // ==========================================
  // HORARIOS DE APERTURA
  // ==========================================

  obtenerHorariosSucursal():
    Observable<HorarioSucursal[]> {

    return this.http.get<HorarioSucursal[]>(
      `${this.apiBaseUrl}/HorarioSucursal`
    );

  }


  obtenerHorariosPorSucursal(
    sucursalId: string
  ): Observable<HorarioSucursal[]> {

    return this.http.get<HorarioSucursal[]>(
      `${this.apiBaseUrl}/HorarioSucursal/sucursal/${sucursalId}`
    );

  }


  crearHorarioSucursal(
    data: CreateHorarioSucursal
  ): Observable<HorarioSucursal> {

    return this.http.post<HorarioSucursal>(
      `${this.apiBaseUrl}/HorarioSucursal`,
      data
    );

  }


  actualizarHorarioSucursal(
    id: string,
    data: UpdateHorarioSucursal
  ): Observable<HorarioSucursal> {

    return this.http.put<HorarioSucursal>(
      `${this.apiBaseUrl}/HorarioSucursal/${id}`,
      data
    );

  }


  eliminarHorarioSucursal(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiBaseUrl}/HorarioSucursal/${id}`
    );

  }


  // ==========================================
  // ESPECIALIDADES
  // ==========================================

  obtenerEspecialidades():
    Observable<ApiResponse<PagedResult<Especialidad>>> {

    return this.http.get<
      ApiResponse<PagedResult<Especialidad>>
    >(
      `${this.apiBaseUrl}/especialidades?page=1&pageSize=100`
    );

  }


  obtenerEspecialidad(
    id: string
  ): Observable<ApiResponse<Especialidad>> {

    return this.http.get<ApiResponse<Especialidad>>(
      `${this.apiBaseUrl}/especialidades/${id}`
    );

  }


  crearEspecialidad(
    data: CreateEspecialidad
  ): Observable<ApiResponse<Especialidad>> {

    return this.http.post<
      ApiResponse<Especialidad>
    >(
      `${this.apiBaseUrl}/especialidades`,
      data
    );

  }


  actualizarEspecialidad(
    id: string,
    data: UpdateEspecialidad
  ): Observable<ApiResponse<Especialidad>> {

    return this.http.put<
      ApiResponse<Especialidad>
    >(
      `${this.apiBaseUrl}/especialidades/${id}`,
      data
    );

  }


  eliminarEspecialidad(
    id: string
  ): Observable<ApiResponse<object>> {

    return this.http.delete<ApiResponse<object>>(
      `${this.apiBaseUrl}/especialidades/${id}`
    );

  }

  // ==========================================
// CLOUDINARY - FOTO SUCURSAL
// ==========================================

subirFotoSucursal(
  archivo: File
): Observable<UploadImagenResponse> {

  const formData = new FormData();

  formData.append(
    'archivo',
    archivo
  );

 return this.http.post<UploadImagenResponse>(
  `${this.apiBaseUrl}/r2/sucursal`,
  formData
);

}
// ==========================================
// OBRAS SOCIALES
// ==========================================

obtenerObrasSociales():
  Observable<PagedResult<ObraSocial>> {

  return this.http.get<PagedResult<ObraSocial>>(
    `${this.apiBaseUrl}/obras-sociales?page=1&pageSize=100`
  );

}


obtenerObraSocial(
  id: string
): Observable<ObraSocial> {

  return this.http.get<ObraSocial>(
    `${this.apiBaseUrl}/obras-sociales/${id}`
  );

}


crearObraSocial(
  data: CreateObraSocial
): Observable<ObraSocial> {

  return this.http.post<ObraSocial>(
    `${this.apiBaseUrl}/obras-sociales`,
    data
  );

}


actualizarObraSocial(
  id: string,
  data: UpdateObraSocial
): Observable<ObraSocial> {

  return this.http.put<ObraSocial>(
    `${this.apiBaseUrl}/obras-sociales/${id}`,
    data
  );

}


eliminarObraSocial(
  id: string
): Observable<void> {

  return this.http.delete<void>(
    `${this.apiBaseUrl}/obras-sociales/${id}`
  );

}
// ==========================================
// ORGANIZACIÓN - INFORMACIÓN GENERAL
// ==========================================

obtenerOrganizacionActual():
  Observable<OrganizacionGeneral> {

  return this.http.get<OrganizacionGeneral>(
    `${this.apiBaseUrl}/organizaciones/actual`
  );

}
// ==========================================
// ORGANIZACIÓN - LOGO
// ==========================================

subirLogoOrganizacion(
  archivo: File
): Observable<UploadLogoOrganizacionResponse> {

  const formData =
    new FormData();

  formData.append(
    'archivo',
    archivo
  );

  return this.http.post<UploadLogoOrganizacionResponse>(
    `${this.apiBaseUrl}/organizaciones/actual/logo`,
    formData
  );
}

// ==========================================
// ORGANIZACIÓN - ACTUALIZAR
// ==========================================

actualizarOrganizacionActual(
  data: UpdateOrganizacionGeneral
): Observable<{ message: string }> {

  return this.http.put<{ message: string }>(
    `${this.apiBaseUrl}/organizaciones/actual`,
    data
  );
}

// ==========================================
// ORGANIZACIÓN - BANNER
// ==========================================

subirBannerOrganizacion(
  archivo: File
): Observable<UploadBannerOrganizacionResponse> {

  const formData =
    new FormData();

  formData.append(
    'archivo',
    archivo
  );

  return this.http.post<UploadBannerOrganizacionResponse>(
    `${this.apiBaseUrl}/organizaciones/actual/banner`,
    formData
  );
}

// ==========================================
// BLOQUEOS GENERALES DE ORGANIZACIÓN
// ==========================================

obtenerBloqueosOrganizacion():
  Observable<BloqueoOrganizacion[]> {

  return this.http.get<BloqueoOrganizacion[]>(
    `${this.apiBaseUrl}/BloqueosOrganizacion`
  );

}


crearBloqueoOrganizacion(
  data: CrearBloqueoOrganizacion
): Observable<BloqueoOrganizacion> {

  return this.http.post<BloqueoOrganizacion>(
    `${this.apiBaseUrl}/BloqueosOrganizacion`,
    data
  );

}


eliminarBloqueoOrganizacion(
  id: string
): Observable<void> {

  return this.http.delete<void>(
    `${this.apiBaseUrl}/BloqueosOrganizacion/${id}`
  );

}

}