import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, throwError, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta la URL a la de tu API C# (no uses el webhook de n8n para el login real)
  private readonly URL_API = 'https://localhost:7001/api/usuario/login';

  constructor(private http: HttpClient) {}

  // 1. Agregamos el tipado para los credenciales
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(this.URL_API, credentials).pipe(
      tap((res: any) => {
        // 2. Ajustamos la lógica de guardado a la respuesta de tu API C#
        if (res) {
          localStorage.setItem('usuario', JSON.stringify({
            id: res.id,
            nombre: res.nombre,
            email: res.email,
            rol: res.rol
          }));
        }
      }),
      // 3. Manejo de errores profesional
      catchError(this.handleError)
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

  // Método privado para manejar errores de red o credenciales
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.status === 400 ? 'Email o contraseña incorrecta' : `Error: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}