import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';


// ==========================================================
// ORGANIZACIÓN DISPONIBLE
// ==========================================================

export interface OrganizacionContexto {

  organizacionId: string;

  nombre: string;

  logoUrl: string | null;

  rol: number;

  esActual: boolean;

  profesionalOrganizacionId: string | null;

  esProfesional: boolean;
}


// ==========================================================
// RESPUESTA CAMBIO DE ORGANIZACIÓN
// ==========================================================

export interface CambiarOrganizacionResponse {

  token: string;

  organizacionId: string;

  organizacion: string;

  rol: string;

  profesionalOrganizacionId: string | null;

  esProfesional: boolean;
}


// ==========================================================
// SERVICE
// ==========================================================

@Injectable({
  providedIn: 'root'
})
export class ContextoService {

  private readonly apiUrl =
   `${environment.apiUrl}/contexto`;


  constructor(
    private http: HttpClient
  ) {}


  // ========================================================
  // OBTENER ORGANIZACIONES
  // ========================================================

  obtenerOrganizaciones():
    Observable<OrganizacionContexto[]> {

    return this.http.get<OrganizacionContexto[]>(
      `${this.apiUrl}/organizaciones`
    );
  }


  // ========================================================
  // CAMBIAR ORGANIZACIÓN
  // ========================================================

  cambiarOrganizacion(
    organizacionId: string
  ): Observable<CambiarOrganizacionResponse> {

    return this.http
      .post<CambiarOrganizacionResponse>(
        `${this.apiUrl}/cambiar-organizacion`,
        {
          organizacionId
        }
      )
      .pipe(

        tap((respuesta) => {

          // JWT NUEVO

          localStorage.setItem(
            'token',
            respuesta.token
          );


          // ORGANIZACIÓN ACTIVA

          localStorage.setItem(
            'organizacionId',
            respuesta.organizacionId
          );

          localStorage.setItem(
            'organizacionNombre',
            respuesta.organizacion
          );

          localStorage.setItem(
            'rolOrganizacion',
            respuesta.rol
          );


          // CAPACIDAD PROFESIONAL

          localStorage.setItem(
            'esProfesional',
            respuesta.esProfesional
              ? 'true'
              : 'false'
          );


          // PROFESIONAL ORGANIZACIÓN

          if (
            respuesta.profesionalOrganizacionId
          ) {

            localStorage.setItem(
              'profesionalOrganizacionId',
              respuesta.profesionalOrganizacionId
            );

          } else {

            localStorage.removeItem(
              'profesionalOrganizacionId'
            );

          }

        })

      );
  }


  // ========================================================
  // CONTEXTO ACTUAL
  // ========================================================

  getOrganizacionId(): string | null {

    return localStorage.getItem(
      'organizacionId'
    );
  }


  getOrganizacionNombre(): string | null {

    return localStorage.getItem(
      'organizacionNombre'
    );
  }


  getRol(): string | null {

    return localStorage.getItem(
      'rolOrganizacion'
    );
  }


  getProfesionalOrganizacionId():
    string | null {

    return localStorage.getItem(
      'profesionalOrganizacionId'
    );
  }


  esProfesionalActual(): boolean {

    return (
      localStorage.getItem(
        'esProfesional'
      ) === 'true'
    );
  }


  // ========================================================
  // HELPERS DE ROL
  // ========================================================

  esAdmin(): boolean {

    const rol =
      this.getRol()
        ?.toLowerCase();

    return (
      rol === 'admin' ||
      rol === '1'
    );
  }


  esSecretaria(): boolean {

    const rol =
      this.getRol()
        ?.toLowerCase();

    return (
      rol === 'secretaria' ||
      rol === '3'
    );
  }


  esProfesionalSolo(): boolean {

    const rol =
      this.getRol()
        ?.toLowerCase();

    return (
      (
        rol === 'profesional' ||
        rol === '2'
      )
      &&
      !!this.getProfesionalOrganizacionId()
    );
  }
}