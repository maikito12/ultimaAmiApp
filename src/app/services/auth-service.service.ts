import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly URL_N8N = 'https://juandibello05.app.n8n.cloud/webhook/login';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(this.URL_N8N, credentials).pipe(
      tap((res: any) => {
        if (res && res.auth) {
          // Guardamos el objeto completo según tu tabla DB
          localStorage.setItem('usuario', JSON.stringify({
            id: res.user.id,
            nombre: res.user.nombre,
            slug: res.user.slug,
            email: res.user.email
          }));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('usuario');
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('usuario');
  }

  getUsuario() {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }
}