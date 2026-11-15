
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { FormularioComponent } from '../formulario/formulario.component';

import {
  TotemConfiguracion,
  TotemService,
  LlegadaTotemRespuesta
} from '../../services/totem.service';

type PantallaTotem =
  | 'cargando'
  | 'vinculacion'
  | 'bienvenida'
  | 'menu'
  | 'llegada'
  | 'exito'
  | 'reserva';

@Component({
  selector: 'app-totems',
  standalone: true,
  imports: [
    CommonModule,
    FormularioComponent
  ],
  templateUrl: './totems.component.html',
  styleUrl: './totems.component.css'
})
export class TotemsComponent implements OnInit, OnDestroy {

  // ==========================================
  // ESTADO GENERAL
  // ==========================================

  pantalla: PantallaTotem = 'cargando';

  configuracion: TotemConfiguracion | null = null;

  codigo = '';
  dni = '';

  vinculando = false;
  registrandoLlegada = false;
  reservaFinalizadaTotem = false;

  llegada: LlegadaTotemRespuesta | null = null;

  error = '';

  // ==========================================
  // TEMPORIZADORES
  // ==========================================

  private temporizadorExito: ReturnType<typeof setTimeout> | null = null;
  private temporizadorMenu: ReturnType<typeof setTimeout> | null = null;

  private readonly inactividadMenuMs = 30000;
  private readonly inactividadReservaMs = 180000;
  private readonly duracionExitoLlegadaMs = 15000;
  private readonly duracionExitoReservaMs = 20000;

  // ==========================================
  // EVENTOS DEL NAVEGADOR
  // ==========================================

  private readonly alVolverALaPagina = () => {

    if (
      document.visibilityState === 'visible' &&
      ['menu', 'llegada', 'exito', 'reserva'].includes(this.pantalla)
    ) {
      this.irBienvenida();
    }

  };

  private readonly alCambiarPagina = () => {

    // Nunca eliminamos la vinculación del dispositivo.
    this.limpiarSesionPaciente();

  };

  constructor(
    private readonly totemService: TotemService
  ) {}

  // ==========================================
  // CICLO DE VIDA
  // ==========================================

  ngOnInit(): void {

    document.addEventListener(
      'visibilitychange',
      this.alVolverALaPagina
    );

    window.addEventListener(
      'pagehide',
      this.alCambiarPagina
    );

    if (this.totemService.tieneCredencial) {
      this.cargarConfiguracion();
    } else {
      this.pantalla = 'vinculacion';
    }

  }

  ngOnDestroy(): void {

    this.detenerTemporizador();

    document.removeEventListener(
      'visibilitychange',
      this.alVolverALaPagina
    );

    window.removeEventListener(
      'pagehide',
      this.alCambiarPagina
    );

    this.limpiarSesionPaciente();

  }

  // ==========================================
  // COLORES PERSONALIZADOS
  // ==========================================

  get colorVisualPrincipal(): string {

    const secundario =
      this.configuracion?.colorSecundario;

    const principal =
      this.configuracion?.colorPrincipal;

    // Actualmente el violeta está configurado
    // como color secundario de la clínica.
    // Lo utilizamos como protagonista del tótem.

    return this.colorSeguro(
      secundario,
      this.colorSeguro(
        principal,
        '#17483D'
      )
    );

  }

  get colorVisualSecundario(): string {

    return this.colorSeguro(
      this.configuracion?.colorPrincipal,
      '#17483D'
    );

  }

  private colorSeguro(
    valor: string | null | undefined,
    fallback: string
  ): string {

    return valor && /^#[0-9a-fA-F]{6}$/.test(valor)
      ? valor
      : fallback;

  }

  // ==========================================
  // TIPOGRAFÍA PERSONALIZADA
  // ==========================================

  get fuenteVisual(): string {

    const fuente = (
      this.configuracion?.fuente ?? 'SISTEMA'
    ).trim().toUpperCase();

    switch (fuente) {

      case 'INTER':
        return "'Inter', Arial, sans-serif";

      case 'POPPINS':
        return "'Poppins', Arial, sans-serif";

      case 'MONTSERRAT':
        return "'Montserrat', Arial, sans-serif";

      case 'ROBOTO':
        return "'Roboto', Arial, sans-serif";

      default:
        return "system-ui, -apple-system, 'Segoe UI', sans-serif";

    }

  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  get dniValido(): boolean {
    return /^\d{7,9}$/.test(this.dni);
  }

  // ==========================================
  // VINCULACIÓN DEL DISPOSITIVO
  // ==========================================

  ingresarDigito(digito: string): void {

    if (
      this.vinculando ||
      !/^\d$/.test(digito) ||
      this.codigo.length >= 6
    ) {
      return;
    }

    this.codigo += digito;
    this.error = '';

  }

  borrarDigito(): void {

    if (this.vinculando) return;

    this.codigo = this.codigo.slice(0, -1);
    this.error = '';

  }

  limpiarCodigo(): void {

    if (this.vinculando) return;

    this.codigo = '';
    this.error = '';

  }

  vincular(): void {

    if (
      this.vinculando ||
      !/^\d{6}$/.test(this.codigo)
    ) {
      return;
    }

    this.vinculando = true;
    this.error = '';

    this.totemService
      .vincular(this.codigo)
      .subscribe({

        next: () => {

          this.codigo = '';
          this.vinculando = false;

          this.cargarConfiguracion();

        },

        error: (e: HttpErrorResponse | Error) => {

          this.vinculando = false;
          this.codigo = '';

          this.error =
            e instanceof HttpErrorResponse &&
            e.status === 429
              ? 'Demasiados intentos. Probá más tarde.'
              : 'No pudimos vincular el dispositivo. Generá un código nuevo o consultá en recepción.';

        }

      });

  }

  // ==========================================
  // CONFIGURACIÓN DEL TÓTEM
  // ==========================================

  cargarConfiguracion(): void {

    this.pantalla = 'cargando';
    this.error = '';

    this.totemService
      .obtenerConfiguracion()
      .subscribe({

        next: configuracion => {

          this.configuracion = configuracion;

          this.irBienvenida();

        },

        error: (e: HttpErrorResponse | Error) => {

          this.configuracion = null;

          if (
            e instanceof HttpErrorResponse &&
            (e.status === 401 || e.status === 403)
          ) {

            this.totemService.olvidarCredencialLocal();

            this.pantalla = 'vinculacion';

            this.error =
              'Este dispositivo debe vincularse nuevamente.';

            return;
          }

          // Si falla la conexión, conservamos la
          // credencial para poder reintentar.

          this.error =
            'No pudimos conectarnos. Comprobá la conexión e intentá otra vez.';

          this.pantalla = 'cargando';

        }

      });

  }

  // ==========================================
  // BIENVENIDA
  // ==========================================

  comenzar(): void {

    if (this.pantalla !== 'bienvenida') {
      return;
    }

    this.pantalla = 'menu';

    this.reiniciarTemporizadorMenu();

  }

  irBienvenida(): void {

    // No interrumpimos una llegada que
    // todavía se está guardando.

    if (this.registrandoLlegada) {
      return;
    }

    this.detenerTemporizador();

    this.limpiarSesionPaciente();

    this.reservaFinalizadaTotem = false;

    this.pantalla = this.configuracion
      ? 'bienvenida'
      : 'vinculacion';

  }

  // ==========================================
  // RESERVA DE TURNOS
  // ==========================================

  abrirReserva(): void {

    if (
      !this.configuracion?.slugOrganizacion?.trim()
    ) {

      this.error =
        'No se pudo cargar el formulario de reservas de esta clínica.';

      return;
    }

    this.detenerTemporizador();
    this.limpiarSesionPaciente();

    this.reservaFinalizadaTotem = false;

    this.pantalla = 'reserva';

    this.reiniciarTemporizadorMenu();

  }

  reservaCompleta(): void {

    if (this.pantalla !== 'reserva') {
      return;
    }

    if (this.reservaFinalizadaTotem) {
      return;
    }

    this.reservaFinalizadaTotem = true;

    this.detenerTemporizador();

    // Le damos 20 segundos al paciente
    // para visualizar la confirmación
    // antes de volver al inicio.

    this.temporizadorExito = setTimeout(
      () => this.irBienvenida(),
      this.duracionExitoReservaMs
    );

  }

  // ==========================================
  // LLEGADA DEL PACIENTE
  // ==========================================

  abrirLlegada(): void {

    this.detenerTemporizador();
    this.limpiarSesionPaciente();

    this.pantalla = 'llegada';

    this.reiniciarTemporizadorMenu();

  }

  ingresarDato(digito: string): void {

    if (
      this.registrandoLlegada ||
      !/^\d$/.test(digito) ||
      this.dni.length >= 9
    ) {
      return;
    }

    this.dni += digito;

    this.error = '';

    this.reiniciarTemporizadorMenu();

  }

  borrarDato(): void {

    if (this.registrandoLlegada) {
      return;
    }

    this.dni = this.dni.slice(0, -1);

    this.error = '';

    this.reiniciarTemporizadorMenu();

  }

  limpiarDni(): void {

    if (this.registrandoLlegada) {
      return;
    }

    this.dni = '';
    this.error = '';

    this.reiniciarTemporizadorMenu();

  }

  confirmarLlegada(): void {

    if (
      this.registrandoLlegada ||
      !this.dniValido
    ) {
      return;
    }

    this.registrandoLlegada = true;

    this.error = '';

    this.detenerTemporizador();

    // El backend comprueba:
    // - Identidad del dispositivo
    // - Organización
    // - Sucursal
    // - Turno del día
    // - Estado del turno
    // - Llegada no registrada previamente

    this.totemService
      .registrarLlegada(this.dni)
      .subscribe({

        next: respuesta => {

          this.registrandoLlegada = false;

          this.limpiarSesionPaciente();

          this.llegada = respuesta;

          this.pantalla = 'exito';

          this.temporizadorExito = setTimeout(
            () => this.irBienvenida(),
            this.duracionExitoLlegadaMs
          );

        },

        error: (e: HttpErrorResponse | Error) => {

          this.registrandoLlegada = false;

          this.dni = '';

          if (
            e instanceof HttpErrorResponse &&
            (e.status === 401 || e.status === 403)
          ) {

            this.totemService.olvidarCredencialLocal();

            this.configuracion = null;

            this.pantalla = 'vinculacion';

            this.error =
              'Este dispositivo debe vincularse nuevamente.';

            return;
          }

          this.error =
            e instanceof HttpErrorResponse &&
            e.status === 429
              ? 'Demasiados intentos. Consultá en recepción.'
              : 'No pudimos registrar la llegada. Consultá en recepción.';

          this.reiniciarTemporizadorMenu();

        }

      });

  }

  // ==========================================
  // TEMPORIZADOR DE INACTIVIDAD
  // ==========================================

  reiniciarTemporizadorMenu(): void {

    if (
      !['menu', 'llegada', 'reserva'].includes(
        this.pantalla
      )
    ) {
      return;
    }

    // Cuando la reserva está confirmada,
    // no reiniciamos el temporizador
    // de su pantalla de éxito.

    if (
      this.pantalla === 'reserva' &&
      this.reservaFinalizadaTotem
    ) {
      return;
    }

    if (this.registrandoLlegada) {
      return;
    }

    this.detenerTemporizador();

    const tiempo =
      this.pantalla === 'reserva'
        ? this.inactividadReservaMs
        : this.inactividadMenuMs;

    this.temporizadorMenu = setTimeout(
      () => this.irBienvenida(),
      tiempo
    );

  }

  // ==========================================
  // LIMPIEZA DE DATOS DEL PACIENTE
  // ==========================================

  private limpiarSesionPaciente(): void {

    // Nunca borramos la credencial del dispositivo.
    // El formulario se destruye al salir de la
    // pantalla 'reserva' por su *ngIf.

    this.codigo = '';
    this.dni = '';
    this.llegada = null;
    this.error = '';

  }

  // ==========================================
  // DETENER TEMPORIZADORES
  // ==========================================

  private detenerTemporizador(): void {

    if (this.temporizadorMenu !== null) {

      clearTimeout(this.temporizadorMenu);

      this.temporizadorMenu = null;

    }

    if (this.temporizadorExito !== null) {

      clearTimeout(this.temporizadorExito);

      this.temporizadorExito = null;

    }

  }

}
