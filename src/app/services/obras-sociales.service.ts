import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { environmentProduccion } from '../../environments/environment';

export interface ObraSocial {
  id: string;
  nombre: string;
  siglas?: string | null;
  activo: boolean;
}

interface PaginaObrasSociales {
  items: ObraSocial[];
  totalPages?: number;
  totalItems?: number;
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class ObrasSocialesService {
  private readonly url = `${environmentProduccion.apiUrl}/obras-sociales`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodas(): Observable<ObraSocial[]> {
    const pagina = (page: number): Observable<PaginaObrasSociales> =>
      this.http.get<PaginaObrasSociales>(this.url, {
        params: new HttpParams().set('page', String(page)).set('pageSize', '100')
      });

    let numeroPagina = 1;
    return pagina(numeroPagina).pipe(
      expand(respuesta => {
        const total = respuesta.totalPages ??
          Math.ceil((respuesta.totalItems ?? respuesta.total ?? 0) / 100);
        if (numeroPagina >= total || !(respuesta.items?.length)) return EMPTY;
        numeroPagina++;
        return pagina(numeroPagina);
      }),
      map(p => p.items ?? []),
      reduce((acumuladas, actuales) => [...acumuladas, ...actuales], [] as ObraSocial[])
    );
  }
}
