import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { switchMap, map, of } from 'rxjs';
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
    private alertaService: AlertaService,
    private contextoService: ContextoService
  ) {}

  login(event: Event): void {

    event.preventDefault();

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
    if (this.auth.esSuperAdmin()) {
      return of('super-admin');
    }

    return this.contextoService.obtenerOrganizaciones().pipe(
      switchMap(organizaciones => {
        if (organizaciones.length === 0) {
          return of('sin-organizacion');
        }

        const organizacion =
          organizaciones.find(o => o.esActual) ??
          (organizaciones.length === 1 ? organizaciones[0] : null);

        if (!organizacion) {
          return of('seleccionar-organizacion');
        }

        return this.contextoService
          .cambiarOrganizacion(organizacion.organizacionId)
          .pipe(map(() => 'dashboard'));
      })
    );
  })
).subscribe({
  next: destino => {
    this.cargando = false;

    if (destino === 'super-admin') {
      this.router.navigate(['/super-admin']);
    } else if (destino === 'dashboard') {
      this.router.navigate(['/dashboard']);
    } else {
      // Usar acá las rutas reales de tu aplicación
      // para seleccionar organización o mostrar
      // el estado sin organización.
      this.alertaService.info(
        'Seleccionar organización',
        'Necesitás seleccionar una organización para continuar.'
      );
    }
  },
  error: error => {
    this.cargando = false;

    console.error('Error al iniciar sesión:', error);

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

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

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

  recuperarPassword(): void {
    this.alertaService.info(
      'Recuperación de contraseña',
      'Esta opción la conectamos cuando armemos el flujo de recuperación por correo.'
    );
  }

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
