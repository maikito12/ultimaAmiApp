import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


export interface ConsultaMedicaArchivo {
  id: string;
  consultaMedicaId: string;
  nombreArchivo: string;
  tipoArchivo?: string | null;
  url: string;
  createdAt: string;
}


export interface ConsultaMedica {
  id: string;

  turnoId: string | null;

  pacienteId: string;

  profesionalOrganizacionId: string;

  profesionalEspecialidadId: string;

  fecha: string;

  profesionalNombre: string;

  especialidadNombre: string;

  motivoConsulta?: string | null;

  diagnostico?: string | null;

  tratamiento?: string | null;

  indicaciones?: string | null;

  proximoControl?: string | null;

  datosConsulta?: Record<string, any> | null;

  archivos: ConsultaMedicaArchivo[];
}


export interface GuardarConsultaMedica {
  turnoId?: string | null;

  motivoConsulta?: string | null;

  diagnostico?: string | null;

  tratamiento?: string | null;

  indicaciones?: string | null;

  proximoControl?: string | null;

  datosConsulta?: Record<string, any> | null;
}


export interface CrearConsultaManual {
  pacienteId: string;

  profesionalEspecialidadId: string;

  motivoConsulta?: string | null;

  diagnostico?: string | null;

  tratamiento?: string | null;

  indicaciones?: string | null;

  proximoControl?: string | null;

  datosConsulta?: Record<string, any> | null;
}


export interface ConsultaManualEspecialidad {
  profesionalEspecialidadId: string;

  especialidadId: string;

  nombre: string;
}


export interface ConsultaManualContexto {
  profesionalOrganizacionId: string;

  profesionalNombre: string;

  especialidades: ConsultaManualEspecialidad[];
}


@Injectable({
  providedIn: 'root'
})
export class ConsultasMedicasService {

  private readonly URL_BASE =
    `${environment.apiUrl}/ConsultasMedicas`;

  private readonly URL_ARCHIVOS =
    `${this.URL_BASE}/archivos`;


  constructor(
    private readonly http: HttpClient
  ) {}


  // ==========================================
  // HISTORIA DEL PACIENTE
  // ==========================================

  obtenerPorPaciente(
    pacienteId: string
  ): Observable<ConsultaMedica[]> {

    return this.http.get<ConsultaMedica[]>(
      `${this.URL_BASE}/paciente/${pacienteId}`
    );
  }


  // ==========================================
  // CONTEXTO PARA EVOLUCIÓN MANUAL
  // ==========================================

  obtenerContextoManual():
    Observable<ConsultaManualContexto> {

    return this.http.get<ConsultaManualContexto>(
      `${this.URL_BASE}/manual/contexto`
    );
  }


  // ==========================================
  // DETALLE
  // ==========================================

  obtenerPorId(
    consultaId: string
  ): Observable<ConsultaMedica> {

    return this.http.get<ConsultaMedica>(
      `${this.URL_BASE}/${consultaId}`
    );
  }


  // ==========================================
  // CREAR DESDE TURNO
  // ==========================================

  crear(
    consulta: GuardarConsultaMedica
  ): Observable<ConsultaMedica> {

    return this.http.post<ConsultaMedica>(
      this.URL_BASE,
      consulta
    );
  }


  // ==========================================
  // CREAR MANUAL DESDE PACIENTE
  // ==========================================

  crearManual(
    consulta: CrearConsultaManual
  ): Observable<ConsultaMedica> {

    return this.http.post<ConsultaMedica>(
      `${this.URL_BASE}/manual`,
      consulta
    );
  }


  // ==========================================
  // ACTUALIZAR
  // ==========================================

  actualizar(
    consultaId: string,
    consulta: GuardarConsultaMedica
  ): Observable<ConsultaMedica> {

    return this.http.put<ConsultaMedica>(
      `${this.URL_BASE}/${consultaId}`,
      consulta
    );
  }


  // ==========================================
  // ELIMINAR / BAJA LÓGICA
  // ==========================================

  eliminar(
    consultaId: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.URL_BASE}/${consultaId}`
    );
  }


  // ==========================================
  // ARCHIVOS
  // ==========================================

  subirArchivo(
    consultaMedicaId: string,
    archivo: File
  ): Observable<ConsultaMedicaArchivo> {

    const formData =
      new FormData();

    formData.append(
      'ConsultaMedicaId',
      consultaMedicaId
    );

    formData.append(
      'Archivo',
      archivo,
      archivo.name
    );

    return this.http.post<ConsultaMedicaArchivo>(
      this.URL_ARCHIVOS,
      formData
    );
  }


  obtenerArchivos(
    consultaMedicaId: string
  ): Observable<ConsultaMedicaArchivo[]> {

    return this.http.get<ConsultaMedicaArchivo[]>(
      `${this.URL_ARCHIVOS}/${consultaMedicaId}`
    );
  }



  // ==========================================
  // RENOMBRAR ARCHIVO
  // ==========================================

  renombrarArchivo(
    archivoId: string,
    nombreArchivo: string
  ): Observable<ConsultaMedicaArchivo> {

    return this.http.put<ConsultaMedicaArchivo>(
      `${this.URL_ARCHIVOS}/${archivoId}/nombre`,
      {
        nombreArchivo
      }
    );
  }


  eliminarArchivo(
    archivoId: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.URL_ARCHIVOS}/${archivoId}`
    );
  }
}
