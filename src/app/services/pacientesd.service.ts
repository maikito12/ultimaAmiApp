import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Paciente {
  id: string;

  nombre: string;
  apellido: string;
  dni: string;

  email?: string | null;
  telefono?: string | null;

  fecha_nacimiento?: string | null;
  direccion?: string | null;
  sexo?: string | null;

  obra_social_id?: string | null;
  numero_afiliado?: string | null;
  obra_social?: string | null;

  activo: boolean;
}

export interface CreatePaciente {
  nombre: string;
  apellido: string;
  dni: string;

  email?: string | null;
  telefono?: string | null;

  fecha_nacimiento?: string | null;
  direccion?: string | null;
  sexo?: string | null;

  obra_social_id?: string | null;
  numero_afiliado?: string | null;

  datos_extra?: any;
}

export interface UpdatePaciente extends CreatePaciente {
  activo: boolean;
}

export interface PagedResult<T> {
  items: T[];
  total?: number;
  totalItems?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {

  private readonly URL_BASE =
    `${environment.apiUrl}/pacientes`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // LISTADO
  // ==========================================

  obtenerPacientes(
    page: number = 1,
    pageSize: number = 100,
    search: string = ''
  ): Observable<PagedResult<Paciente>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<PagedResult<Paciente>>(
      this.URL_BASE,
      { params }
    );
  }

  // ==========================================
  // DETALLE
  // ==========================================

  obtenerPaciente(
    id: string
  ): Observable<Paciente> {

    return this.http.get<Paciente>(
      `${this.URL_BASE}/${id}`
    );
  }

  // ==========================================
  // CREAR
  // ==========================================

  crearPaciente(
    paciente: CreatePaciente
  ): Observable<Paciente> {

    return this.http.post<Paciente>(
      this.URL_BASE,
      paciente
    );
  }

  // ==========================================
  // ACTUALIZAR
  // ==========================================

  actualizarPaciente(
    id: string,
    paciente: UpdatePaciente
  ): Observable<Paciente> {

    return this.http.put<Paciente>(
      `${this.URL_BASE}/${id}`,
      paciente
    );
  }

  // ==========================================
  // ELIMINAR / BAJA LÓGICA
  // ==========================================

  eliminarPaciente(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.URL_BASE}/${id}`
    );
  }
}