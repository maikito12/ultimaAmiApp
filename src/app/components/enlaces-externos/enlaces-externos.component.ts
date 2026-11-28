import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  EnlacesExternosService,
  ConfiguracionEnlacesExternos,
  ProfesionalEnlaceExterno,
  ModoAutorizacionEnlacesExternos
} from '../../services/enlaces-externos.service';

@Component({
  selector: 'app-enlaces-externos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './enlaces-externos.component.html',
  styleUrls: ['./enlaces-externos.component.css']
})
export class EnlacesExternosComponent implements OnInit {

  cargando = true;
  guardando = false;
  configuracionCargada = false;

  error = '';
  mensajeExito = '';

  busqueda = '';

  modoAutorizacion: ModoAutorizacionEnlacesExternos = 0;
  modoOriginal: ModoAutorizacionEnlacesExternos = 0;

  profesionales: ProfesionalEnlaceExterno[] = [];

  seleccionados = new Set<string>();
  seleccionadosOriginales = new Set<string>();

  constructor(
    private enlacesExternosService: EnlacesExternosService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  // ==========================================
  // CARGAR CONFIGURACION
  // ==========================================

  cargarConfiguracion(): void {

    if (this.guardando) return;

    this.cargando = true;
    this.configuracionCargada = false;
    this.error = '';
    this.mensajeExito = '';

    this.enlacesExternosService.obtener().subscribe({

      next: (respuesta) => {

        this.aplicarConfiguracion(respuesta);

        this.configuracionCargada = true;
        this.cargando = false;

      },

      error: (err) => {

        this.error =
          err?.error?.message ||
          'No se pudo cargar la autorización de enlaces externos.';

        this.cargando = false;

      }

    });

  }

  // ==========================================
  // APLICAR RESPUESTA DEL BACKEND
  // ==========================================

  private aplicarConfiguracion(
    respuesta: ConfiguracionEnlacesExternos
  ): void {

    this.modoAutorizacion =
      respuesta.modoAutorizacion;

    this.modoOriginal =
      respuesta.modoAutorizacion;

    this.profesionales =
      respuesta.profesionales ?? [];

    this.seleccionados = new Set(
      this.profesionales
        .filter(p => p.seleccionado)
        .map(p => p.profesionalOrganizacionId)
    );

    this.seleccionadosOriginales =
      new Set(this.seleccionados);

  }

  // ==========================================
  // CAMBIAR MODALIDAD
  // ==========================================

  cambiarModo(
    modo: ModoAutorizacionEnlacesExternos
  ): void {

    if (this.guardando || this.cargando) return;

    this.modoAutorizacion = modo;

    this.error = '';
    this.mensajeExito = '';

  }

  // ==========================================
  // BUSCADOR
  // ==========================================

  get profesionalesFiltrados(): ProfesionalEnlaceExterno[] {

    const texto = this.normalizarTexto(this.busqueda);

    if (!texto) {
      return this.profesionales;
    }

    return this.profesionales.filter(p =>
      this.normalizarTexto(p.nombreCompleto)
        .includes(texto)
    );

  }

  private normalizarTexto(texto: string): string {

    return (texto ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  }

  // ==========================================
  // SELECCION INDIVIDUAL
  // ==========================================

  estaSeleccionado(id: string): boolean {

    return this.seleccionados.has(id);

  }

  cambiarSeleccion(
    id: string,
    seleccionado: boolean
  ): void {

    if (
      this.guardando ||
      this.cargando ||
      this.modoAutorizacion !== 2
    ) {
      return;
    }

    if (!this.profesionales.some(
      p => p.profesionalOrganizacionId === id
    )) {
      return;
    }

    if (seleccionado) {

      this.seleccionados.add(id);

    } else {

      this.seleccionados.delete(id);

    }

    this.error = '';
    this.mensajeExito = '';

  }

  // ==========================================
  // SELECCION MASIVA
  // ==========================================

  seleccionarTodos(): void {

    if (
      this.guardando ||
      this.cargando ||
      this.modoAutorizacion !== 2
    ) {
      return;
    }

    this.seleccionados = new Set(
      this.profesionales.map(
        p => p.profesionalOrganizacionId
      )
    );

    this.error = '';
    this.mensajeExito = '';

  }

  deseleccionarTodos(): void {

    if (
      this.guardando ||
      this.cargando ||
      this.modoAutorizacion !== 2
    ) {
      return;
    }

    this.seleccionados.clear();

    this.error = '';
    this.mensajeExito = '';

  }

  // ==========================================
  // AUTORIZACION EFECTIVA
  // ==========================================

  estaAutorizado(
    profesional: ProfesionalEnlaceExterno
  ): boolean {

    if (this.modoAutorizacion === 0) {
      return false;
    }

    if (this.modoAutorizacion === 1) {
      return true;
    }

    return this.seleccionados.has(
      profesional.profesionalOrganizacionId
    );

  }

  get cantidadAutorizados(): number {

    return this.profesionales.filter(
      p => this.estaAutorizado(p)
    ).length;

  }

  get cantidadElegibles(): number {

    return this.profesionales.length;

  }

  // ==========================================
  // DETECTAR CAMBIOS
  // ==========================================

  get hayCambiosSinGuardar(): boolean {

    if (!this.configuracionCargada) {
      return false;
    }

    if (this.modoAutorizacion !== this.modoOriginal) {
      return true;
    }

    if (this.modoAutorizacion !== 2) {
      return false;
    }

    if (
      this.seleccionados.size !==
      this.seleccionadosOriginales.size
    ) {
      return true;
    }

    return Array.from(this.seleccionados).some(
      id => !this.seleccionadosOriginales.has(id)
    );

  }

  get puedeGuardar(): boolean {

    return (
      this.configuracionCargada &&
      !this.cargando &&
      !this.guardando &&
      this.hayCambiosSinGuardar
    );

  }

  // ==========================================
  // CANCELAR CAMBIOS
  // ==========================================

  cancelarCambios(): void {

    if (this.guardando || this.cargando) return;

    this.modoAutorizacion = this.modoOriginal;

    this.seleccionados =
      new Set(this.seleccionadosOriginales);

    this.error = '';
    this.mensajeExito = '';

  }

  // ==========================================
  // GUARDAR CONFIGURACION
  // ==========================================

  guardar(): void {

    if (!this.puedeGuardar) return;

    this.guardando = true;
    this.error = '';
    this.mensajeExito = '';

    const ids = this.modoAutorizacion === 2
      ? Array.from(this.seleccionados)
      : [];

    this.enlacesExternosService.guardar({

      modoAutorizacion: this.modoAutorizacion,

      profesionalOrganizacionIds: ids

    }).subscribe({

      next: (respuesta) => {

        this.aplicarConfiguracion(respuesta);

        this.guardando = false;

        this.mensajeExito =
          'La configuración se guardó correctamente.';

      },

      error: (err) => {

        this.error =
          err?.error?.message ||
          'No se pudo guardar la configuración.';

        this.guardando = false;

      }

    });

  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  obtenerIniciales(nombre: string): string {

    return (nombre ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('') || 'P';

  }

  trackByProfesional(
    index: number,
    profesional: ProfesionalEnlaceExterno
  ): string {

    return profesional.profesionalOrganizacionId;

  }

}