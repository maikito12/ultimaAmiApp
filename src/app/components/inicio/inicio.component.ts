import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turno-service.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  
  stats: any = { turnosHoy: 0, turnosSemana: 0, clientesTotal: 0, turnosAtendidosHoy: 0 };
  proximosTurnos: any[] = [];
  notasDia: string = '';
  mostrarModal = false;
  pacienteSeleccionado: any = null;

  cumplesHoy: any[] = [];
  mostrarModalCumples: boolean = false;

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.cargarDatos();
    
    // Datos estáticos de prueba (Mock ajustados a .estado)
    this.proximosTurnos = [
      { 
        id: 1, 
        hora: '09:00', 
        paciente: 'Maikito Charra', 
        dni: '38.123.456',
        telefono: '5492235263754',
        sucursal: 'Clínica Del Niño', 
        estado: 'atendido', 
        sexo: 'M',
        notasEvolucion: 'El paciente presenta una mejora notable en la movilidad.',
        archivos: [],
        camposExtras: [
          { label: 'Obra Social', valor: 'OSDE 210' },
          { label: 'Motivo', valor: 'Control Post-operatorio' },
          { label: 'Edad', valor: '29 años' }
        ]
      },
      { 
        id: 2,
        hora: '10:30', 
        paciente: 'Cande Rossi', 
        dni: '42.987.654',
        telefono: '5492237654321',
        sucursal: 'Clínica 25 De Mayo', 
        estado: 'pendiente', 
        sexo: 'F',
        notasEvolucion: '',
        archivos: [],
        camposExtras: [
          { label: 'Obra Social', valor: 'Swiss Medical' },
          { label: 'Motivo', valor: 'Consulta Nutricional' },
          { label: 'Edad', valor: '25 años' }
        ]
      },
      { 
        id: 3,
        hora: '11:15', 
        paciente: 'Paciente Nuevo', 
        dni: '35.000.111',
        telefono: '5492230001112',
        sucursal: 'Clínica Del Niño', 
        estado: 'confirmado', 
        sexo: 'O',
        notasEvolucion: '',
        archivos: [],
        camposExtras: [
          { label: 'Obra Social', valor: 'Particular' },
          { label: 'Motivo', valor: 'Primera vez' },
          { label: 'Edad', valor: '32 años' }
        ]
      }
    ];

    this.cumplesHoy = [
      { paciente: 'Maikito Charra', edad: 29, telefono: '5492235263754', sexo: 'M' },
      { paciente: 'Cande Rossi', edad: 25, telefono: '5492237654321', sexo: 'F' },
      { paciente: 'Juan Cruz Di Bello', edad: 28, telefono: '5492230001112', sexo: 'M' },
      { paciente: 'Paciente Nuevo', edad: 30, telefono: '5492231112223', sexo: 'O' }
    ];

    this.cargarNotas();
    this.recalcularKpisLocales();
  }

  guardarNotas() {
    localStorage.setItem('agenda_personal_nutri', this.notasDia);
  }

  cargarNotas() {
    const notasGuardadas = localStorage.getItem('agenda_personal_nutri');
    if (notasGuardadas) {
      this.notasDia = notasGuardadas;
    }
  }

  cargarDatos() {
    this.turnosService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.recalcularKpisLocales();
      },
      error: (err) => console.error('Error cargando stats:', err)
    });
    
    this.turnosService.obtenerTurnos().subscribe({
      next: (res) => {
        this.proximosTurnos = res.slice(0, 5);
        this.recalcularKpisLocales();
      },
      error: (err) => console.error('Error cargando turnos:', err)
    });
  }

  cambiarEstadoTurno(turno: any, event: Event) {
    const nuevoEstado = (event.target as HTMLSelectElement).value;
    const estadoAnterior = turno.estado || 'pendiente';
    
    turno.estado = nuevoEstado;
    console.log(`Cambiando estado de ${turno.paciente} a: ${nuevoEstado}`);
    this.recalcularKpisLocales();

    /*
    this.turnosService.actualizarEstadoTurno(turno.id, nuevoEstado).subscribe({
      next: () => this.mostrarToast('Estado actualizado', 'success'),
      error: (err) => {
        turno.estado = estadoAnterior;
        this.recalcularKpisLocales();
        this.mostrarToast('No se pudo guardar el estado', 'error');
      }
    });
    */
  }

  recalcularKpisLocales() {
    if (this.proximosTurnos && this.proximosTurnos.length > 0) {
      this.stats.turnosHoy = this.proximosTurnos.length;
      this.stats.turnosAtendidosHoy = this.proximosTurnos.filter(t => t.estado === 'atendido').length;
    }
  }

  verDetalle(turno: any) {
    this.pacienteSeleccionado = { ...turno }; 
    if (!this.pacienteSeleccionado.archivos) this.pacienteSeleccionado.archivos = [];
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pacienteSeleccionado = null;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && this.pacienteSeleccionado) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = URL.createObjectURL(file);
        this.pacienteSeleccionado.archivos.push({
          name: file.name,
          type: file.type,
          previewUrl: previewUrl,
          file: file 
        });
      }
    }
    event.target.value = ''; 
  }

  isImage(file: any): boolean {
    return file.type?.startsWith('image/') || false;
  }

  removeFile(index: number) {
    if (this.pacienteSeleccionado?.archivos) {
      URL.revokeObjectURL(this.pacienteSeleccionado.archivos[index].previewUrl);
      this.pacienteSeleccionado.archivos.splice(index, 1);
    }
  }

  async guardarCambios() {
    if (!this.pacienteSeleccionado) return;

    const index = this.proximosTurnos.findIndex(t => t.id === this.pacienteSeleccionado.id);
    if (index !== -1) {
      this.pacienteSeleccionado.estado = 'atendido';
      this.proximosTurnos[index] = { ...this.pacienteSeleccionado };
      this.proximosTurnos = [...this.proximosTurnos];
    }

    this.recalcularKpisLocales(); 
    this.mostrarToast('Ficha guardada y estado actualizado', 'success');
    this.cerrarModal();
  }

  marcarAtendido(turno: any) {
    Swal.fire({
      title: '¿Confirmar atención?',
      text: `¿Deseas marcar a ${turno.paciente} como atendido?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8a2be2',
      confirmButtonText: 'Sí, atendido',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        turno.estado = 'atendido'; 
        this.recalcularKpisLocales(); 
        this.mostrarToast('Atención registrada (Local)', 'success');
      }
    });
  }

  private mostrarToast(titulo: string, icono: 'success' | 'error' | 'info') {
    Swal.fire({
      icon: icono,
      title: titulo,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    });
  }

  abrirModalCumples() { this.mostrarModalCumples = true; }
  cerrarModalCumples() { this.mostrarModalCumples = false; }

  saludarPaciente(cumple: any) {
    const mensaje = `¡Hola ${cumple.paciente}! 🎂 De parte de todo el equipo, te deseamos un muy feliz cumpleaños. ¡Que tengas un día excelente! ✨`;
    const url = `https://wa.me/${cumple.telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  getGenderClass(sexo: string): string {
    switch (sexo?.toUpperCase()) {
      case 'F': return 'bg-mujer';
      case 'M': return 'bg-hombre';
      default: return 'bg-otro';
    }
  }

  isPdf(file: any): boolean {
    if (!file || !file.name) return false;
    return file.name.toLowerCase().endsWith('.pdf');
  }

  cancelarTurno(turno: any) {
    if (turno.estado === 'atendido' || turno.estado === 'cancelado') {
      return;
    }

    Swal.fire({
      title: '¿Cancelar turno?',
      text: `¿Estás seguro de cancelar el turno de ${turno.paciente}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        turno.estado = 'cancelado';
        this.recalcularKpisLocales(); // Re-calcula los KPIs superiores al cancelar
        Swal.fire('Cancelado', 'El turno ha sido cancelado en memoria.', 'success');
      }
    });
  }
}