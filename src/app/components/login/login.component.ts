
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {
  switchMap,
  map,
  of
} from 'rxjs';

import { AuthService } from '../../services/auth-service.service';
import { AlertaService } from '../../services/alerta.service';
import { ContextoService } from '../../services/contexto.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  mostrarPassword = false;
  cargando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private contextoService: ContextoService
  ) {}

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  login(event: Event): void {

    event.preventDefault();

    if (this.cargando) {
      return;
    }

    if (!this.email.trim() || !this.password) {
      this.alertaService.warning(
        'Campos incompletos',
        'Ingresá tu correo electrónico y contraseña.'
      );
      return;
    }

    this.cargando = true;

    this.auth.login({
      email: this.email.trim(),
      password: this.password
    }).pipe(

      switchMap(() => {

        // ==========================================
        // SUPER ADMIN
        // ==========================================

        if (this.auth.esSuperAdmin()) {
          return of('super-admin');
        }

        // ==========================================
        // OBTENER ORGANIZACIONES
        // ==========================================

        return this.contextoService
          .obtenerOrganizaciones()
          .pipe(

            switchMap(organizaciones => {

              if (organizaciones.length === 0) {
                return of('sin-organizacion');
              }

              // Priorizar la organización actual.
              // Si solo tiene una, seleccionarla.
              const organizacion =
                organizaciones.find(o => o.esActual) ??
                (
                  organizaciones.length === 1
                    ? organizaciones[0]
                    : null
                );

              if (!organizacion) {
                return of('seleccionar-organizacion');
              }

              // Sincronizar la organización
              // antes de navegar.
              return this.contextoService
                .cambiarOrganizacion(
                  organizacion.organizacionId
                )
                .pipe(
                  map(() => 'dashboard')
                );

            })

          );

      })

    ).subscribe({

      // ==========================================
      // LOGIN CORRECTO
      // ==========================================

      next: destino => {

        this.cargando = false;

        // Obtener la redirección del QR.
        const redireccion =
          this.route.snapshot.queryParamMap.get('redirect');

        // Únicamente permitimos esta ruta.
        const vieneDeQR =
          redireccion === '/activar-notificaciones';

        // ==========================================
        // SUPER ADMIN
        // ==========================================

        if (destino === 'super-admin') {

          this.router.navigate(['/super-admin']);
          return;

        }

        // ==========================================
        // USUARIO CON ORGANIZACIÓN
        // ==========================================

        if (destino === 'dashboard') {

          if (vieneDeQR) {

            // Acceso desde el QR del celular.
            this.router.navigate([
              '/activar-notificaciones'
            ]);

          } else {

            // Login normal desde la web.
            this.router.navigate([
              '/dashboard'
            ]);

          }

          return;
        }

        // ==========================================
        // SIN ORGANIZACIÓN SELECCIONADA
        // ==========================================

        this.alertaService.info(
          'Seleccionar organización',
          'Necesitás seleccionar una organización para continuar.'
        );

      },

      // ==========================================
      // ERROR DE LOGIN
      // ==========================================

      error: error => {

        this.cargando = false;

        console.error(
          'Error al iniciar sesión:',
          error
        );

        this.alertaService.error(
          'No se pudo iniciar sesión',
          this.obtenerMensajeError(
            error,
            'No pudimos cargar tu organización.'
          )
        );

      }

    });

  }

  // ==========================================
  // MOSTRAR / OCULTAR CONTRASEÑA
  // ==========================================

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // ==========================================
  // REGISTRO
  // ==========================================

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  // ==========================================
  // RECUPERAR CONTRASEÑA
  // ==========================================

  recuperarPassword(): void {
    this.router.navigate(['/olvide-contrasena']);
  }

  // ==========================================
  // REGISTRO CON INVITACIÓN
  // ==========================================

  irAInvitacion(): void {

    this.router.navigate(
      ['/registro'],
      {
        queryParams: {
          modo: 'invitacion'
        }
      }
    );

  }

  // ==========================================
  // MENSAJES DE ERROR
  // ==========================================

  private obtenerMensajeError(
    error: any,
    mensajeDefault: string
  ): string {

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.error?.Message) {
      return error.error.Message;
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    return mensajeDefault;

  }

}
