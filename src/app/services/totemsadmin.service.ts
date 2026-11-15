import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';


export type AlcanceTotem = 'SUCURSAL' | 'PISOS' | 'TODAS';
export type OrientacionTotem = 'AUTO' | 'VERTICAL' | 'HORIZONTAL';
export type FuenteTotem = 'SISTEMA' | 'INTER' | 'POPPINS' | 'MONTSERRAT' | 'ROBOTO';
export interface Totem {
  id: string; nombre: string; sucursal_fisica_id: string;
  alcance_reservas: AlcanceTotem; pisos: string[]; slogan: string | null;
  color_principal: string | null; color_secundario: string | null;
  orientacion: OrientacionTotem; fuente: FuenteTotem;
  activo: boolean; vinculado: boolean; codigo_vence_at: string | null;
  ultima_conexion_at: string | null;
}
export interface CrearTotemPayload {
  nombre: string; sucursalFisicaId: string; alcanceReservas: AlcanceTotem;
  pisos: string[]; slogan: string | null; colorPrincipal: string | null;
  colorSecundario: string | null; orientacion: OrientacionTotem; fuente: FuenteTotem;
}
export type EditarTotemPayload = CrearTotemPayload;
export interface CodigoTotemRespuesta { codigo: string; venceAt: string; }
export interface CrearTotemRespuesta extends CodigoTotemRespuesta { totem: Totem; }
@Injectable({providedIn:'root'})
export class TotemsAdminService {
  private readonly url = `${environmentProduccion.apiUrl}/totems`;
  constructor(private readonly http: HttpClient) {}
  listar(): Observable<Totem[]> { return this.http.get<Totem[]>(this.url); }
  crear(p: CrearTotemPayload): Observable<CrearTotemRespuesta> { return this.http.post<CrearTotemRespuesta>(this.url, p); }
  editar(id: string, p: EditarTotemPayload): Observable<Totem> { return this.http.put<Totem>(`${this.url}/${encodeURIComponent(id)}`, p); }
  eliminar(id: string): Observable<{success:boolean;message:string}> { return this.http.delete<{success:boolean;message:string}>(`${this.url}/${encodeURIComponent(id)}`); }
  regenerarCodigo(id: string): Observable<CodigoTotemRespuesta> { return this.http.post<CodigoTotemRespuesta>(`${this.url}/${encodeURIComponent(id)}/regenerar-codigo`, {}); }
  desvincular(id: string): Observable<{success:boolean;message:string}> { return this.http.post<{success:boolean;message:string}>(`${this.url}/${encodeURIComponent(id)}/desvincular`, {}); }
}
