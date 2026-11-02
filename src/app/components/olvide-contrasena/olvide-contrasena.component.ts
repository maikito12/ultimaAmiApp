
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';



@Component({
  selector: 'app-olvide-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './olvide-contrasena.component.html',
  styleUrls: ['./olvide-contrasena.component.css']
})
export class OlvideContrasenaComponent {

  email = '';

  cargando = false;
  enviado = false;
  error = '';

  constructor(
    private authService: AuthService
  ) {}

  enviar(): void {

    const email = this.email.trim();

    if (!email || this.cargando) {
      return;
    }

    this.error = '';
    this.cargando = true;

    this.authService
      .forgotPassword(email)
      .subscribe({
        next: () => {
          this.cargando = false;
          this.enviado = true;
        },

        error: (err: HttpErrorResponse) => {
          this.cargando = false;

          if (err.status === 429) {
            this.error =
              'Realizaste demasiados intentos. ' +
              'Esperá unos minutos y volvé a intentar.';
            return;
          }

          this.error =
            'No pudimos procesar tu solicitud. ' +
            'Intentá nuevamente más tarde.';
        }
      });
  }
}
