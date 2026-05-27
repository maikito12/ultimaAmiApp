import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turno-service.service';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos-tabla.component.html',
  styleUrls: ['./turnos-tabla.component.css']
})
export class TurnosComponent implements OnInit {
  
  todosLosTurnos: any[] = [];
  turnosFiltrados: any[] = [];
  turnosHoy: any[] = [];
  proximosTurnos: any[] = [];

  filtroTexto: string = '';
  filtroFecha: string = '';

  mostrarModal: boolean = false;
  pacienteSeleccionado: any = { archivos: [], camposExtras: [] };

  constructor(
    private turnosService: TurnosService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarTurnos();

    // --- MODO PRUEBA: DATOS HARDCODEADOS (MOCK ADAPTADOS A .ESTADO) ---
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    
    const mañana = new Date();
    mañana.setDate(hoy.getDate() + 1);
    const mañanaStr = `${mañana.getFullYear()}-${String(mañana.getMonth() + 1).padStart(2, '0')}-${String(mañana.getDate()).padStart(2, '0')}`;

    this.todosLosTurnos = [
      {
        turnoId: 101,
        hora: '09:00',
        fecha: hoyStr,
        pacienteNombre: 'Maikito Charra',
        pacienteDni: '38123456',
        telefono: '5492235263754',
        sucursal: 'Clínica Del Niño',
        estado: 'atendido',
        sexo: 'M',
        notasEvolucion: 'El paciente presenta una mejora notable en la movilidad.',
        archivos: [],
        datosExtra: {
          obra_social: 'OSDE 210',
          motivo: 'Control Post-operatorio',
          edad: '29 años'
        }
      },
      {
        turnoId: 102,
        hora: '10:30',
        fecha: hoyStr,
        pacienteNombre: 'Cande Rossi',
        pacienteDni: '42987654',
        telefono: '5492237654321',
        sucursal: 'Clínica 25 De Mayo',
        estado: 'pendiente',
        sexo: 'F',
        notasEvolucion: '',
        archivos: [],
        datosExtra: {
          obra_social: 'Swiss Medical',
          motivo: 'Consulta Nutricional',
          edad: '25 años'
        }
      },
      {
        turnoId: 103,
        hora: '11:15',
        fecha: hoyStr,
        pacienteNombre: 'Juan Cruz Di Bello',
        pacienteDni: '39000111',
        telefono: '5492230001112',
        sucursal: 'Clínica Del Niño',
        estado: 'en_espera', // Corregido guion bajo para base de datos
        sexo: 'M',
        notasEvolucion: '',
        archivos: [],
        datosExtra: {
          obra_social: 'Particular',
          motivo: 'Seguimiento de Plan',
          edad: '28 años'
        }
      },
      {
        turnoId: 104,
        hora: '16:00',
        fecha: mañanaStr,
        pacienteNombre: 'Ricardo Fort',
        pacienteDni: '25111222',
        telefono: '5492231112223',
        sucursal: 'Clínica 25 De Mayo',
        estado: 'pendiente',
        sexo: 'M',
        notasEvolucion: 'Sigue prefiriendo el chocolate.',
        archivos: [],
        datosExtra: {
          obra_social: 'Particular',
          motivo: 'Rutina',
          edad: '45 años'
        }
      },
      {
        turnoId: 105,
        hora: '08:30',
        fecha: mañanaStr,
        pacienteNombre: 'Esteban Quito',
        pacienteDni: '12345678',
        telefono: '5492234445556',
        sucursal: 'Clínica Del Niño',
        estado: 'no_asistio',
        sexo: 'O',
        notasEvolucion: '',
        archivos: [],
        datosExtra: {
          obra_social: 'IOMA',
          motivo: 'Primera vez',
          edad: '50 años'
        }
      }
    ];

    this.aplicarFiltros();
  }

  cargarTurnos() {
    const slug = this.auth.getUsuario()?.slug;
    if (!slug) return;

    this.turnosService.obtenerTodosTurnos(slug).subscribe({
      next: (res) => {
        this.todosLosTurnos = res;
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al cargar turnos:', err)
    });
  }

  aplicarFiltros() {
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    
    let resultados = this.todosLosTurnos.filter(turno => {
      const busqueda = this.filtroTexto.toLowerCase();
      const coincideTexto = turno.pacienteNombre.toLowerCase().includes(busqueda) || turno.pacienteDni.includes(busqueda);
      const coincideFecha = this.filtroFecha ? turno.fecha === this.filtroFecha : true;
      return coincideTexto && coincideFecha;
    });

    resultados.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.hora.localeCompare(b.hora);
    });

    this.turnosFiltrados = resultados;
    this.turnosHoy = this.turnosFiltrados.filter(t => t.fecha === hoyStr);
    this.proximosTurnos = this.turnosFiltrados.filter(t => t.fecha !== hoyStr);
  }

  /**
   * NUEVO MÉTODO: Gestiona el cambio de estado rápido desde el dropdown de las tablas
   */
  cambiarEstadoTurno(turno: any, event: Event) {
    const nuevoEstado = (event.target as HTMLSelectElement).value;
    const estadoAnterior = turno.estado || 'pendiente';
    
    turno.estado = nuevoEstado;
    console.log(`Cambiando estado de ${turno.pacienteNombre} a: ${nuevoEstado}`);
    this.aplicarFiltros(); // Re-filtra y refresca las tablas visualmente

    // Descomentar cuando conectes la API de C#:
    /*
    this.turnosService.actualizarEstadoTurno(turno.turnoId, nuevoEstado).subscribe({
      next: () => this.mostrarToast('Estado actualizado en el servidor', 'success'),
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        turno.estado = estadoAnterior;
        this.aplicarFiltros();
        this.mostrarToast('No se pudo guardar el estado', 'error');
      }
    });
    */
  }

  verDetalle(turno: any) {
    this.pacienteSeleccionado = JSON.parse(JSON.stringify(turno));
    if (!this.pacienteSeleccionado.archivos) this.pacienteSeleccionado.archivos = [];
    
    if (this.pacienteSeleccionado.datosExtra) {
      this.pacienteSeleccionado.camposExtras = Object.keys(this.pacienteSeleccionado.datosExtra).map(key => ({
        label: key.replace('_', ' ').toUpperCase(),
        valor: this.pacienteSeleccionado.datosExtra[key]
      }));
    } else {
      this.pacienteSeleccionado.camposExtras = [];
    }

    this.mostrarModal = true;
  }

  cerrarModal() { 
    this.mostrarModal = false; 
  }

  marcarAtendido(turno: any) {
    Swal.fire({
      title: '¿Confirmar atención?',
      text: `¿Deseas marcar a ${turno.pacienteNombre} como atendido?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8a2be2',
      confirmButtonText: 'Sí, atendido',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        turno.estado = 'atendido';
        this.aplicarFiltros();
        this.mostrarToast('Atención registrada', 'success');

        /*
        this.turnosService.notificarAtencion(turno.turnoId).subscribe({
          next: () => this.cargarTurnos(),
          error: () => this.mostrarToast('Error al actualizar el estado', 'error')
        });
        */
      }
    });
  }

  guardarCambios() {
    if (this.pacienteSeleccionado.estado !== 'atendido') {
      this.pacienteSeleccionado.estado = 'atendido';
    }

    const index = this.todosLosTurnos.findIndex(t => t.turnoId === this.pacienteSeleccionado.turnoId);
    if (index !== -1) {
      this.todosLosTurnos[index] = { ...this.pacienteSeleccionado };
      this.aplicarFiltros();
    }

    Swal.fire({
      icon: 'success',
      title: 'Ficha Guardada (Local)',
      text: 'La evolución y los archivos se sincronizaron en memoria.',
      timer: 2000,
      showConfirmButton: false
    });
    this.cerrarModal();

    /*
    this.turnosService.actualizarFicha(this.pacienteSeleccionado).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarTurnos();
      },
      error: () => Swal.fire('Error', 'No se pudo guardar la ficha clínica', 'error')
    });
    */
  }

  cancelarTurno(turno: any) {
    if (turno.estado === 'atendido' || turno.estado === 'cancelado') return;

    Swal.fire({
      title: '¿Cancelar turno?',
      text: `¿Estás seguro de cancelar el turno de ${turno.pacienteNombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        turno.estado = 'cancelado';
        this.aplicarFiltros();
        Swal.fire('Cancelado', 'El turno ha sido cancelado en memoria.', 'success');

        /*
        this.turnosService.cancelarTurno(turno.turnoId).subscribe({
          next: () => this.cargarTurnos(),
          error: () => Swal.fire('Error', 'No se pudo cancelar el turno', 'error')
        });
        */
      }
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pacienteSeleccionado.archivos.push({
          name: file.name,
          type: file.type,
          base64: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  isImage(file: any): boolean { return file.type?.includes('image') || file.base64?.includes('image'); }
  isPdf(file: any): boolean {
    return file.type?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');
  }
  removeFile(index: number) { this.pacienteSeleccionado.archivos.splice(index, 1); }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroFecha = '';
    this.aplicarFiltros();
  }
  
  private mostrarToast(mensaje: string, icono: 'success' | 'error' | 'info') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: icono,
      title: mensaje
    });
  }
}