import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';

export type AlcanceTotem = 'SUCURSAL' | 'PISOS' | 'TODAS';
export type OrientacionTotem = 'AUTO' | 'VERTICAL' | 'HORIZONTAL';

export interface Totem {
  id: string;
  nombre: string;
  sucursal_fisica_id: string;
  alcance_reservas: AlcanceTotem;
  pisos: string[];
  slogan: string | null;
  color_principal: string | null;
  color_secundario: string | null;
  orientacion: OrientacionTotem;
  activo: boolean;
  vinculado: boolean;
  codigo_vence_at: string | null;
  ultima_conexion_at: string | null;
}

export interface CrearTotemPayload {
  nombre: string;
  sucursalFisicaId: string;
  alcanceReservas: AlcanceTotem;
  pisos: string[];
  slogan: string | null;
  colorPrincipal: string | null;
  colorSecundario: string | null;
  orientacion: OrientacionTotem;
}

export interface CodigoTotemRespuesta {
  codigo: string;
  venceAt: string;
}
export interface CrearTotemRespuesta extends CodigoTotemRespuesta {
  totem: Totem;
}

@Injectable({ providedIn: 'root' })
export class TotemsAdminService {
  private readonly url = `${environmentProduccion.apiUrl}/totems`;
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Totem[]> {
    return this.http.get<Totem[]>(this.url);
  }
  crear(payload: CrearTotemPayload): Observable<CrearTotemRespuesta> {
    return this.http.post<CrearTotemRespuesta>(this.url, payload);
  }
  regenerarCodigo(id: string): Observable<CodigoTotemRespuesta> {
    return this.http.post<CodigoTotemRespuesta>(`${this.url}/${id}/regenerar-codigo`, {});
  }
  desvincular(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.url}/${id}/desvincular`, {});
  }
}
