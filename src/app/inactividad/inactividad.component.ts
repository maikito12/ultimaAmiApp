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
  
  tabActiva: string = 'horarios';

  // Configuración global para alertas tipo Toast
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

  diasSemana = [
    { id: 1, nombre: 'Lunes', corto: 'L', seleccionado: false },
    { id: 2, nombre: 'Martes', corto: 'M', seleccionado: false },
    { id: 3, nombre: 'Miércoles', corto: 'X', seleccionado: false },
    { id: 4, nombre: 'Jueves', corto: 'J', seleccionado: false },
    { id: 5, nombre: 'Viernes', corto: 'V', seleccionado: false },
    { id: 6, nombre: 'Sábado', corto: 'S', seleccionado: false },
    { id: 0, nombre: 'Domingo', corto: 'D', seleccionado: false }
  ];

  listaSucursales: any[] = [{ id: 'suc-111', nombre: 'Clínica Del Niño', calle: 'Av. Colón', altura: '2450', piso_depto: 'Piso 2', ciudad: 'Mar del Plata' }];
  listaHorarios: any[] = [
    { id: 'hor-1', sucursal_id: 'suc-111', dia_semana: 1, hora_inicio: '08:00', hora_fin: '12:00', duracion_turno: 30 },
    { id: 'hor-2', sucursal_id: 'suc-111', dia_semana: 3, hora_inicio: '08:00', hora_fin: '12:00', duracion_turno: 30 }
  ];
  listaBloqueos: any[] = [{ id: 1, inicio: '2026-05-10T00:00', fin: '2026-05-12T23:59', motivo: 'Vacaciones' }];
  listaObrasSociales: any[] = [];

  nuevaSucursal = { nombre: '', calle: '', altura: '', piso_depto: '', ciudad: '' };
  nuevoHorario = { sucursal_id: '', hora_inicio: '', hora_fin: '', duracion_turno: 30 };
  nuevoBloqueo = { inicio: '', fin: '', motivo: '' };
  nuevaObraSocial = { nombre: '', siglas: '', codigo_prestador: '' };

  cambiarTab(tab: string) { this.tabActiva = tab; }

  // ==========================================================================
  // MÉTODOS DE GUARDADO
  // ==========================================================================
  guardarSucursal() {
    if (!this.nuevaSucursal.nombre || !this.nuevaSucursal.calle || !this.nuevaSucursal.altura || !this.nuevaSucursal.ciudad) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', confirmButtonColor: '#7b2cbf' });
      return;
    }
    this.listaSucursales.push({ ...this.nuevaSucursal, id: 'suc-' + Date.now() });
    this.nuevaSucursal = { nombre: '', calle: '', altura: '', piso_depto: '', ciudad: '' };
    Swal.fire({ ...this.toastConfig, icon: 'success', title: 'Sucursal registrada' });
  }

  guardarHorario() {
    const algunDiaSeleccionado = this.diasSemana.some(d => d.seleccionado);
    if (!this.nuevoHorario.sucursal_id || !this.nuevoHorario.hora_inicio || !this.nuevoHorario.hora_fin || !algunDiaSeleccionado) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', confirmButtonColor: '#7b2cbf' });
      return;
    }
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
    this.nuevoHorario = { sucursal_id: '', hora_inicio: '', hora_fin: '', duracion_turno: 30 };
    this.diasSemana.forEach(d => d.seleccionado = false);
    Swal.fire({ ...this.toastConfig, icon: 'success', title: 'Cronograma actualizado' });
  }

  guardarBloqueo() {
    if (!this.nuevoBloqueo.inicio || !this.nuevoBloqueo.fin) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', confirmButtonColor: '#7b2cbf' });
      return;
    }
    this.listaBloqueos.push({ ...this.nuevoBloqueo, id: Date.now() });
    this.nuevoBloqueo = { inicio: '', fin: '', motivo: '' };
    Swal.fire({ ...this.toastConfig, icon: 'success', title: 'Agenda bloqueada' });
  }

  guardarObraSocial() {
    if (!this.nuevaObraSocial.nombre) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'El nombre es obligatorio', confirmButtonColor: '#7b2cbf' });
      return;
    }
    this.listaObrasSociales.push({ ...this.nuevaObraSocial, id: 'os-' + Date.now() });
    this.nuevaObraSocial = { nombre: '', siglas: '', codigo_prestador: '' };
    Swal.fire({ ...this.toastConfig, icon: 'success', title: 'Obra social registrada' });
  }

  // ==========================================================================
  // MÉTODOS DE ELIMINACIÓN CON CONFIRMACIÓN
  // ==========================================================================
  eliminarSucursal(id: string) {
    Swal.fire({ title: '¿Eliminar sucursal?', text: "Se quitarán los horarios vinculados.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#7b2cbf' }).then((r) => {
      if (r.isConfirmed) {
        this.listaSucursales = this.listaSucursales.filter(s => s.id !== id);
        this.listaHorarios = this.listaHorarios.filter(h => h.sucursal_id !== id);
      }
    });
  }

  eliminarHorarioAgrupado(sucursalId: string, inicio: string, fin: string) {
    Swal.fire({ title: '¿Eliminar bloque?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#7b2cbf' }).then((r) => {
      if (r.isConfirmed) this.listaHorarios = this.listaHorarios.filter(h => !(h.sucursal_id === sucursalId && h.hora_inicio === inicio && h.hora_fin === fin));
    });
  }

  eliminarBloqueo(id: number) {
    Swal.fire({ title: '¿Habilitar agenda?', icon: 'question', showCancelButton: true, confirmButtonColor: '#7b2cbf' }).then((r) => {
      if (r.isConfirmed) this.listaBloqueos = this.listaBloqueos.filter(b => b.id !== id);
    });
  }

  eliminarObraSocial(id: string) {
    Swal.fire({ title: '¿Eliminar convenio?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#7b2cbf' }).then((r) => {
      if (r.isConfirmed) this.listaObrasSociales = this.listaObrasSociales.filter(os => os.id !== id);
    });
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  get horariosAgrupados(): any[] {
    const grupos: { [key: string]: any } = {};
    this.listaHorarios.forEach(h => {
      const clave = `${h.sucursal_id}_${h.hora_inicio}_${h.hora_fin}_${h.duracion_turno}`;
      if (!grupos[clave]) grupos[clave] = { sucursal_id: h.sucursal_id, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, duracion_turno: h.duracion_turno, dias: [] };
      if (!grupos[clave].dias.includes(h.dia_semana)) grupos[clave].dias.push(h.dia_semana);
    });
    return Object.values(grupos).map(g => {
      g.dias.sort((a: any, b: any) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
      return g;
    });
  }

  formatearDiasTexto(dias: any[]): string { return (!dias || dias.length === 0) ? 'Sin días' : dias.map(d => this.mapearDiaTexto(Number(d))).join(', '); }
  obtenerNombreSucursal(id: string): string { const s = this.listaSucursales.find(s => s.id === id); return s ? s.nombre : 'Sede Desconocida'; }
  mapearDiaTexto(id: number): string { const d = this.diasSemana.find(d => d.id === id); return d ? d.nombre : 'Día Desconocido'; }
}