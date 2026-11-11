import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';

export interface TotemConfiguracion {
  id: string;
  nombre: string;
  sucursal_fisica_id: string;
  sucursalNombre: string;
  alcance_reservas: 'SUCURSAL' | 'PISOS' | 'TODAS';
  pisos: string[];
  orientacion: 'AUTO' | 'VERTICAL' | 'HORIZONTAL';
  nombreOrganizacion: string;
  logoUrl: string | null;
  slogan: string | null;
  colorPrincipal: string | null;
  colorSecundario: string | null;
}

interface VincularRespuesta { success: boolean; credencial: string; }

export interface LlegadaTotemRespuesta {
  success: boolean;
  message: string;
  nombre: string;
  profesional: string;
  consultorio: string | null;
  piso: string | null;
}

@Injectable({ providedIn: 'root' })
export class TotemService {
  private readonly base = `${environmentProduccion.apiUrl}/totems`;
  private readonly storageKey = 'coria_totem_device_key';
  constructor(private readonly http: HttpClient) {}

  get tieneCredencial(): boolean { return !!this.obtenerCredencial(); }

  // Solo credencial del dispositivo, nunca datos de pacientes.
  private obtenerCredencial(): string | null {
    try { return localStorage.getItem(this.storageKey); } catch { return null; }
  }

  vincular(codigo: string): Observable<VincularRespuesta> {
    return this.http.post<VincularRespuesta>(`${this.base}/vincular`, { codigo }).pipe(
      tap(r => {
        if (!r.success || !/^[a-fA-F0-9]{64}$/.test(r.credencial)) {
          throw new Error('Respuesta de vinculación inválida.');
        }
        localStorage.setItem(this.storageKey, r.credencial);
      })
    );
  }

  obtenerConfiguracion(): Observable<TotemConfiguracion> {
    const credencial = this.obtenerCredencial();
    if (!credencial) throw new Error('El dispositivo no tiene credencial.');
    return this.http.get<TotemConfiguracion>(`${this.base}/mi-configuracion`, {
      headers: new HttpHeaders({ 'X-Totem-Key': credencial })
    });
  }

  registrarLlegada(dni: string, ultimos4Telefono: string): Observable<LlegadaTotemRespuesta> {
    const credencial = this.obtenerCredencial();
    if (!credencial) throw new Error('El dispositivo no tiene credencial.');
    return this.http.post<LlegadaTotemRespuesta>(`${this.base}/check-in`,
      { dni, ultimos4Telefono }, {
        headers: new HttpHeaders({ 'X-Totem-Key': credencial })
      });
  }

  olvidarCredencialLocal(): void {
    try { localStorage.removeItem(this.storageKey); } catch { /* almacenamiento bloqueado */ }
  }
}
