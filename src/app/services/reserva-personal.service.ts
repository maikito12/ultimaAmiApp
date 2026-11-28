import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';


export type ModoReservaPersonal = 0 | 1 | 2;

// ==========================================
// SUCURSAL EXTERNA
// ==========================================

export interface ReservaPersonalSucursal {
  profesionalSucursalId: string;
  profesionalOrganizacionId: string;
  organizacionId: string;
  sucursalId: string;

  nombreOrganizacion: string;
  nombreSucursal: string;

  permitida: boolean;
  seleccionada: boolean;
  disponibleParaReserva: boolean;
  visibleEnEnlacePersonal: boolean;

  motivoNoDisponible?: string | null;
}

// ==========================================
// CONFIGURACION PERSONAL
// ==========================================

export interface ReservaPersonal {
  disponible: boolean;
  modoSucursales: ModoReservaPersonal;
  sucursales: ReservaPersonalSucursal[];
}

// ==========================================
// ACTUALIZAR CONFIGURACION
// ==========================================

export interface ActualizarReservaPersonal {
  modoSucursales: ModoReservaPersonal;
  profesionalSucursalIds: string[];
}

// ==========================================
// SERVICIO
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class ReservaPersonalService {

  private readonly URL_BASE =
    `${environmentProduccion.apiUrl}/reserva-personal`;

  constructor(
    private http: HttpClient
  ) {}

  obtener(): Observable<ReservaPersonal> {

    return this.http.get<ReservaPersonal>(
      this.URL_BASE
    );

  }

  actualizar(
    dto: ActualizarReservaPersonal
  ): Observable<ReservaPersonal> {

    return this.http.put<ReservaPersonal>(
      this.URL_BASE,
      dto
    );

  }

}