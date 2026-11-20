
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';




export interface NotificacionInterna {
  id: string;
  turnoId: string;
  tipo: 'Creado' | 'Confirmado' | 'Cancelado';
  titulo: string;
  detalle: string;
  createdAt: string;
  leidaAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesInternasService {

  private readonly url =
    `${environmentProduccion.apiUrl}/notificaciones-internas`;

  constructor(
    private readonly http: HttpClient
  ) {}

  // ==========================================
  // LISTAR NOTIFICACIONES
  // ==========================================

  listar(): Observable<NotificacionInterna[]> {
    return this.http.get<NotificacionInterna[]>(this.url);
  }

  // ==========================================
  // CONTAR SIN LEER
  // ==========================================

  contarSinLeer(): Observable<{ cantidad: number }> {
    return this.http.get<{ cantidad: number }>(
      `${this.url}/sin-leer`
    );
  }

  // ==========================================
  // MARCAR COMO LEÍDA
  // ==========================================

  marcarLeida(id: string): Observable<void> {
    return this.http.patch<void>(
      `${this.url}/${id}/leer`,
      {}
    );
  }

  // ==========================================
  // MARCAR TODAS COMO LEÍDAS
  // ==========================================

  leerTodas(): Observable<void> {
    return this.http.patch<void>(
      `${this.url}/leer-todas`,
      {}
    );
  }

  // ==========================================
  // ELIMINAR NOTIFICACIÓN
  // ==========================================

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`
    );
  }

}
