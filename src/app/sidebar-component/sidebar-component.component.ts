import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth-service.service';
import Swal from 'sweetalert2';
import { ProfesionalEstadoServiceService } from '../services/profesional-estado-service.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.css'
})
export class SidebarComponent implements OnInit {
  usuarioActual: any = null;
  profesionalSeleccionado: any = null;
  profesionalesAsignados: any[] = [];
@Input() seccion: string = 'inicio';
  
  // ¡Agrega esto!
  @Input() menuOpen: boolean = false;
  constructor(
    private router: Router, 
    private authService: AuthService,
    private profEstadoService: ProfesionalEstadoServiceService // Inyectamos el servicio puente
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.getUsuario();
    // Aquí cargarías tus profesionales desde la API
    // this.cargarProfesionales(); 
    if (this.profesionalesAsignados.length > 0) {
    this.profesionalSeleccionado = this.profesionalesAsignados[0];
    // Disparamos el cambio inicial para que el Dashboard cargue los datos
    this.onProfesionalChange(); 
  }
  }

  // --- FUNCIÓN PARA EL CAMBIO EN CALIENTE ---
  onProfesionalChange() {
    if (this.profesionalSeleccionado) {
      // Emitimos el cambio a toda la app
      this.profEstadoService.cambiarProfesional(this.profesionalSeleccionado);
      console.log('Cambiando agenda a:', this.profesionalSeleccionado.nombre);
    }
  }

  tienePermiso(nombreSeccion: string): boolean {
    if (!this.usuarioActual) return false;
    const rol = this.usuarioActual.rol?.toLowerCase();

    if (rol === 'profesional') return true;

    if (rol === 'secretaria') {
      if (!this.profesionalSeleccionado) return false;
      const permiso = this.profesionalSeleccionado.permisos.find(
        (p: any) => p.nombre.toLowerCase() === nombreSeccion.toLowerCase()
      );
      return permiso ? permiso.activo : false;
    }
    return false;
  }

  cambiarSeccion(nuevaSeccion: string) {
    if (!this.tienePermiso(nuevaSeccion)) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para esta sección.',
        confirmButtonColor: '#7c3aed'
      });
      return; 
    }
    // Si tienes un EventEmitter, lo emites aquí
  }

  cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      confirmButtonText: 'Sí, salir'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}