import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-equipo.component.html',
  styleUrls: ['./gestion-equipo.component.css']
})
export class GestionEquipoComponent {
  mostrarPassword = false;
  mostrarModalEdit = false;
  
  // Datos para el formulario de creación rápida
  nuevoColaborador = { nombre: '', usuario: '', pass: '', rol: 'Secretaria' };
  
  // Esta lista solo se usa para resetear el formulario de creación
  permisosBaseOriginal = [
    { nombre: 'Inicio', activo: true },
    { nombre: 'Turnos', activo: true },
    { nombre: 'Clientes', activo: true },
    { nombre: 'Estadísticas', activo: false },
    { nombre: 'Periodo de inactividad', activo: false },
    { nombre: 'Gestión de Equipo', activo: false }
  ];

  // Copia de trabajo para la creación
  permisosBase = JSON.parse(JSON.stringify(this.permisosBaseOriginal));

  colaboradores = [
    { 
      id: 1, 
      nombre: 'Ana García', 
      usuario: 'ana@clinica.com', 
      pass: '123456', 
      rol: 'Secretaria', 
      estado: 'Conectado',
      permisos: JSON.parse(JSON.stringify(this.permisosBaseOriginal))
    }
  ];

  // Objeto que maneja la modal de edición
  colaboradorEdicion: any = null;

  togglePassword() { this.mostrarPassword = !this.mostrarPassword; }

  confirmarAcceso() {
    if (!this.nuevoColaborador.nombre || !this.nuevoColaborador.usuario) {
      Swal.fire('Error', 'Completá los datos básicos', 'error');
      return;
    }
    
    // Clonamos permisosBase para que la nueva secretaria tenga su propia copia física
    this.colaboradores.push({
      ...this.nuevoColaborador,
      id: Date.now(),
      estado: 'Desconectado',
      permisos: JSON.parse(JSON.stringify(this.permisosBase))
    });

    Swal.fire('¡Listo!', 'Colaborador registrado', 'success');
    this.limpiarForm();
  }

  // --- LÓGICA DE LA MODAL ---

  abrirEdicion(c: any) {
    // Creamos una copia profunda. Nada de lo que pase en la modal afectará 
    // a la lista principal hasta que toquemos "Guardar Todo".
    this.colaboradorEdicion = JSON.parse(JSON.stringify(c));
    this.mostrarModalEdit = true;
  }

  guardarCambios() {
    const index = this.colaboradores.findIndex(c => c.id === this.colaboradorEdicion.id);
    if (index !== -1) {
      // Reemplazamos el objeto viejo por el editado (que ya trae sus propios permisos modificados)
      this.colaboradores[index] = this.colaboradorEdicion;
      this.cerrarModal();
      Swal.fire({
        title: 'Guardado',
        text: 'Se actualizaron los datos y permisos',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  cerrarModal() { 
    this.mostrarModalEdit = false; 
    this.colaboradorEdicion = null; 
  }

  // -------------------------

  eliminarColaborador(c: any) {
    Swal.fire({
      title: '¿Eliminar?',
      text: `Borrarás el acceso de ${c.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (res.isConfirmed) this.colaboradores = this.colaboradores.filter(i => i.id !== c.id);
    });
  }

  limpiarForm() {
    this.nuevoColaborador = { nombre: '', usuario: '', pass: '', rol: 'Secretaria' };
    this.permisosBase = JSON.parse(JSON.stringify(this.permisosBaseOriginal));
  }
}