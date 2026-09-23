import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Invitacion,
  CreateInvitacion,
  RegistroConInvitacion,
  UnirseOrganizacion
} from '../interfaces/invitacion';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InvitacionService {

  private readonly apiUrl =
    `${environment.apiUrl}/Invitaciones`;


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // GENERAR INVITACIÓN
  // ==========================================

  generar(
    data: CreateInvitacion
  ): Observable<Invitacion> {

    return this.http.post<Invitacion>(
      `${this.apiUrl}/generar`,
      data
    );

  }


  // ==========================================
  // UNIRSE CON USUARIO EXISTENTE
  // ==========================================

  unirse(
    data: UnirseOrganizacion
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/unirse`,
      data
    );

  }


  // ==========================================
  // REGISTRARSE CON INVITACIÓN
  // ==========================================

  registrarse(
    data: RegistroConInvitacion
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/registrarse`,
      data
    );

  }

  // ==========================================
// OBTENER INVITACIONES
// ==========================================

obtenerTodas(): Observable<Invitacion[]> {

  return this.http.get<Invitacion[]>(
    this.apiUrl
  );

}
// ==========================================
// CANCELAR INVITACIÓN
// ==========================================

cancelar(id: string): Observable<any> {

  return this.http.put(
    `${this.apiUrl}/${id}/cancelar`,
    {}
  );

}
}