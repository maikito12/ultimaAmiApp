
import { inject } from '@angular/core';

import {
  Router,
  CanActivateFn
} from '@angular/router';

import { AuthService } from '../services/auth-service.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // ==========================================
  // USUARIO AUTENTICADO
  // ==========================================

  if (authService.estaAutenticado()) {
    return true;
  }

  // ==========================================
  // USUARIO NO AUTENTICADO
  // ==========================================

  // Conservamos únicamente la redirección
  // a activar notificaciones.
  const vieneDeNotificaciones =
    state.url.split('?')[0] === '/activar-notificaciones';

  if (vieneDeNotificaciones) {

    return router.createUrlTree(
      ['/login'],
      {
        queryParams: {
          redirect: '/activar-notificaciones'
        }
      }
    );

  }

  // ==========================================
  // LOGIN NORMAL
  // ==========================================

  return router.createUrlTree(['/login']);

};
