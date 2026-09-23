import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AuthService } from '../../services/auth-service.service';
import { AlertaService } from '../../services/alerta.service';


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
    private alertaService: AlertaService
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
    }).subscribe({

    next: () => {

  this.cargando = false;


  // ==========================================
  // SUPER ADMIN
  // ==========================================

  if (
    this.auth.esSuperAdmin()
  ) {

    this.router.navigate(
      ['/super-admin']
    );

    return;
  }


  // ==========================================
  // USUARIO NORMAL
  // ==========================================

  this.router.navigate(
    ['/dashboard']
  );

},

      error: (error) => {
        this.cargando = false;

        console.error(
          'Error de login:',
          error
        );

        this.alertaService.error(
          'No se pudo iniciar sesión',
          this.obtenerMensajeError(
            error,
            'Verificá tu correo electrónico y contraseña.'
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
