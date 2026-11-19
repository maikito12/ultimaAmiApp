
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { WebPushService } from '../../services/web-push.service';

@Component({
  selector: 'app-activar-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activar-notificaciones.component.html',
  styleUrl: './activar-notificaciones.component.css'
})
export class ActivarNotificacionesComponent implements OnInit {

  private readonly webPush = inject(WebPushService);

  estado = 'Comprobando notificaciones...';
  solicitando = false;
  soportado = false;
  esIOS = false;
  instalada = false;
  activada = false;

  ngOnInit(): void {
    const navegador = navigator as Navigator & {
      standalone?: boolean;
    };

    this.esIOS =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (
        navigator.platform === 'MacIntel' &&
        navigator.maxTouchPoints > 1
      );

    this.instalada =
      window.matchMedia('(display-mode: standalone)').matches ||
      navegador.standalone === true;

    this.soportado = this.webPush.disponible;

    this.actualizarEstado();
  }

  actualizarEstado(): void {

    if (this.esIOS && !this.instalada) {
      this.estado =
        'Agregá Coria Salud a la pantalla de inicio y abrila desde su ícono.';
      return;
    }

    if (!this.soportado) {
      this.estado =
        'Las notificaciones no están disponibles en este navegador o entorno.';
      return;
    }

    if (Notification.permission === 'denied') {
      this.estado =
        'Las notificaciones están bloqueadas. Habilitalas desde la configuración del dispositivo.';
      return;
    }

    if (Notification.permission === 'granted') {
      this.estado =
        'El navegador tiene permiso. Presioná el botón para vincular este dispositivo con Coria Salud.';
      return;
    }

    this.estado =
      'Podés activar las notificaciones para recibir avisos en este dispositivo.';
  }

  async activar(): Promise<void> {

    if (
      this.solicitando ||
      !this.soportado ||
      (this.esIOS && !this.instalada)
    ) {
      return;
    }

    this.solicitando = true;

    try {
      await this.webPush.activarNotificaciones();

      this.activada = true;

      this.estado =
        '¡Dispositivo vinculado correctamente! Ya está preparado para recibir notificaciones de Coria Salud.';

    } catch (error: unknown) {

      this.activada = false;

      if (error instanceof HttpErrorResponse) {

        if (error.status === 401) {
          this.estado =
            'Tu sesión venció. Iniciá sesión nuevamente y volvé a activar las notificaciones.';

        } else if (error.status === 409) {
          this.estado =
            'Este dispositivo ya está vinculado a otra cuenta. Primero hay que desvincularlo.';

        } else {
          this.estado =
            'No pudimos registrar el dispositivo en Coria Salud. Intentá nuevamente.';
        }

      } else if (
        error instanceof Error &&
        error.name === 'NotAllowedError'
      ) {
        this.estado =
          'El navegador no permitió activar las notificaciones. Revisá los permisos.';

      } else {
        this.estado =
          error instanceof Error
            ? error.message
            : 'Ocurrió un error al activar las notificaciones.';
      }

    } finally {
      this.solicitando = false;
    }
  }
}
