
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import {
  provideServiceWorker
} from '@angular/service-worker';

import { routes } from './app.routes';
import { AuthInterceptorService } from './services/auth-interceptor.service';

export const appConfig: ApplicationConfig = {
  providers: [

    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },

    // ==========================================
    // SERVICE WORKER - PWA Y NOTIFICACIONES
    // ==========================================

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })

  ]
};