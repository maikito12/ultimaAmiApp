import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SidebarComponent } from '../../sidebar-component/sidebar-component.component';

// Importá tu servicio de autenticación (ajustá la ruta según tu proyecto)
import { AuthService } from '../../services/auth-service.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    SidebarComponent, // 🔥 ¡Agregado acá! Sino el HTML te va a romper
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  
  menuOpen: boolean = false;
  profesional: any = null; // Arranca en null hasta que lo lea del servicio

  // Inyectamos el servicio de autenticación en el constructor
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Leemos los datos del usuario logueado (guardados en el localStorage por el login)
    this.profesional = this.authService.getUsuario();
    
    // Si querés dejar un fallback por si estás probando sin login:
    if (!this.profesional) {
      this.profesional = { nombre: 'Juan Cruz Di Bello', rol: 'admin' };
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}