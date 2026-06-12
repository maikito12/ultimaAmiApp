import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly URL_BASE = `/pacientes`;

  constructor(private http: HttpClient) {}

  obtenerPacientes(): Observable<any[]> { return this.http.get<any[]>(this.URL_BASE); }
  guardarPaciente(paciente: any): Observable<any> { return this.http.post(this.URL_BASE, paciente); }
  agregarNotaHistorial(id: string, nota: any): Observable<any> { return this.http.post(`${this.URL_BASE}/${id}/historial`, nota); }
  eliminarPaciente(id: string): Observable<any> { return this.http.delete(`${this.URL_BASE}/${id}`); }
}