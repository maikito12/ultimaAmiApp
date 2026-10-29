import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';


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
   `${environmentProduccion.apiUrl}/contexto`;


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


sincronizarOrganizacionActual(
  organizaciones: OrganizacionContexto[]
): void {
  const actual =
    organizaciones.find(o => o.esActual) ??
    (organizaciones.length === 1 ? organizaciones[0] : null);
console.log('SINCRONIZANDO ORGANIZACIÓN:', {
  encontrada: !!actual,
  rol: actual?.rol,
  esActual: actual?.esActual,
  cantidadOrganizaciones: organizaciones.length
});
  if (!actual) return;

  const organizacionGuardada = this.getOrganizacionId();

  // No sobrescribir el contexto de otra organización.
  if (
    organizacionGuardada &&
    organizacionGuardada !== actual.organizacionId
  ) {
    return;
  }

  localStorage.setItem(
    'organizacionId',
    actual.organizacionId
  );

  localStorage.setItem(
    'organizacionNombre',
    actual.nombre
  );

  localStorage.setItem(
    'rolOrganizacion',
    String(actual.rol)
  );

  localStorage.setItem(
    'esProfesional',
    String(actual.esProfesional)
  );

  if (actual.profesionalOrganizacionId) {
    localStorage.setItem(
      'profesionalOrganizacionId',
      actual.profesionalOrganizacionId
    );
  } else {
    localStorage.removeItem('profesionalOrganizacionId');
  }
  console.log('CONTEXTO GUARDADO:', {
  rol: localStorage.getItem('rolOrganizacion'),
  organizacion: localStorage.getItem('organizacionId'),
  esProfesional: localStorage.getItem('esProfesional')
});
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
console.log('CONTEXTO DESPUÉS DEL CAMBIO:', {
  organizacionId: localStorage.getItem('organizacionId'),
  rolOrganizacion: localStorage.getItem('rolOrganizacion'),
  esProfesional: localStorage.getItem('esProfesional')
});
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
  const rol = (this.getRol() ?? '')
    .trim()
    .toLowerCase();

  const roles = rol
    .split(/[,;|]/)
    .map(r => r.trim());

  return roles.some(r =>
    r === 'admin' ||
    r === 'administrador' ||
    r === '1'
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