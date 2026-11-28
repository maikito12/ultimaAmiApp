import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AlertaService } from '../../services/alerta.service';
import { environmentProduccion } from '../../../environments/environment';

interface OrigenComunicacion {
  organizacionId: string;
  nombre: string;
  whatsAppConectado: boolean;
  numeroWhatsApp: string | null;
  automatizacionesActivas: number;
}
export interface ReglaHeredada { id: string; nombre: string; evento: string; anticipacionMinutos: number | null; demoraMinutos: number | null; }
export interface ConfiguracionComunicacion {
  reglasHeredadas?: ReglaHeredada[];
  modo: number;
  organizacionOrigenId: string | null;
  autorizado: boolean;
  whatsappGeneralConfigurado: boolean;
  whatsappProfesionalConfigurado: boolean;
  numeroWhatsAppGeneral: string | null;
  numeroWhatsAppProfesional: string | null;
  organizacionesDisponibles: OrigenComunicacion[];
}
@Component({
  selector: 'app-comunicacion-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicacion-profesional.component.html',
  styleUrl: './comunicacion-profesional.component.css'
})
export class ComunicacionProfesionalComponent implements OnInit {
  @Input() habilitarGuardado = false;
  @Output() configuracionActual = new EventEmitter<ConfiguracionComunicacion | null>();
  @Output() modoActual = new EventEmitter<number>();
  private readonly alerta = inject(AlertaService);
  modalAbierta = false;
  private static avisoMostrado = new Set<string>();
  @Input() claveContexto = '';
  get resumen(): string {
    const d = this.configuracion;
    if (!d) return 'Configuración no disponible';
    if (d.modo === 1) {
      const o = d.organizacionesDisponibles.find(x => x.organizacionId === d.organizacionOrigenId);
      return d.autorizado && o?.whatsAppConectado ? `${o.nombre} · ${o.numeroWhatsApp || 'WhatsApp configurado'} · ${o.automatizacionesActivas} reglas generales` : 'Consultorio externo: revisar autorización o conexión';
    }
    const numero = d.modo === 0 && d.whatsappProfesionalConfigurado ? d.numeroWhatsAppProfesional : d.numeroWhatsAppGeneral;
    return `${d.modo === 2 ? 'Configuración general' : 'Configuración local'} · ${numero || 'Sin número configurado'}`;
  }
  abrir(): void {
    if (!this.configuracion) return;
    this.modo = this.configuracion.modo;
    this.origenId = this.configuracion.organizacionOrigenId;
    this.error = ''; this.modalAbierta = true;
  }
  cerrar(): void { if (!this.guardando) this.modalAbierta = false; }
  private evaluarAviso(): void {
    const d = this.configuracion;
    if (!d || d.modo === 1 || d.whatsappGeneralConfigurado !== false || d.whatsappProfesionalConfigurado !== false || !this.origenes.some(o => o.whatsAppConectado)) return;
    if (ComunicacionProfesionalComponent.avisoMostrado.has(this.claveContexto)) return;
    ComunicacionProfesionalComponent.avisoMostrado.add(this.claveContexto);
    this.abrir();
  }
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly url = `${environmentProduccion.apiUrl}/comunicacion-profesional`;
  configuracion: ConfiguracionComunicacion | null = null;
  modo = 0;
  origenId: string | null = null;
  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';
  ngOnInit(): void { this.cargar(); }
  get origenes(): OrigenComunicacion[] { return this.configuracion?.organizacionesDisponibles ?? []; }
  get origen(): OrigenComunicacion | undefined { return this.origenes.find(o => o.organizacionId === this.origenId); }
  get cambiado(): boolean { return !!this.configuracion && (this.modo !== this.configuracion.modo || (this.modo === 1 && this.origenId !== this.configuracion.organizacionOrigenId)); }
  get puedeGuardar(): boolean { return this.habilitarGuardado && !!this.configuracion && !this.cargando && !this.guardando && this.cambiado && (this.modo !== 1 || !!this.origen?.whatsAppConectado); }
  cargar(): void {
    this.cargando = true; this.error = '';
    this.http.get<ConfiguracionComunicacion>(this.url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: datos => { this.configuracion = datos; this.modo = datos.modo; this.origenId = datos.organizacionOrigenId; this.cargando = false; this.modoActual.emit(datos.modo); this.configuracionActual.emit(datos); this.evaluarAviso(); },
      error: e => { this.cargando = false; this.configuracion = null; this.configuracionActual.emit(null); this.error = e.status === 403 ? 'No tenés permiso para configurar la comunicación profesional.' : 'No pudimos cargar la configuración. Reintentá.'; }
    });
  }
  seleccionar(modo: number): void { this.modo = modo; this.mensaje = ''; if (modo === 1 && !this.origenId) this.origenId = this.origenes.find(o => o.whatsAppConectado)?.organizacionId ?? null; }
  guardar(): void {
    if (!this.puedeGuardar) return;
    this.guardando = true; this.error = ''; this.mensaje = '';
    this.http.put(this.url, { modo: this.modo, organizacionOrigenId: this.modo === 1 ? this.origenId : null }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.guardando = false; this.mensaje = 'Configuración guardada.'; this.modalAbierta = false; this.alerta.success('Configuración guardada'); this.cargar(); },
      error: e => { this.guardando = false; this.error = typeof e.error?.message === 'string' ? e.error.message : 'No pudimos guardar la configuración.'; this.alerta.error('No se pudo guardar', this.error); }
    });
  }
}
