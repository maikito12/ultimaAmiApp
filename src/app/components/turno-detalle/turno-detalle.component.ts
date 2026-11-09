import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import {
  AuthService
} from '../../services/auth-service.service';

import {
  TurnosService
} from '../../services/turno-service.service';

import {
  AlertaService
} from '../../services/alerta.service';

import {
  DialogoService
} from '../../services/dialogo.service';


type TabTurno =
  | 'resumen'
  | 'paciente'
  | 'historia'
  | 'consultas'
  | 'archivos';


@Component({
  selector: 'app-turno-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './turno-detalle.component.html',
  styleUrl: './turno-detalle.component.css'
})
export class TurnoDetalleComponent
  implements OnInit {

  // =======================================================
  // DATOS
  // =======================================================

  turno: any = null;

  turnoId = '';

  fechaOrigen = '';

  cargando = true;

  // Bloquea acciones duplicadas mientras se guarda el cambio.
  accionEnCurso = false;

  // Ignora lecturas HTTP anteriores a una operación más reciente.
  private versionCarga = 0;

  puedeAccederClinica =
    false;


  // =======================================================
  // TABS
  // =======================================================

  tabActual: TabTurno =
    'resumen';


  // =======================================================
  // CONSTRUCTOR
  // =======================================================

  constructor(
    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly turnosService:
      TurnosService,

    private readonly authService:
      AuthService,

    private readonly alertaService:
      AlertaService,

    private readonly dialogoService:
      DialogoService
  ) {}


  // =======================================================
  // INIT
  // =======================================================

  ngOnInit(): void {

    this.puedeAccederClinica =
      this.authService
        .esProfesional();


    this.turnoId =
      this.route
        .snapshot
        .paramMap
        .get(
          'id'
        )
      ?? '';


    this.fechaOrigen =
      this.route
        .snapshot
        .queryParamMap
        .get(
          'fecha'
        )
      ?? '';


    if (!this.turnoId) {

      this.volverAgenda();

      return;
    }


    this.cargarTurno();
  }


  // =======================================================
  // CARGAR TURNO
  // =======================================================

  cargarTurno(mostrarCargando = true, estadoEsperado?: string): void {
    if (!this.turnoId || this.accionEnCurso) {
      return;
    }

    const version = ++this.versionCarga;

    // En segundo plano no ocultamos la ficha ni hacemos parpadear la pantalla.
    if (mostrarCargando && !this.turno) {
      this.cargando = true;
    }

    this.turnosService.obtenerDetalleTurno(this.turnoId).subscribe({
      next: (response: any) => {
        if (version !== this.versionCarga) {
          return;
        }

        this.cargando = false;

        // Si el servidor responde con otro estado, no damos por confirmada
        // una operación que la lectura de la BD no pudo corroborar.
        if (estadoEsperado &&
            this.normalizarEstado(response?.estado) !== estadoEsperado) {
          console.warn('El GET del turno devolvió un estado diferente al esperado:', {
            esperado: estadoEsperado,
            recibido: response?.estado,
            turnoId: this.turnoId
          });

          this.turno = response;
          this.alertaService.info(
            'Estado no confirmado por el servidor',
            'La acción respondió correctamente, pero el detalle todavía informa otro estado. Se muestra el valor del servidor; revisá el backend si persiste.'
          );
          return;
        }

        this.turno = response;
      },
      error: (error: any) => {
        if (version !== this.versionCarga) {
          return;
        }

        this.cargando = false;
        console.error('Error cargando turno:', error);

        // Si acabamos de confirmar una acción, conservamos lo que se mostró
        // localmente y avisamos de que falta verificar la lectura del backend.
        if (estadoEsperado) {
          this.alertaService.info(
            'No se pudo verificar el estado',
            'El cambio fue aceptado, pero falló la actualización del detalle. Volvé a entrar al turno para comprobarlo.'
          );
          return;
        }

        this.mostrarError(
          error,
          'Ocurrió un error al obtener la información del turno.',
          'No se pudo cargar el turno'
        );
      }
    });
  }

  // Si se confirmó/canceló desde WhatsApp u otra computadora,
  // al volver a esta pestaña consultamos el estado actualizado.
  @HostListener('window:focus')
  alRecuperarFoco(): void {
    if (this.turnoId && this.turno && !this.cargando && !this.accionEnCurso) {
      this.cargarTurno(false);
    }
  }

  // Único punto para actualizar la UI tras una respuesta exitosa del backend.
  private ejecutarCambioEstado(
    solicitud: Observable<any>,
    estadoFinal: string,
    mensajeExito: string,
    mensajeError: string
  ): void {
    if (!this.turnoId || this.accionEnCurso) {
      return;
    }

    this.accionEnCurso = true;
    ++this.versionCarga; // Descarta consultas GET que habían comenzado antes del POST.

    solicitud.subscribe({
      next: () => {
        this.accionEnCurso = false;

        // Cambia badge y visibilidad de botones inmediatamente.
        this.turno = { ...this.turno, estado: estadoFinal };
        this.alertaService.success(mensajeExito);

        // Contrasta con la información real, sin ocultar la ficha.
        this.cargarTurno(false, this.normalizarEstado(estadoFinal));
      },
      error: (error: any) => {
        this.accionEnCurso = false;
        this.mostrarError(error, mensajeError);
        // En caso de error NO inventamos un nuevo estado.
        this.cargarTurno(false);
      }
    });
  }


  // =======================================================
  // CAMBIAR TAB
  // =======================================================

  cambiarTab(
    tab: TabTurno
  ): void {

    if (
      tab === 'historia'
      ||
      tab === 'consultas'
      ||
      tab === 'archivos'
    ) {

      if (
        !this.puedeAccederClinicaTurno()
      ) {
        return;
      }


      const pacienteId =
        this.obtenerPacienteId();


      if (!pacienteId) {

        this.alertaService.info(
          'Ficha del paciente',
          'No pudimos identificar al paciente asociado a este turno.'
        );

        return;
      }


      this.router.navigate(
        [
          '/dashboard/clientes',
          pacienteId
        ],
        {
          queryParams: {
            seccion:
              tab,

            turnoId:
              this.turnoId
          }
        }
      );


      return;
    }


    this.tabActual =
      tab;
  }


  // =======================================================
  // VOLVER A AGENDA
  // =======================================================

  volverAgenda(): void {

    this.router.navigate(
      [
        '/dashboard/turnos'
      ],
      {
        queryParams:
          this.fechaOrigen
            ? {
                fecha:
                  this.fechaOrigen
              }
            : {}
      }
    );
  }


  // =======================================================
  // VER PACIENTE
  // =======================================================

  verPaciente(): void {

    const pacienteId =
      this.obtenerPacienteId();


    if (!pacienteId) {

      this.alertaService.info(
        'Ficha del paciente',
        'No pudimos identificar al paciente asociado a este turno.'
      );

      return;
    }


    this.router.navigate(
      [
        '/dashboard/clientes',
        pacienteId
      ]
    );
  }


  // =======================================================
  // CONFIRMAR TURNO
  // =======================================================

  async confirmarTurno():
    Promise<void> {

    if (!this.turnoId) {
      return;
    }


    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            '¿Confirmar turno?',

          mensaje:
            `Se confirmará el turno de ${this.obtenerPaciente()}.`,

          textoConfirmar:
            'Confirmar turno',

          textoCancelar:
            'Volver'
        });


    if (!confirmado) {
      return;
    }


    this.ejecutarCambioEstado(
      this.turnosService
      .confirmarTurno(
        this.turnoId
      ),
      'Confirmado',
      'Turno confirmado',
      'No se pudo confirmar el turno.'
    );
  }


  // =======================================================
  // CHECK-IN
  // =======================================================

  checkIn(): void {

    if (!this.turnoId) {
      return;
    }


    this.ejecutarCambioEstado(
      this.turnosService
      .hacerCheckIn(
        this.turnoId
      ),
      'EnSala',
      'Paciente ingresado a sala',
      'No se pudo realizar el check-in.'
    );
  }


  // =======================================================
  // INICIAR ATENCIÓN
  // =======================================================

  iniciarAtencion(): void {

    if (!this.turnoId) {
      return;
    }


    this.ejecutarCambioEstado(
      this.turnosService
      .iniciarAtencion(
        this.turnoId
      ),
      'EnAtencion',
      'Atención iniciada',
      'No se pudo iniciar la atención.'
    );
  }


  // =======================================================
  // FINALIZAR ATENCIÓN
  // =======================================================

  async finalizarAtencion():
    Promise<void> {

    if (!this.turnoId) {
      return;
    }


    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            '¿Finalizar atención?',

          mensaje:
            `Se marcará como atendido a ${this.obtenerPaciente()}.`,

          textoConfirmar:
            'Finalizar',

          textoCancelar:
            'Volver'
        });


    if (!confirmado) {
      return;
    }


    this.ejecutarCambioEstado(
      this.turnosService
      .finalizarAtencion(
        this.turnoId
      ),
      'Atendido',
      'Consulta finalizada',
      'No se pudo finalizar la atención.'
    );
  }


  // =======================================================
  // NO ASISTIÓ
  // =======================================================

  async registrarNoAsistio():
    Promise<void> {

    if (!this.turnoId) {
      return;
    }


    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            '¿El paciente no asistió?',

          mensaje:
            this.obtenerPaciente(),

          textoConfirmar:
            'Marcar no asistió',

          textoCancelar:
            'Volver'
        });


    if (!confirmado) {
      return;
    }


    this.ejecutarCambioEstado(
      this.turnosService
      .registrarNoAsistio(
        this.turnoId
      ),
      'NoAsistio',
      'Marcado como no asistió',
      'No se pudo actualizar el turno.'
    );
  }


  // =======================================================
  // CANCELAR TURNO
  // =======================================================

  async cancelarTurno():
    Promise<void> {

    if (!this.turnoId) {
      return;
    }


    const motivo =
      await this.dialogoService
        .entrada({
          titulo:
            'Cancelar turno',

          mensaje:
            `¿Querés cancelar el turno de ${this.obtenerPaciente()}?`,

          label:
            'Motivo de cancelación',

          placeholder:
            'Escribí el motivo...',

          textoConfirmar:
            'Cancelar turno',

          textoCancelar:
            'Volver',

          requerido:
            true,

          minLength:
            3,

          variante:
            'danger'
        });


    if (motivo === null) {
      return;
    }


    this.ejecutarCambioEstado(
      this.turnosService
      .cancelarTurno(
        this.turnoId,
        motivo
      ),
      'Cancelado',
      'Turno cancelado',
      'No se pudo cancelar el turno.'
    );
  }


  // =======================================================
  // ESTADOS
  // =======================================================

  puedeConfirmar(): boolean {

    return (
      this.normalizarEstado(
        this.turno?.estado
      ) ===
      'pendiente'
    );
  }


  puedeCheckIn(): boolean {

    return (
      this.normalizarEstado(
        this.turno?.estado
      ) ===
      'confirmado'
    );
  }


  puedeIniciar(): boolean {

    const estado =
      this.normalizarEstado(
        this.turno?.estado
      );


    return (
      estado === 'ensala'
      ||
      estado === 'espera'
    );
  }


  puedeFinalizar(): boolean {

    return (
      this.normalizarEstado(
        this.turno?.estado
      ) ===
      'enatencion'
    );
  }


  puedeNoAsistio(): boolean {

    const estado =
      this.normalizarEstado(
        this.turno?.estado
      );


    return [
      'confirmado',
      'ensala'
    ].includes(
      estado
    );
  }


  puedeCancelar(): boolean {

    const estado =
      this.normalizarEstado(
        this.turno?.estado
      );


    return [
      'pendiente',
      'confirmado'
    ].includes(
      estado
    );
  }


  puedeAccederClinicaTurno():
    boolean {

    if (
      !this.puedeAccederClinica
    ) {
      return false;
    }


    const estado =
      this.normalizarEstado(
        this.turno?.estado
      );


    return [
      'enatencion',
      'atendido'
    ].includes(
      estado
    );
  }


  // =======================================================
  // PACIENTE
  // =======================================================

  obtenerPaciente(): string {

    return (
      this.turno?.paciente ??
      'Paciente'
    );
  }


  obtenerPacienteId(): string {

    return (
      this.turno?.pacienteId ??
      this.turno?.idPaciente ??
      ''
    )
      .toString();
  }


  obtenerIniciales(): string {

    const partes =
      this.obtenerPaciente()
        .trim()
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );


    if (!partes.length) {
      return 'P';
    }


    return partes
      .slice(
        0,
        2
      )
      .map(
        parte =>
          parte
            .charAt(
              0
            )
            .toUpperCase()
      )
      .join(
        ''
      );
  }


  // =======================================================
  // DATOS TURNO
  // =======================================================

  obtenerProfesional(): string {

    return (
      this.turno?.profesional ??
      '-'
    );
  }


  obtenerEspecialidad(): string {

    return (
      this.turno?.especialidad ??
      '-'
    );
  }


  obtenerSucursal(): string {

    return (
      this.turno?.sucursal ??
      '-'
    );
  }


  obtenerMotivo(): string {

    return (
      this.turno?.motivoConsulta ??
      'Sin motivo de consulta registrado.'
    );
  }


  obtenerObservaciones(): string {

    return (
      this.turno?.observaciones ??
      'Sin observaciones.'
    );
  }


  obtenerHoraInicio(): string {

    return this.formatearHora(
      this.turno?.horaInicio
    );
  }


  obtenerHoraFin(): string {

    return this.formatearHora(
      this.turno?.horaFin
    );
  }


  obtenerRangoHorario(): string {

    const inicio =
      this.obtenerHoraInicio();


    const fin =
      this.obtenerHoraFin();


    if (!inicio && !fin) {
      return '-';
    }


    if (!fin) {
      return inicio;
    }


    return `${inicio} - ${fin}`;
  }


  obtenerFecha(): string {

    return (
      this.turno?.fecha ??
      ''
    )
      .toString()
      .substring(
        0,
        10
      );
  }


  formatearFecha(): string {

    const fecha =
      this.obtenerFecha();


    if (!fecha) {
      return '-';
    }


    const [
      year,
      month,
      day
    ] =
      fecha
        .split(
          '-'
        )
        .map(
          Number
        );


    return new Date(
      year,
      month - 1,
      day
    )
      .toLocaleDateString(
        'es-AR',
        {
          day:
            '2-digit',

          month:
            'long',

          year:
            'numeric'
        }
      );
  }


  // =======================================================
  // ORIGEN
  // =======================================================

  obtenerOrigen(): string {

    const origen =
      Number(
        this.turno?.origen
      );


    switch (origen) {

      case 0:
      case 1:
        return 'Recepción';

      case 2:
        return 'Reserva online';

      case 3:
        return 'WhatsApp';

      default:
        return '-';
    }
  }


  // =======================================================
  // ESTADO
  // =======================================================

  normalizarEstado(
    estado: any
  ): string {

    if (
      estado === null
      ||
      estado === undefined
    ) {
      return '';
    }


    if (
      typeof estado ===
      'number'
    ) {

      const mapa: {
        [key: number]:
          string;
      } = {

        1:
          'pendiente',

        2:
          'confirmado',

        3:
          'ensala',

        4:
          'enatencion',

        5:
          'atendido',

        6:
          'cancelado',

        7:
          'noasistio'
      };


      return (
        mapa[estado] ??
        ''
      );
    }


    return estado
      .toString()
      .trim()
      .toLowerCase()
      .replace(
        /\s/g,
        ''
      )
      .replace(
        /-/g,
        ''
      )
      .replace(
        /_/g,
        ''
      );
  }


  obtenerTextoEstado(): string {

    const estado =
      this.normalizarEstado(
        this.turno?.estado
      );


    const mapa: {
      [key: string]:
        string;
    } = {

      pendiente:
        'Pendiente',

      confirmado:
        'Confirmado',

      ensala:
        'En sala',

      espera:
        'En sala',

      enatencion:
        'En atención',

      atendido:
        'Atendido',

      cancelado:
        'Cancelado',

      noasistio:
        'No asistió'
    };


    return (
      mapa[estado] ??
      'Sin estado'
    );
  }


  obtenerClaseEstado(): string {

    const estado =
      this.normalizarEstado(
        this.turno?.estado
      );


    return (
      `status-${estado}`
    );
  }


  // =======================================================
  // HORAS
  // =======================================================

  private formatearHora(
    hora:
      string
      | null
      | undefined
  ): string {

    if (!hora) {
      return '';
    }


    return hora
      .toString()
      .substring(
        0,
        5
      );
  }


  // =======================================================
  // ERROR
  // =======================================================

  private mostrarError(
    error: any,
    mensajeDefault: string,
    titulo = 'Ocurrió un problema'
  ): void {

    const mensaje =
      error
        ?.error
        ?.message
      ??
      error
        ?.error
        ?.mensaje
      ??
      error
        ?.error
      ??
      mensajeDefault;


    this.alertaService.error(
      titulo,
      typeof mensaje ===
        'string'
        ? mensaje
        : mensajeDefault
    );
  }
}
