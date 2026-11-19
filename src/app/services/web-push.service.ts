
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom, take } from 'rxjs';
import { environment } from '../../environments/environment.development';


// ==========================================
// INTERFACES
// ==========================================

interface PushRegistro {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  dispositivo: string;
}

// ==========================================
// WEB PUSH SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class WebPushService {

  private readonly http = inject(HttpClient);
  private readonly swPush = inject(SwPush);

  // ==========================================
  // DISPONIBILIDAD
  // ==========================================

  get disponible(): boolean {
    return this.swPush.isEnabled &&
      typeof Notification !== 'undefined';
  }

  // ==========================================
  // ACTIVAR NOTIFICACIONES
  // ==========================================

  async activarNotificaciones(): Promise<void> {

    if (!this.disponible) {
      throw new Error(
        'Las notificaciones Push no están disponibles en este navegador o entorno.'
      );
    }

    if (Notification.permission === 'denied') {
      throw new Error(
        'Las notificaciones están bloqueadas. Habilitalas desde la configuración del navegador.'
      );
    }

    const clavePublica = environment.vapidPublicKey;

    if (!clavePublica || !clavePublica.trim()) {
      throw new Error(
        'Falta configurar la clave pública VAPID.'
      );
    }

    // ==========================================
    // OBTENER O CREAR SUSCRIPCIÓN
    // ==========================================

    let suscripcion = await firstValueFrom(
      this.swPush.subscription.pipe(take(1))
    );

    if (!suscripcion) {
      suscripcion = await this.swPush.requestSubscription({
        serverPublicKey: clavePublica
      });
    }

    // ==========================================
    // VALIDAR DATOS DE LA SUSCRIPCIÓN
    // ==========================================

    const datos = suscripcion.toJSON();

    const endpoint = datos.endpoint;
    const p256dh = datos.keys?.['p256dh'];
    const auth = datos.keys?.['auth'];

    if (!endpoint || !p256dh || !auth) {
      throw new Error(
        'El navegador devolvió una suscripción Web Push inválida.'
      );
    }

    // ==========================================
    // PREPARAR DATOS PARA EL BACKEND
    // ==========================================

    const registro: PushRegistro = {
      endpoint,
      keys: {
        p256dh,
        auth
      },
      dispositivo: navigator.userAgent.substring(0, 120)
    };

    // ==========================================
    // REGISTRAR DISPOSITIVO EN CORIA SALUD
    // ==========================================

    const apiUrl = environment.apiUrl.replace(/\/+$/, '');

    try {
      await firstValueFrom(
        this.http.post(
          `${apiUrl}/push-suscripciones`,
          registro
        )
      );

      console.log(
        'Web Push: dispositivo registrado correctamente.'
      );

    } catch (error) {
      console.error(
        'Web Push: error al registrar el dispositivo en Coria Salud.',
        error
      );

      throw error;
    }
  }
}
