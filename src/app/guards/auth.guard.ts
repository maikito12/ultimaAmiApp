import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service.service'; // Asegúrate de que la ruta sea correcta

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario está autenticado, lo dejamos pasar
  if (authService.estaAutenticado()) {
    return true;
  } 
  
  // Si no, lo mandamos al login
  router.navigate(['/login']);
  return false;
};