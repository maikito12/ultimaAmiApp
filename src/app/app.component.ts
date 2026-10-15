
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { AlertaComponent } from './app/shared/alertas/alerta/alerta.component';
import { DialogoComponent } from './app/shared/dialogos/dialogo/dialogo.component';

import { AuthService } from './services/auth-service.service';
import { SignalrService } from './services/signalr.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AlertaComponent,
    DialogoComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'CoriaSalud';

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly signalrService = inject(SignalrService);

  private navegacionSubscription?: Subscription;
  private sincronizacion = Promise.resolve();

  ngOnInit(): void {

    this.navegacionSubscription = this.router.events
      .pipe(
        filter(
          (evento): evento is NavigationEnd =>
            evento instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        this.sincronizarSignalR();
      });

    this.sincronizarSignalR();
  }


private sincronizarSignalR(): void {

  // Tomamos la ruta actual.
  const url = this.router.url.split('?')[0];

  // SignalR solo funciona dentro del dashboard.
  const estaEnDashboard =
    url === '/dashboard' ||
    url.startsWith('/dashboard/');

  // Comprobamos que exista una sesión.
  const estaAutenticado =
    this.authService.estaAutenticado();

  // El superadministrador global no utiliza
  // este canal de notificaciones.
  const esSuperAdmin =
    this.authService.esSuperAdmin();

  // Comprobamos el contexto de organización
  // en el token validado por el backend.
  const token = this.authService.getToken();

  let tieneOrganizacion = false;

  if (token) {
    try {
      const payloadBase64 = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload = JSON.parse(
        atob(payloadBase64)
      );

      tieneOrganizacion =
        !!payload['organizacionId'];

    } catch {
      tieneOrganizacion = false;
    }
  }

  const debeConectar =
    estaEnDashboard &&
    estaAutenticado &&
    !esSuperAdmin &&
    tieneOrganizacion;

  this.sincronizacion = this.sincronizacion
    .catch(() => {})
    .then(async () => {

      if (!debeConectar) {
        await this.signalrService.desconectar();
        return;
      }

      await this.signalrService.conectar();
    })
    .catch(error => {
      console.error(
        'Error al sincronizar SignalR:',
        error
      );
    });
}

  ngOnDestroy(): void {
    this.navegacionSubscription?.unsubscribe();
    void this.signalrService.desconectar();
  }
}
