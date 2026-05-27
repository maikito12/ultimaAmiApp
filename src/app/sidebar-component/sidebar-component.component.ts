import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANTE para el select
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() seccion: string = 'inicio';
  @Input() menuOpen: boolean = false;
  @Output() seccionCambiada = new EventEmitter<string>();
  @Output() toggleMenu = new EventEmitter<void>();

  // --- NUEVAS PROPIEDADES ---
  usuarioActual: any = null;
  profesionalSeleccionado: any = null;
  
  // Lista de prueba (Esto después lo podés traer de un servicio o de la DB)
  profesionalesAsignados = [
    { 
      id: 101, 
    nombre: 'Dr. Pérez (Pediatría)', 
    permisos: [
      { nombre: 'Inicio', activo: true },
      { nombre: 'Turnos', activo: true },
      { nombre: 'Clientes', activo: true },
      { nombre: 'Estadísticas', activo: false },
      { nombre: 'Periodo de inactividad', activo: false }, // <--- AQUÍ ESTABA EL ERROR
      { nombre: 'Gestión de Equipo', activo: false }
    ]
    },
    { 
      id: 102, 
      nombre: 'Dra. García (Nutrición)', 
      permisos: [
        { nombre: 'Inicio', activo: true },
        { nombre: 'Turnos', activo: true },
        { nombre: 'Clientes', activo: true },
        { nombre: 'Estadísticas', activo: true },
        { nombre: 'Periodo de inactividad', activo: true },
        { nombre: 'Gestión de Equipo', activo: false }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Cargamos el usuario desde el localStorage al iniciar
    const data = localStorage.getItem('usuarioActual');
    this.usuarioActual = data ? JSON.parse(data) : null;

    // Si es secretaria, pre-seleccionamos el primer profesional
    if (this.usuarioActual?.rol === 'Secretaria' && this.profesionalesAsignados.length > 0) {
      this.profesionalSeleccionado = this.profesionalesAsignados[0];
    }
  }

  // --- LÓGICA DE PERMISOS ---
  tienePermiso(nombreSeccion: string): boolean {
    // 1. El Profesional siempre tiene acceso a todo
    if (this.usuarioActual?.rol === 'Profesional') {
      return true;
    }

    // 2. La Secretaria depende del profesional seleccionado
    if (this.usuarioActual?.rol === 'Secretaria') {
      if (!this.profesionalSeleccionado) return false;
      
      const permiso = this.profesionalSeleccionado.permisos.find(
        (p: any) => p.nombre === nombreSeccion
      );
      return permiso ? permiso.activo : false;
    }

    return false;
  }

  cambiarSeccion(nuevaSeccion: string) {
  // Si no tiene permiso, cortamos la ejecución acá para que no navegue
  if (!this.tienePermiso(nuevaSeccion)) {
    console.log("Sección bloqueada para este profesional");
    return; 
  }
  
  this.seccionCambiada.emit(nuevaSeccion);
}

  cambiarProfesional() {
    console.log('Cambiando agenda a:', this.profesionalSeleccionado.nombre);
    // Aquí podrías emitir un evento al dashboard para recargar los turnos
    // this.profesionalCambiado.emit(this.profesionalSeleccionado);
  }



  cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Tendrás que volver a ingresar tus credenciales para acceder.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result: any) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuarioActual'); // Limpiamos el usuario
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}