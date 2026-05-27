import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-periodo-inactividad',
  standalone: true, 
  templateUrl: './inactividad.component.html',
  styleUrls:  ['./inactividad.component.css'],
  imports: [CommonModule, FormsModule]  
})
export class InactividadComponent {
  
  // Control de la pestaña activa en la interfaz
  tabActiva: string = 'horarios';

  // Configuración de los días de la semana alineada a Supabase (0=Dom, 1=Lun, ..., 6=Sab)
  diasSemana = [
    { id: 1, nombre: 'Lunes', corto: 'L', seleccionado: false },
    { id: 2, nombre: 'Martes', corto: 'M', seleccionado: false },
    { id: 3, nombre: 'Miércoles', corto: 'X', seleccionado: false },
    { id: 4, nombre: 'Jueves', corto: 'J', seleccionado: false },
    { id: 5, nombre: 'Viernes', corto: 'V', seleccionado: false },
    { id: 6, nombre: 'Sábado', corto: 'S', seleccionado: false },
    { id: 0, nombre: 'Domingo', corto: 'D', seleccionado: false }
  ];

  // ==========================================================================
  // ARRAYS DE DATOS (Mocks iniciales vinculados a las tablas)
  // ==========================================================================
  listaSucursales: any[] = [
    { id: 'suc-111', nombre: 'Clínica Del Niño', calle: 'Av. Colón', altura: '2450', piso_depto: 'Piso 2', ciudad: 'Mar del Plata' }
  ];

  listaHorarios: any[] = [
    { id: 'hor-1', sucursal_id: 'suc-111', dia_semana: 1, hora_inicio: '08:00', hora_fin: '12:00', duracion_turno: 30 },
    { id: 'hor-2', sucursal_id: 'suc-111', dia_semana: 3, hora_inicio: '08:00', hora_fin: '12:00', duracion_turno: 30 }
  ];

  listaBloqueos: any[] = [
    { id: 1, inicio: '2026-05-10T00:00', fin: '2026-05-12T23:59', motivo: 'Vacaciones' }
  ];

  // ==========================================================================
  // MODELOS VINCULADOS A LOS FORMULARIOS (NgModel)
  // ==========================================================================
  nuevaSucursal = {
    nombre: '',
    calle: '',
    altura: '',
    piso_depto: '',
    ciudad: ''
  };

  nuevoHorario = {
    sucursal_id: '',
    hora_inicio: '',
    hora_fin: '',
    duracion_turno: 30
  };

  nuevoBloqueo = {
    inicio: '',
    fin: '',
    motivo: ''
  };

  // Cambiar entre las pestañas (Horarios, Sucursales, Bloqueos)
  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  // ==========================================================================
  // 1. LÓGICA DE GESTIÓN DE SUCURSALES
  // ==========================================================================
  guardarSucursal() {
    if (!this.nuevaSucursal.nombre || !this.nuevaSucursal.calle || !this.nuevaSucursal.altura || !this.nuevaSucursal.ciudad) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor, completá los campos obligatorios de la sucursal.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    const sucursalCreada = { 
      ...this.nuevaSucursal, 
      id: 'suc-' + Date.now() 
    };
    
    this.listaSucursales.push(sucursalCreada);

    Swal.fire({
      icon: 'success',
      title: 'Sucursal Registrada',
      text: 'La sede se cargó correctamente.',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      timerProgressBar: true
    });

    this.nuevaSucursal = { nombre: '', calle: '', altura: '', piso_depto: '', ciudad: '' };
  }

  eliminarSucursal(id: string) {
    Swal.fire({
      title: '¿Eliminar sucursal?',
      text: "Se quitarán también los horarios vinculados a ella.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7b2cbf',
      cancelButtonColor: '#ff4d4d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.listaSucursales = this.listaSucursales.filter(s => s.id !== id);
        this.listaHorarios = this.listaHorarios.filter(h => h.sucursal_id !== id);
        
        Swal.fire({
          title: 'Eliminada',
          text: 'La sucursal fue dada de baja.',
          icon: 'success',
          confirmButtonColor: '#7b2cbf'
        });
      }
    });
  }

  // ==========================================================================
  // 2. LÓGICA DE GESTIÓN DE HORARIOS DE ATENCIÓN
  // ==========================================================================
  guardarHorario() {
    const algunDiaSeleccionado = this.diasSemana.some(d => d.seleccionado);

    if (!this.nuevoHorario.sucursal_id || !this.nuevoHorario.hora_inicio || !this.nuevoHorario.hora_fin || !algunDiaSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Seleccioná la sucursal, los horarios y al menos un día de atención.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    // Insertar un registro por cada día tildado (así va directo a Supabase)
    this.diasSemana.forEach(d => {
      if (d.seleccionado) {
        this.listaHorarios.push({
          id: 'hor-' + Date.now() + Math.random().toString(36).substr(2, 4),
          sucursal_id: this.nuevoHorario.sucursal_id,
          dia_semana: d.id,
          hora_inicio: this.nuevoHorario.hora_inicio,
          hora_fin: this.nuevoHorario.hora_fin,
          duracion_turno: this.nuevoHorario.duracion_turno
        });
      }
    });

    Swal.fire({
      icon: 'success',
      title: 'Cronograma Actualizado',
      text: 'Los horarios de atención semanales se guardaron con éxito.',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      timerProgressBar: true
    });

    this.nuevoHorario = { sucursal_id: '', hora_inicio: '', hora_fin: '', duracion_turno: 30 };
    this.diasSemana.forEach(d => d.seleccionado = false);
  }

  // Elimina un bloque completo agrupado (mismo rango, misma sede) desde la interfaz visual
  eliminarHorarioAgrupado(sucursalId: string, inicio: string, fin: string) {
    this.listaHorarios = this.listaHorarios.filter(h => 
      !(h.sucursal_id === sucursalId && h.hora_inicio === inicio && h.hora_fin === fin)
    );

    Swal.fire({
      title: 'Horarios Removidos',
      text: 'El bloque horario se eliminó del cronograma.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  // ==========================================================================
  // 3. LÓGICA DE GESTIÓN DE BLOQUEOS DE AGENDA
  // ==========================================================================
  guardarBloqueo() {
    if (!this.nuevoBloqueo.inicio || !this.nuevoBloqueo.fin) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor, completá los rangos de fecha y hora del bloqueo.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    const bloqueoCreado = { 
      ...this.nuevoBloqueo, 
      id: Date.now() 
    };
    
    this.listaBloqueos.push(bloqueoCreado);

    Swal.fire({
      icon: 'success',
      title: 'Agenda Bloqueada',
      text: 'Los horarios se pausaron en la web correctamente.',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      timerProgressBar: true
    });

    this.nuevoBloqueo = { inicio: '', fin: '', motivo: '' };
  }

  eliminarBloqueo(id: number) {
    Swal.fire({
      title: '¿Habilitar horarios?',
      text: "Esta acción volverá a mostrar los turnos en la web.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7b2cbf',
      cancelButtonColor: '#ff8a8a',
      confirmButtonText: 'Sí, habilitar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.listaBloqueos = this.listaBloqueos.filter(b => b.id !== id);
        
        Swal.fire({
          title: '¡Habilitado!',
          text: 'La agenda vuelve a estar disponible en ese rango.',
          icon: 'success',
          confirmButtonColor: '#7b2cbf'
        });
      }
    });
  }

  // ==========================================================================
  // GETTERS Y LOGICA DE AGRUPACIÓN (EVITA REPETICIONES EN LA VISTA)
  // ==========================================================================
 // ==========================================================================
  // GETTERS Y LOGICA DE AGRUPACIÓN (EVITA REPETICIONES EN LA VISTA)
  // ==========================================================================
  get horariosAgrupados(): any[] {
    const grupos: { [key: string]: any } = {};

    this.listaHorarios.forEach(h => {
      const clave = `${h.sucursal_id}_${h.hora_inicio}_${h.hora_fin}_${h.duracion_turno}`;

      if (!grupos[clave]) {
        grupos[clave] = {
          sucursal_id: h.sucursal_id,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          duracion_turno: h.duracion_turno,
          dias: []
        };
      }
      if (!grupos[clave].dias.includes(h.dia_semana)) {
        grupos[clave].dias.push(h.dia_semana);
      }
    });

    return Object.values(grupos).map(g => {
      // Ordena los días numéricamente poniendo el Domingo (0) al final
      g.dias.sort((a: any, b: any) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
      return g;
    });
  }

  formatearDiasTexto(dias: any[]): string {
    if (!dias || dias.length === 0) return 'Sin días';
    if (dias.length === 7) return 'Todos los días';
    
    // 1. Caso específico: Lunes a Sábado (Id 1 al 6)
    if (dias.length === 6 && Number(dias) === 1 && Number(dias) === 6) {
      return 'Lunes a Sábado';
    }
    
    // 2. Rango fluido general para cualquier bloque de días seguidos (ej: Lunes a Viernes)
    const primerDia = Number(dias);
    const ultimoDia = Number(dias[dias.length - 1]);
    
    if (dias.length > 2 && (ultimoDia - primerDia === dias.length - 1)) {
      return `${this.mapearDiaTexto(primerDia)} a ${this.mapearDiaTexto(ultimoDia)}`;
    }

    // 3. Si están salteados, se listan separados por coma
    return dias.map(d => this.mapearDiaTexto(Number(d))).join(', ');
  }  // ==========================================================================
  // HELPERS (Mapeo de IDs a Cadenas de Texto)
  // ==========================================================================
  obtenerNombreSucursal(id: string): string {
    const sucursal = this.listaSucursales.find(s => s.id === id);
    return sucursal ? sucursal.nombre : 'Sede Desconocida';
  }

  mapearDiaTexto(id: number): string {
    const dia = this.diasSemana.find(d => d.id === id);
    return dia ? dia.nombre : 'Día Desconocido';
  }
}