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
  cargando: boolean = false;

  constructor(
    private auth: AuthService, 
    private router: Router
  ) {}

  async login(e: any) {
    e.preventDefault();
    
    if (!this.email || !this.password) {
      this.mostrarMensaje('Error', 'Por favor, completa todos los campos', 'warning');
      return;
    }

    this.cargando = true;

    // Conectamos directamente con el Backend (C# + PostgreSQL)
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (usuario) => {
        this.cargando = false;
        // El servicio ya guardó el usuario en localStorage gracias al tap()
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
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