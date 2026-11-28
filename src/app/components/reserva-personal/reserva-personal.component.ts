import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ReservaPersonalService,
  ReservaPersonal,
  ReservaPersonalSucursal,
  ModoReservaPersonal
} from '../../services/reserva-personal.service';

@Component({
  selector: 'app-reserva-personal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reserva-personal.component.html',
  styleUrl: './reserva-personal.component.css'
})
export class ReservaPersonalComponent implements OnInit {

  cargando = true;
  guardando = false;

  disponible = false;
  configuracionCargada = false;

  error = '';
  mensajeExito = '';

  modoSucursales: ModoReservaPersonal = 0;
  modoOriginal: ModoReservaPersonal = 0;

  sucursales: ReservaPersonalSucursal[] = [];

  seleccionadas = new Set<string>();
  seleccionadasOriginales = new Set<string>();

  constructor(
    private reservaPersonalService: ReservaPersonalService
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

    this.reservaPersonalService.obtener().subscribe({

      next: respuesta => {

        this.aplicarConfiguracion(respuesta);

        this.configuracionCargada = true;
        this.cargando = false;

      },

      error: err => {

        this.cargando = false;

        this.error =
          err?.error?.message ??
          'No pudimos cargar las sucursales externas.';

      }

    });

  }

  // ==========================================
  // APLICAR CONFIGURACION
  // ==========================================

  private aplicarConfiguracion(
    respuesta: ReservaPersonal
  ): void {

    this.disponible = respuesta.disponible;

    this.modoSucursales = respuesta.modoSucursales;

    this.modoOriginal = respuesta.modoSucursales;

    this.sucursales = respuesta.sucursales ?? [];

    this.seleccionadas = new Set(
      this.sucursales
        .filter(s => s.seleccionada && s.permitida)
        .map(s => s.profesionalSucursalId)
    );

    this.seleccionadasOriginales =
      new Set(this.seleccionadas);

  }

  // ==========================================
  // AGRUPAR POR ORGANIZACION
  // ==========================================

  get organizaciones(): {
    id: string;
    nombre: string;
    sucursales: ReservaPersonalSucursal[];
  }[] {

    const grupos = new Map<string, {
      id: string;
      nombre: string;
      sucursales: ReservaPersonalSucursal[];
    }>();

    for (const sucursal of this.sucursales) {

      if (!grupos.has(sucursal.organizacionId)) {

        grupos.set(sucursal.organizacionId, {
          id: sucursal.organizacionId,
          nombre: sucursal.nombreOrganizacion,
          sucursales: []
        });

      }

      grupos
        .get(sucursal.organizacionId)!
        .sucursales.push(sucursal);

    }

    return Array.from(grupos.values());

  }

  // ==========================================
  // CAMBIAR MODO
  // ==========================================

  cambiarModo(modo: ModoReservaPersonal): void {

    if (
      this.guardando ||
      this.cargando ||
      !this.configuracionCargada ||
      !this.disponible
    ) {
      return;
    }

    if (
      modo !== 0 &&
      this.cantidadAutorizadas === 0
    ) {
      return;
    }

    this.modoSucursales = modo;

    this.error = '';
    this.mensajeExito = '';

  }

  // ==========================================
  // SELECCION DE SUCURSALES
  // ==========================================

  estaSeleccionada(
    sucursal: ReservaPersonalSucursal
  ): boolean {

    if (!sucursal.permitida) return false;

    if (this.modoSucursales === 1) {
      return true;
    }

    if (this.modoSucursales === 2) {

      return this.seleccionadas.has(
        sucursal.profesionalSucursalId
      );

    }

    return false;

  }

  cambiarSeleccion(
    sucursal: ReservaPersonalSucursal,
    seleccionada: boolean
  ): void {

    if (
      this.guardando ||
      this.cargando ||
      !this.configuracionCargada ||
      !this.disponible ||
      this.modoSucursales !== 2 ||
      !sucursal.permitida
    ) {
      return;
    }

    const id = sucursal.profesionalSucursalId;

    if (seleccionada) {

      this.seleccionadas.add(id);

    } else {

      this.seleccionadas.delete(id);

    }

    this.error = '';
    this.mensajeExito = '';

  }

  // ==========================================
  // CONTADORES
  // ==========================================

  get cantidadAutorizadas(): number {

    return this.sucursales.filter(
      s => s.permitida
    ).length;

  }

  get cantidadVisibles(): number {

    return this.sucursales.filter(s =>
      s.disponibleParaReserva &&
      this.estaSeleccionada(s)
    ).length;

  }

  // ==========================================
  // DETECTAR CAMBIOS
  // ==========================================

  get hayCambiosSinGuardar(): boolean {

    if (!this.configuracionCargada) {
      return false;
    }

    if (this.modoSucursales !== this.modoOriginal) {
      return true;
    }

    if (this.modoSucursales !== 2) {
      return false;
    }

    if (
      this.seleccionadas.size !==
      this.seleccionadasOriginales.size
    ) {
      return true;
    }

    return Array.from(this.seleccionadas).some(
      id => !this.seleccionadasOriginales.has(id)
    );

  }

  get puedeGuardar(): boolean {

    if (
      !this.disponible ||
      !this.configuracionCargada ||
      this.cargando ||
      this.guardando ||
      !this.hayCambiosSinGuardar
    ) {
      return false;
    }

    if (
      this.modoSucursales !== 0 &&
      this.cantidadAutorizadas === 0
    ) {
      return false;
    }

    if (
      this.modoSucursales === 2 &&
      this.seleccionadas.size === 0
    ) {
      return false;
    }

    return true;

  }

  // ==========================================
  // CANCELAR CAMBIOS
  // ==========================================

  cancelarCambios(): void {

    if (
      this.guardando ||
      this.cargando ||
      !this.configuracionCargada
    ) {
      return;
    }

    this.modoSucursales = this.modoOriginal;

    this.seleccionadas =
      new Set(this.seleccionadasOriginales);

    this.error = '';
    this.mensajeExito = '';

  }

  // ==========================================
  // GUARDAR CONFIGURACION
  // ==========================================

  guardarConfiguracion(): void {

    if (!this.puedeGuardar) return;

    this.guardando = true;
    this.error = '';
    this.mensajeExito = '';

    this.reservaPersonalService.actualizar({

      modoSucursales: this.modoSucursales,

      profesionalSucursalIds:
        this.modoSucursales === 2
          ? Array.from(this.seleccionadas)
          : []

    }).subscribe({

      next: respuesta => {

        this.aplicarConfiguracion(respuesta);

        this.guardando = false;

        this.mensajeExito =
          'Configuración guardada correctamente.';

      },

      error: err => {

        this.guardando = false;

        this.error =
          err?.error?.message ??
          'No pudimos guardar la configuración.';

      }

    });

  }

  // ==========================================
  // TRACK BY
  // ==========================================

  trackByOrganizacion(
    index: number,
    organizacion: { id: string }
  ): string {

    return organizacion.id;

  }

  trackBySucursal(
    index: number,
    sucursal: ReservaPersonalSucursal
  ): string {

    return sucursal.profesionalSucursalId;

  }

}