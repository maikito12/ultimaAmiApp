import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  mostrarPassword: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async login(e: Event) {
    e.preventDefault();

    if (!this.email || !this.password) {
      this.mostrarMensaje('Error', 'Por favor, completa todos los campos', 'warning');
      return;
    }

    // 1. Mostrar cartel de carga
    Swal.fire({
      title: 'Validando...',
      text: 'Por favor, espera un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 2. Ejecutar autenticación
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (usuario) => {
        Swal.close();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        Swal.close();
        // Usamos el mensaje que viene del servicio o uno por defecto
        this.mostrarMensaje('Error', err.message || 'Credenciales incorrectas', 'error');
      }
    });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  private mostrarMensaje(titulo: string, texto: string, icono: any) {
    Swal.fire({
      icon: icono,
      title: titulo,
      text: texto,
      confirmButtonColor: '#8a2be2'
    });
  }
}