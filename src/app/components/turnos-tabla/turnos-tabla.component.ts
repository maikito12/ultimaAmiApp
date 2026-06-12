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
  pacienteSeleccionado: any = null;

  private toastConfig: any = {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    iconColor: '#ffffff',
    background: '#7b2cbf',
    color: '#ffffff'
  };

  constructor(
    private turnosService: TurnosService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarTurnos();
  }

  cargarTurnos() {
    const slug = this.auth.getUsuario()?.slug;
    if (!slug) return;

    this.turnosService.obtenerTurnos(false).subscribe({
      next: (res: any) => {
        this.todosLosTurnos = res;
        this.aplicarFiltros();
      },
      error: (err: any) => console.error('Error al cargar turnos:', err)
    });
  }

  aplicarFiltros() {
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    
    let resultados = this.todosLosTurnos.filter((turno: any) => {
      const busqueda = this.filtroTexto.toLowerCase();
      const coincideTexto = turno.pacienteNombre?.toLowerCase().includes(busqueda) || turno.pacienteDni?.includes(busqueda);
      const coincideFecha = this.filtroFecha ? turno.fecha === this.filtroFecha : true;
      return coincideTexto && coincideFecha;
    });

    resultados.sort((a: any, b: any) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.hora.localeCompare(b.hora);
    });

    this.turnosFiltrados = resultados;
    this.turnosHoy = this.turnosFiltrados.filter(t => t.fecha === hoyStr);
    this.proximosTurnos = this.turnosFiltrados.filter(t => t.fecha !== hoyStr);
  }

  verDetalle(turno: any) {
    // Clonamos para evitar modificar la lista original directamente
    const turnoCopiado = JSON.parse(JSON.stringify(turno));
    
    let camposExtra: any[] = [];
    if (turnoCopiado.datosExtra) {
      const data = typeof turnoCopiado.datosExtra === 'string' ? JSON.parse(turnoCopiado.datosExtra) : turnoCopiado.datosExtra;
      camposExtra = Object.keys(data).map(key => ({
        label: key.replace('_', ' ').toUpperCase(),
        valor: data[key]
      }));
    }

    this.pacienteSeleccionado = {
      ...turnoCopiado,
      camposExtra: camposExtra,
      archivos: turnoCopiado.archivos || [],
      notesEvolucion: turnoCopiado.notasEvolucion || ''
    };

    this.mostrarModal = true;
  }

  guardarCambios() {
    if (!this.pacienteSeleccionado) return;

    if (this.pacienteSeleccionado.estado !== 'atendido') {
      this.pacienteSeleccionado.estado = 'atendido';
    }

    const index = this.todosLosTurnos.findIndex(t => t.turnoId === this.pacienteSeleccionado.turnoId);
    if (index !== -1) {
      this.todosLosTurnos[index] = { ...this.pacienteSeleccionado };
      this.aplicarFiltros();
    }

    Swal.fire({ ...this.toastConfig, icon: 'success', title: 'Ficha guardada' });
    this.cerrarModal();
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pacienteSeleccionado.archivos.push({
          name: file.name,
          type: file.type,
          base64: e.target.result,
          previewUrl: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  removeFile(index: number) {
    const file = this.pacienteSeleccionado.archivos[index];
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    this.pacienteSeleccionado.archivos.splice(index, 1);
  }

  cerrarModal() { 
    if (this.pacienteSeleccionado?.archivos) {
      this.pacienteSeleccionado.archivos.forEach((f: any) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    }
    this.mostrarModal = false; 
    this.pacienteSeleccionado = null;
  }

  // --- UTILS ---
  cambiarEstadoTurno(turno: any, event: Event) {
    turno.estado = (event.target as HTMLSelectElement).value;
    this.aplicarFiltros();
  }

  marcarAtendido(turno: any) {
    Swal.fire({
      title: '¿Confirmar atención?',
      icon: 'question',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        turno.estado = 'atendido';
        this.aplicarFiltros();
        Swal.fire({ ...this.toastConfig, icon: 'success', title: 'Paciente atendido' });
      }
    });
  }

  cancelarTurno(turno: any) {
    Swal.fire({ title: '¿Cancelar?', icon: 'warning', showCancelButton: true }).then((r) => {
      if (r.isConfirmed) {
        turno.estado = 'cancelado';
        this.aplicarFiltros();
        Swal.fire({ ...this.toastConfig, icon: 'success', title: 'Turno cancelado' });
      }
    });
  }

  isImage(file: any): boolean { return file.type?.includes('image'); }
  isPdf(file: any): boolean { return file.type?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf'); }
  limpiarFiltros() { this.filtroTexto = ''; this.filtroFecha = ''; this.aplicarFiltros(); }
}