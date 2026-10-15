
import { environmentProduccion } from '../../environments/environment';
import { Injectable, NgZone, inject } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
} from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private readonly zone = inject(NgZone);
private readonly authService = inject(AuthService);
  private conexion: HubConnection | null = null;

  private readonly turnosActualizadosSubject =
    new Subject<void>();

  readonly turnosActualizados$ =
    this.turnosActualizadosSubject.asObservable();


async conectar(): Promise<void> {

  const token = this.authService.getToken();

  if (!token) {
    console.warn(
      'SignalR: no hay una sesión autenticada.'
    );
    return;
  }

  if (this.conexion) {

   if (
  this.conexion.state === HubConnectionState.Connected ||
  this.conexion.state === HubConnectionState.Connecting ||
  this.conexion.state === HubConnectionState.Reconnecting
) {
  return;
}

    await this.desconectar();
  }

  const apiUrl =
    environmentProduccion.apiUrl
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');

  this.conexion = new HubConnectionBuilder()
    .withUrl(
      `${apiUrl}/hubs/notificaciones`,
      {
        accessTokenFactory: () =>
          this.authService.getToken() ?? ''
      }
    )
    .withAutomaticReconnect({
  nextRetryDelayInMilliseconds: () => 5000
})
    .configureLogging(LogLevel.Warning)
    .build();

  // ==========================================
  // EVENTO: TURNOS ACTUALIZADOS
  // ==========================================

  this.conexion.on(
    'TurnosActualizados',
    () => {

      this.zone.run(() => {
        this.turnosActualizadosSubject.next();
      });

    }
  );

  // ==========================================
  // SIGNALR: RECONEXIÓN AUTOMÁTICA
  // ==========================================

  this.conexion.onreconnecting((error) => {

    console.warn(
      'SignalR: conexión perdida. Intentando reconectar...',
      error
    );

  });

  // ==========================================
  // SIGNALR: CONEXIÓN RECUPERADA
  // ==========================================

  this.conexion.onreconnected(() => {

    console.log(
      'SignalR: conexión recuperada correctamente'
    );

    // Actualizar la agenda para recuperar
    // los cambios ocurridos durante el corte.
    this.zone.run(() => {
      this.turnosActualizadosSubject.next();
    });

  });

  // ==========================================
  // SIGNALR: CONEXIÓN CERRADA
  // ==========================================

  this.conexion.onclose((error) => {

    console.warn(
      'SignalR: conexión cerrada',
      error
    );

  });

  // ==========================================
  // INICIAR CONEXIÓN
  // ==========================================

  try {

    await this.conexion.start();

    console.log(
      'SignalR conectado correctamente'
    );

  } catch (error) {

    console.error(
      'Error al conectar SignalR:',
      error
    );

    throw error;
  }
}


  async desconectar(): Promise<void> {
    if (!this.conexion) {
      return;
    }

    const conexionActual = this.conexion;
    this.conexion = null;

    await conexionActual.stop();
  }
}
