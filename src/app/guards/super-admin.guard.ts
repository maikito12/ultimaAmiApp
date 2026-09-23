import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth-service.service';


export const superAdminGuard: CanActivateFn =
  () => {

    const auth =
      inject(AuthService);

    const router =
      inject(Router);


    // ==========================================
    // SIN SESIÓN
    // ==========================================

    if (!auth.estaAutenticado()) {

      return router.createUrlTree(
        ['/login']
      );

    }


    // ==========================================
    // NO ES SUPER ADMIN
    // ==========================================

    if (!auth.esSuperAdmin()) {

      return router.createUrlTree(
        ['/dashboard']
      );

    }


    // ==========================================
    // SUPER ADMIN
    // ==========================================

    return true;

  };