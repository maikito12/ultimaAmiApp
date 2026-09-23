import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  tap
} from 'rxjs';

import {
  LoginRequest,
  LoginResponse
} from '../interfaces/auth';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    `${environment.apiUrl}/Auth`;

  private readonly invitacionesUrl =
    `${environment.apiUrl}/Invitaciones`;

  constructor(
    private http: HttpClient
  ) {}

  login(
    credentials: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(
        tap((respuesta) => {
          this.guardarSesion(respuesta);
        })
      );
  }

  register(data: {
    nombreOrganizacion: string;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/register`,
        data
      )
      .pipe(
        tap((respuesta) => {
          this.guardarSesion(respuesta);
        })
      );
  }

  registerUsuario(data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/register-user`,
      data
    );
  }

  registerConInvitacion(data: {
    codigo: string;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.invitacionesUrl}/registrarse`,
        data
      )
      .pipe(
        tap((respuesta) => {
          this.guardarSesion(respuesta);
        })
      );
  }

  unirseConInvitacion(
    codigo: string
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.invitacionesUrl}/unirse`,
        {
          codigo
        }
      )
      .pipe(
        tap((respuesta) => {
          this.guardarSesion(respuesta);
        })
      );
  }

  getToken(): string | null {

    const token =
      localStorage.getItem('token');

    if (token) {
      return token;
    }

    const usuario =
      localStorage.getItem('usuario');

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario).token ?? null;
    } catch {
      return null;
    }
  }

  getUsuario(): LoginResponse | null {

    const usuario =
      localStorage.getItem('usuario');

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario);
    } catch {
      return null;
    }
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

  private guardarSesion(
    respuesta: LoginResponse
  ): void {

    localStorage.setItem(
      'usuario',
      JSON.stringify(respuesta)
    );

    localStorage.setItem(
      'token',
      respuesta.token
    );
  }

  // =====================================================
// SUPER ADMIN
// =====================================================

esSuperAdmin(): boolean {

  const token =
    this.getToken();

  if (!token) {
    return false;
  }

  try {

    const partes =
      token.split('.');

    if (partes.length !== 3) {
      return false;
    }

    let payloadBase64 =
      partes[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');


    while (
      payloadBase64.length % 4
    ) {
      payloadBase64 += '=';
    }


    const payload =
      JSON.parse(
        atob(payloadBase64)
      );


    return (
      String(
        payload?.['es_super_admin']
      )
        .toLowerCase()
      ===
      'true'
    );

  }
  catch (error) {

    console.error(
      'No se pudo leer el JWT:',
      error
    );

    return false;
  }
}
}
