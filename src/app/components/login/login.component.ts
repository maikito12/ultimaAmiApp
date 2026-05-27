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

  // --- BASE DE DATOS FICTICIA PARA PRUEBAS ---
  //
  usuariosDB = [
    { 
      id: 1, 
      nombre: 'Juan Cruz Di Bello', //
      usuario: 'admin@clinica.com', 
      pass: 'admin', 
      rol: 'Profesional' 
    },
    { 
      id: 2, 
      nombre: 'Ana García', 
      usuario: 'ana@clinica.com', 
      pass: '123456', 
      rol: 'Secretaria' 
    }
  ];

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

    // 1. PRIMERO PROBAMOS CON LA BASE LOCAL PARA TESTEAR PERMISOS
    const usuarioEncontrado = this.usuariosDB.find(
      u => u.usuario === this.email && u.pass === this.password
    );

    if (usuarioEncontrado) {
      // GUARDAMOS EL USUARIO CON SU ROL PARA EL SIDEBAR
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
      localStorage.setItem('token', 'fake-jwt-token'); // Para saltar los Guards

      this.cargando = false;
      this.router.navigate(['/dashboard/inicio']);
      return;
    }

    // 2. SI NO ESTÁ LOCAL, INTENTAMOS CON EL SERVICIO REAL (n8n/Backend)
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.auth) {
          // Si el backend responde, guardamos la respuesta
          // Asegurate que 'res.user' contenga el rol (Profesional/Secretaria)
          localStorage.setItem('usuarioActual', JSON.stringify(res.user));
          this.router.navigate(['/dashboard']);
        } else {
          this.mostrarMensaje('Error', 'Credenciales incorrectas', 'error');
        }
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error en login:', err);
        this.mostrarMensaje('Error', 'No se pudo conectar con el servidor', 'error');
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