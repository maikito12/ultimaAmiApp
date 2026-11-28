
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom, take } from 'rxjs';
import { environmentProduccion } from '../../environments/environment';







interface PushRegistro {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  dispositivo: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebPushService {

  private readonly http = inject(HttpClient);
  private readonly swPush = inject(SwPush);

  get disponible(): boolean {
    return this.swPush.isEnabled &&
      typeof Notification !== 'undefined';
  }

  // Activación normal: conserva la suscripción existente.
  async activarNotificaciones(): Promise<void> {
    await this.registrarSuscripcion(false);
  }

  // Recuperación manual: elimina la suscripción del navegador
  // y solicita una nueva.
  async renovarNotificaciones(): Promise<void> {
    await this.registrarSuscripcion(true);
  }

  private async registrarSuscripcion(
    forzarRenovacion: boolean
  ): Promise<void> {

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

    const clavePublica = environmentProduccion.vapidPublicKey;

    if (!clavePublica?.trim()) {
      throw new Error(
        'Falta configurar la clave pública VAPID.'
      );
    }

    let suscripcion = await firstValueFrom(
      this.swPush.subscription.pipe(take(1))
    );

    // Solo cuando el usuario solicita una renovación.
 if (forzarRenovacion && suscripcion) {
  await this.swPush.unsubscribe();
  suscripcion = null;
}

    if (!suscripcion) {
      suscripcion = await this.swPush.requestSubscription({
        serverPublicKey: clavePublica
      });
    }

    const datos = suscripcion.toJSON();

    const endpoint = datos.endpoint;
    const p256dh = datos.keys?.['p256dh'];
    const auth = datos.keys?.['auth'];

    if (!endpoint || !p256dh || !auth) {
      throw new Error(
        'El navegador devolvió una suscripción Web Push inválida.'
      );
    }

    const registro: PushRegistro = {
      endpoint,
      keys: {
        p256dh,
        auth
      },
      dispositivo: navigator.userAgent.substring(0, 120)
    };

    const apiUrl = environmentProduccion.apiUrl.replace(/\/+$/, '');

    try {
      await firstValueFrom(
        this.http.post(
          `${apiUrl}/push-suscripciones`,
          registro
        )
      );

      console.log(
        forzarRenovacion
          ? 'Web Push: suscripción renovada correctamente.'
          : 'Web Push: dispositivo registrado correctamente.'
      );

    } catch (error) {
      console.error(
        'Web Push: error al registrar el dispositivo.',
        error
      );

      throw error;
    }
  }
}
