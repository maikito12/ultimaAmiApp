import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turno-service.service';
import { AuthService } from '../../services/auth-service.service';
import { DashboardHome,DashboardStats,TurnoDashboard,Cumpleanios } from '../../interfaces/dashboard';
import { DashboardService } from '../../services/dashboard-service.service';
 
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  // --- CONFIGURACIÓN Y ESTADO ---
private readonly toastConfig: any = {
    toast: true, position: 'top-end', showConfirmButton: false, timer: 2500,
    timerProgressBar: true, iconColor: '#ffffff', background: '#7b2cbf', color: '#ffffff'
  };

  stats: DashboardStats = { turnosHoy: 0, clientesTotal: 0, turnosAtendidosHoy: 0 };
  proximosTurnos: TurnoDashboard[] = [];
  cumplesHoy: Cumpleanios[] = [];
  notasDia: string = '';
  
  mostrarModal = false;
  mostrarModalCumples = false;
  pacienteSeleccionado: any = {};

  constructor(private turnosService: TurnosService, private auth: AuthService,private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarNotas();
    // Nota: Los datos de prueba se quitarán cuando la API esté 100% activa
  }

cargarTurnosDeHoy(): void {
  // Llamamos a tu servicio real con el filtro de 'soloHoy = true'
  this.turnosService.obtenerTurnos(true).subscribe({
    next: (turnos: any[]) => {
      this.proximosTurnos = turnos; 
      this.recalcularKpisLocales();
    },
    error: (err) => console.error('Error cargando turnos de hoy:', err)
  });
}
verDetalle(turno: any) {
    // 1. Procesamiento seguro de datos extras
    let extras = [];
    try {
      const rawExtras = turno.paciente?.datos_extra;
      extras = typeof rawExtras === 'string' ? JSON.parse(rawExtras) : (rawExtras || []);
    } catch (e) {
      console.warn("Error parseando extras:", e);
    }

    // 2. Mapeo completo: mantenemos info base y añadimos lo procesado
    this.pacienteSeleccionado = {
      ...turno,
      ...turno.paciente,
      camposExtras: extras,
      notesEvolucion: turno.notesEvolucion || '',
      archivos: turno.archivos ? [...turno.archivos] : [], // Clonamos el array
      cargando: false
    };

    this.mostrarModal = true;
  }
  // --- CARGA DE DATOS ---
cargarDatos(): void {
  this.dashboardService.obtenerDatosHome().subscribe({
    next: (res: DashboardHome) => {
      console.log('Dashboard cargado:', res);

      this.stats = res.stats;
      this.proximosTurnos = res.proximosTurnos;
      this.cumplesHoy = res.cumplesHoy;

      this.recalcularKpisLocales();
    },
    error: (err) => {
      console.error('Error cargando el dashboard:', err);
    }
  });
}

  // --- LÓGICA DE TURNOS Y KPIs ---
  recalcularKpisLocales() {
    if (this.proximosTurnos && this.proximosTurnos.length > 0) {
      this.stats = {
        ...this.stats,
        turnosHoy: this.proximosTurnos.length,
        turnosAtendidosHoy: this.proximosTurnos.filter(t => t.estado === 'atendido').length
      };
    }
  }


  private ejecutarCambioEstado(turno: any, nuevoEstado: string, mensaje: string) {
    const estadoAnterior = turno.estado;
    turno.estado = nuevoEstado;

    this.turnosService.actualizarEstadoTurno({ id: turno.id, estado: nuevoEstado }).subscribe({
      next: () => {
        this.recalcularKpisLocales();
        Swal.fire({ ...this.toastConfig, icon: 'success', title: mensaje });
      },
      error: () => {
        turno.estado = estadoAnterior; // Rollback
        Swal.fire({ icon: 'error', title: 'Error al actualizar' });
      }
    });
  }
guardarCambios() {
  if (!this.pacienteSeleccionado) return;

  // 1. Usamos FormData porque vamos a enviar archivos reales (imágenes/PDFs)
  const formData = new FormData();
  formData.append('id', this.pacienteSeleccionado.id);
  formData.append('notas', this.pacienteSeleccionado.notesEvolucion);

  // 2. Adjuntamos cada archivo al FormData
  if (this.pacienteSeleccionado.archivos && this.pacienteSeleccionado.archivos.length > 0) {
    this.pacienteSeleccionado.archivos.forEach((item: any) => {
      // 'files' es el nombre que tu backend (C#) debería esperar recibir
      formData.append('files', item.file); 
    });
  }

  // 3. Llamamos al servicio (asegúrate de que tu servicio acepte FormData)
  this.turnosService.finalizarAtencion(formData).subscribe({
    next: () => {
      Swal.fire('Éxito', 'Atención finalizada y archivos guardados', 'success');
      this.cerrarModal();
      this.cargarDatos(); // Recargamos para ver el cambio de estado
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'No se pudieron guardar los cambios', 'error');
    }
  });
}
  // --- MÉTODOS DE ACCIÓN ---
  

  cancelarTurno(turno: any) {
    Swal.fire({ title: '¿Cancelar turno?', icon: 'warning', showCancelButton: true })
        .then(r => { if (r.isConfirmed) this.ejecutarCambioEstado(turno, 'cancelado', 'Turno cancelado'); });
  }

  cambiarEstadoTurno(turno: any, event: any) {
    this.ejecutarCambioEstado(turno, event.target.value, 'Estado actualizado');
  }
 

  // En tu InicioComponent
getOpcionesDisponibles(turno: any) {
  // Lista maestra de estados
  const todas = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'en_espera', label: 'En espera' },
    { value: 'no_asistio', label: 'No asistió' },
    { value: 'atendido', label: 'Atendido' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  // Filtramos solo las que quieres que el usuario vea afuera (en la tabla)
  const permitidas = ['en_espera', 'no_asistio'];
  
  // Si el turno actual está en un estado que no es uno de esos, lo agregamos igual 
  // para que el select no se quede en blanco
  if (!permitidas.includes(turno.estado)) {
    return [...todas.filter(o => permitidas.includes(o.value)), { value: turno.estado, label: turno.estado }];
  }

  return todas.filter(o => permitidas.includes(o.value));
}
 marcarAtendido(turno: any) {
  Swal.fire({
    title: '¿Confirmar atención?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, atendido'
  }).then((result) => {
    if (result.isConfirmed) {
      // LLAMA AL SERVICIO PRIMERO
      this.turnosService.actualizarEstadoTurno({ id: turno.id, estado: 'atendido' })
        .subscribe(() => {
          turno.estado = 'atendido'; // Solo actualizas si el backend dijo que OK
          this.recalcularKpisLocales();
        });
    }
  });
}

 

  // --- NOTAS Y ARCHIVOS ---
  guardarNotas() { localStorage.setItem('agenda_personal_nutri', this.notasDia); }
  cargarNotas() { this.notasDia = localStorage.getItem('agenda_personal_nutri') || ''; }

 

  

  // --- UTILS ---
  getGenderClass(sexo: string): string {
    const s = sexo?.toUpperCase();
    return s === 'F' ? 'bg-mujer' : s === 'M' ? 'bg-hombre' : 'bg-otro';
  }

  saludarPaciente(cumple: any) {
    const mensaje = `¡Hola ${cumple.paciente}! 🎂 ¡Feliz cumpleaños! ✨`;
    window.open(`https://wa.me/${cumple.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  // En tu InicioComponent

onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    if (!this.pacienteSeleccionado.archivos) {
      this.pacienteSeleccionado.archivos = [];
    }

    Array.from(files).forEach(file => {
      // Creamos un objeto con estructura clara
      const newFile = {
        name: file.name,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
        file: file // El objeto File original para el FormData
      };
      this.pacienteSeleccionado.archivos.push(newFile);
    });

    event.target.value = ''; // Reset input
  }

  removeFile(index: number) {
    const file = this.pacienteSeleccionado.archivos[index];
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    this.pacienteSeleccionado.archivos.splice(index, 1);
  }



  cerrarModal() { 
    // Limpieza de memoria: revocar todas las URLs de archivos al cerrar
    if (this.pacienteSeleccionado?.archivos) {
      this.pacienteSeleccionado.archivos.forEach((f: any) => URL.revokeObjectURL(f.previewUrl));
    }
    this.mostrarModal = false; 
    this.pacienteSeleccionado = null; 
  }
isImage(file: any): boolean {
  return file?.type?.startsWith('image/') || false;
}

isPdf(file: any): boolean {
  return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
}

abrirModalCumples() {
  console.log('Abriendo modal de cumpleaños');
  this.mostrarModalCumples = true;
}
cerrarModalCumples() { 
  console.log('Cerrando modal de cumpleaños...'); // Esto es para debuggear
  this.mostrarModalCumples = false; 
}

}