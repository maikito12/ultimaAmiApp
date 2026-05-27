import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {

  private readonly URL_GUARDAR_PACIENTE = 'https://juandibello05.app.n8n.cloud/webhook/Form nutrición'; // Ojo con el espacio, mejor usar guion
  private readonly URL_TURNOS_DISPONIBLES = 'https://juandibello05.app.n8n.cloud/webhook/Consultar-horarios';

  constructor(private http: HttpClient) { }

  /**
   * Envía los datos del nuevo paciente a n8n
   */
  enviarNuevoPaciente(datos: any): Observable<any> {
    return this.http.post(this.URL_GUARDAR_PACIENTE, datos);
  }

  /**
   * Consultar turnos disponibles usando POST para evitar problemas de CORS
   */
getTurnosDisponibles(filtros: any): Observable<any[]> {
  // Mandamos el objeto pelado. 
  // n8n lo recibe como body si es POST o como query si es GET.
  return this.http.post<any[]>(this.URL_TURNOS_DISPONIBLES, filtros);
}
}