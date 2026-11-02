
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';


@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './restablecer-contrasena.component.html',
  styleUrls: ['./restablecer-contrasena.component.css']
})
export class RestablecerContrasenaComponent {

  token: string | null = null;

  password = '';
  confirmarPassword = '';

  mostrarPassword = false;
  mostrarConfirmacion = false;

  cargando = false;
  completado = false;

  error = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  get contrasenasCoinciden(): boolean {
    return this.password === this.confirmarPassword;
  }

  get passwordValida(): boolean {
    const bytes = new TextEncoder().encode(this.password).length;

    return this.password.length >= 8 && bytes <= 72;
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleConfirmacion(): void {
    this.mostrarConfirmacion = !this.mostrarConfirmacion;
  }

  guardarPassword(): void {

    if (this.cargando || !this.token) {
      return;
    }

    this.error = '';

    if (!this.passwordValida) {
      this.error =
        'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.';
      return;
    }

    if (!this.contrasenasCoinciden) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;

    this.authService.resetPassword(
      this.token,
      this.password
    ).subscribe({

      next: () => {
        this.cargando = false;
        this.completado = true;

        this.password = '';
        this.confirmarPassword = '';
        this.token = null;
      },

      error: (err: HttpErrorResponse) => {
        this.cargando = false;

        if (err.status === 400) {
          this.error =
            'El enlace es inválido, ya fue utilizado o venció.';
          return;
        }

        if (err.status === 429) {
          this.error =
            'Demasiados intentos. Esperá unos minutos.';
          return;
        }

        this.error =
          'No pudimos actualizar tu contraseña. Intentá nuevamente.';
      }
    });
  }
}
