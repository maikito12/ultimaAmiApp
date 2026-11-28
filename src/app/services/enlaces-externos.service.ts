import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';




export type ModoAutorizacionEnlacesExternos = 0 | 1 | 2;

// ==========================================
// PROFESIONAL ELEGIBLE
// ==========================================

export interface ProfesionalEnlaceExterno {
  profesionalOrganizacionId: string;
  profesionalId: string;
  nombreCompleto: string;
  seleccionado: boolean;
  autorizado: boolean;
}

// ==========================================
// CONFIGURACION
// ==========================================

export interface ConfiguracionEnlacesExternos {
  modoAutorizacion: ModoAutorizacionEnlacesExternos;
  profesionales: ProfesionalEnlaceExterno[];
}

// ==========================================
// ACTUALIZAR CONFIGURACION
// ==========================================

export interface ActualizarEnlacesExternos {
  modoAutorizacion: ModoAutorizacionEnlacesExternos;
  profesionalOrganizacionIds: string[];
}

// ==========================================
// SERVICIO
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class EnlacesExternosService {

  private readonly URL =
    `${environmentProduccion.apiUrl}/enlaces-externos`;

  constructor(private http: HttpClient) {}

  obtener(): Observable<ConfiguracionEnlacesExternos> {
    return this.http.get<ConfiguracionEnlacesExternos>(
      this.URL
    );
  }

  guardar(
    configuracion: ActualizarEnlacesExternos
  ): Observable<ConfiguracionEnlacesExternos> {

    return this.http.put<ConfiguracionEnlacesExternos>(
      this.URL,
      configuracion
    );
  }
}