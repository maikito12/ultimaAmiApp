import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConfiguracionReservas {
  permitirReservaOnline: boolean;
  maxTurnosActivos: number;
  diasMaximosAnticipacion: number;
  horasMinimasCancelacion: number;
  permitirMultiplesTurnosMismoDia: boolean;
  permitirElegirProfesional: boolean;
  permitirElegirSucursal: boolean;
  requiereConfirmacion: boolean;

  solicitarDni: boolean;
  solicitarEmail: boolean;
  solicitarTelefono: boolean;
  solicitarFechaNacimiento: boolean;
  solicitarObraSocial: boolean;
  solicitarMotivoConsulta: boolean;
  solicitarObservaciones: boolean;

  tituloReserva?: string;
  descripcionReserva?: string;

  tiempoGraciaMinutos: number;
  permitirSobreturnos: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionReservasService {

  private readonly URL =
     `${environment.apiUrl}/configuracion-reservas`;

  constructor(private http: HttpClient) {}

  obtener(): Observable<ConfiguracionReservas> {
    return this.http.get<ConfiguracionReservas>(this.URL);
  }

  guardar(
    configuracion: ConfiguracionReservas
  ): Observable<any> {
    return this.http.put<any>(
      this.URL,
      configuracion
    );
  }
}