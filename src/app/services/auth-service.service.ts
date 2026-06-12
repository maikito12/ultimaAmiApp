import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, throwError, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta la URL a la de tu API C# (no uses el webhook de n8n para el login real)
  private readonly URL_API = 'https://localhost:7203/api/usuarios/login';

  constructor(private http: HttpClient) {}

  // 1. Agregamos el tipado para los credenciales
 login(credentials: { email: string, password: string }): Observable<any> {
  return this.http.post(this.URL_API, credentials).pipe(
    tap((res: any) => {
      if (res && res.token) { // Verificamos que venga el token
        // Guardamos todo el objeto, incluido el token
        localStorage.setItem('usuario', JSON.stringify({
          id: res.id,
          nombre: res.nombre,
          email: res.email,
          rol: res.rol,
          token: res.token // <--- ¡AQUÍ ESTÁ LA CLAVE!
        }));
      }
    }),
    catchError(this.handleError)
  );
}

getToken(): string | null {
  const user = localStorage.getItem('usuario');
  if (user) {
    const usuarioObj = JSON.parse(user);
    return usuarioObj.token; // Retorna solo el string del token
  }
  return null;
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
      // AJUSTE: Cambiado a 401 que es el que devuelve tu API
      errorMessage = error.status === 401 ? 'Email o contraseña incorrecta' : `Error: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}