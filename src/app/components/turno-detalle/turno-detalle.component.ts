import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { TurnosService } from '../../services/turno-service.service';

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
export class TurnoDetalleComponent implements OnInit {

  // =======================================================
  // DATOS
  // =======================================================

  turno: any = null;

  turnoId = '';

  fechaOrigen = '';

  cargando = true;


  // =======================================================
  // TABS
  // =======================================================

  tabActual: TabTurno =
    'resumen';


  // =======================================================
  // CONSTRUCTOR
  // =======================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turnosService: TurnosService
  ) {}


  // =======================================================
  // INIT
  // =======================================================

  ngOnInit(): void {

    this.turnoId =
      this.route
        .snapshot
        .paramMap
        .get('id')
      ?? '';


    this.fechaOrigen =
      this.route
        .snapshot
        .queryParamMap
        .get('fecha')
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

  cargarTurno(): void {

    this.cargando = true;


    this.turnosService
      .obtenerDetalleTurno(
        this.turnoId
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'DETALLE TURNO:',
            response
          );


          this.turno =
            response;


          this.cargando =
            false;
        },


        error: (error) => {

          console.error(
            'Error cargando turno:',
            error
          );


          this.cargando =
            false;


          Swal.fire({
            icon:
              'error',

            title:
              'No se pudo cargar el turno',

            text:
              error?.error?.message ??
              error?.error?.mensaje ??
              'Ocurrió un error al obtener la información del turno.',

            confirmButtonColor:
              '#17483d'
          });
        }
      });
  }


  // =======================================================
  // CAMBIAR TAB
  // =======================================================

  cambiarTab(
    tab: TabTurno
  ): void {

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

      Swal.fire({
        icon:
          'info',

        title:
          'Ficha del paciente',

        text:
          'Todavía necesitamos que el detalle del turno devuelva el pacienteId para abrir su ficha.',

        confirmButtonColor:
          '#17483d'
      });


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

confirmarTurno(): void {

  if (!this.turnoId) {
    return;
  }

  Swal.fire({
    title: '¿Confirmar turno?',
    text: `Se confirmará el turno de ${this.obtenerPaciente()}.`,
    icon: 'question',

    showCancelButton: true,

    confirmButtonText: 'Confirmar turno',
    cancelButtonText: 'Volver',

    confirmButtonColor: '#17483d'
  })
  .then(result => {

    if (!result.isConfirmed) {
      return;
    }

    this.turnosService
      .confirmarTurno(this.turnoId)
      .subscribe({

        next: () => {

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Turno confirmado',
            showConfirmButton: false,
            timer: 2200
          });

          this.cargarTurno();
        },

        error: error => {

          this.mostrarError(
            error,
            'No se pudo confirmar el turno.'
          );
        }
      });
  });
}
  // =======================================================
  // CHECK-IN
  // =======================================================

  checkIn(): void {

    if (!this.turnoId) {
      return;
    }


    this.turnosService
      .hacerCheckIn(
        this.turnoId
      )
      .subscribe({

        next: () => {

          Swal.fire({
            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              'Paciente ingresado a sala',

            showConfirmButton:
              false,

            timer:
              2200
          });


          this.cargarTurno();
        },


        error: error => {

          this.mostrarError(
            error,
            'No se pudo realizar el check-in.'
          );
        }
      });
  }


  // =======================================================
  // INICIAR ATENCIÓN
  // =======================================================

  iniciarAtencion(): void {

    if (!this.turnoId) {
      return;
    }


    this.turnosService
      .iniciarAtencion(
        this.turnoId
      )
      .subscribe({

        next: () => {

          Swal.fire({
            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              'Atención iniciada',

            showConfirmButton:
              false,

            timer:
              2200
          });


          this.cargarTurno();
        },


        error: error => {

          this.mostrarError(
            error,
            'No se pudo iniciar la atención.'
          );
        }
      });
  }


  // =======================================================
  // FINALIZAR ATENCIÓN
  // =======================================================

  finalizarAtencion(): void {

    if (!this.turnoId) {
      return;
    }


    Swal.fire({
      title:
        '¿Finalizar atención?',

      text:
        `Se marcará como atendido a ${this.obtenerPaciente()}.`,

      icon:
        'question',

      showCancelButton:
        true,

      confirmButtonText:
        'Finalizar',

      cancelButtonText:
        'Volver',

      confirmButtonColor:
        '#17483d'
    })
      .then(result => {

        if (!result.isConfirmed) {
          return;
        }


        this.turnosService
          .finalizarAtencion(
            this.turnoId
          )
          .subscribe({

            next: () => {

              Swal.fire({
                toast:
                  true,

                position:
                  'top-end',

                icon:
                  'success',

                title:
                  'Consulta finalizada',

                showConfirmButton:
                  false,

                timer:
                  2200
              });


              this.cargarTurno();
            },


            error: error => {

              this.mostrarError(
                error,
                'No se pudo finalizar la atención.'
              );
            }
          });
      });
  }


  // =======================================================
  // NO ASISTIÓ
  // =======================================================

  registrarNoAsistio(): void {

    if (!this.turnoId) {
      return;
    }


    Swal.fire({
      title:
        '¿El paciente no asistió?',

      text:
        this.obtenerPaciente(),

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonText:
        'Marcar no asistió',

      cancelButtonText:
        'Volver',

      confirmButtonColor:
        '#64748b'
    })
      .then(result => {

        if (!result.isConfirmed) {
          return;
        }


        this.turnosService
          .registrarNoAsistio(
            this.turnoId
          )
          .subscribe({

            next: () => {

              Swal.fire({
                toast:
                  true,

                position:
                  'top-end',

                icon:
                  'success',

                title:
                  'Marcado como no asistió',

                showConfirmButton:
                  false,

                timer:
                  2200
              });


              this.cargarTurno();
            },


            error: error => {

              this.mostrarError(
                error,
                'No se pudo actualizar el turno.'
              );
            }
          });
      });
  }


  // =======================================================
  // CANCELAR TURNO
  // =======================================================

  cancelarTurno(): void {

    if (!this.turnoId) {
      return;
    }


    Swal.fire({
      title:
        'Cancelar turno',

      text:
        `¿Querés cancelar el turno de ${this.obtenerPaciente()}?`,

      input:
        'textarea',

      inputLabel:
        'Motivo de cancelación',

      inputPlaceholder:
        'Escribí el motivo...',

      showCancelButton:
        true,

      confirmButtonText:
        'Cancelar turno',

      cancelButtonText:
        'Volver',

      confirmButtonColor:
        '#b42318',

      inputValidator: value => {

        if (!value?.trim()) {

          return 'Ingresá un motivo de cancelación.';
        }


        return null;
      }
    })
      .then(result => {

        if (!result.isConfirmed) {
          return;
        }


        this.turnosService
          .cancelarTurno(
            this.turnoId,
            result.value
          )
          .subscribe({

            next: () => {

              Swal.fire({
                icon:
                  'success',

                title:
                  'Turno cancelado',

                confirmButtonColor:
                  '#17483d'
              });


              this.cargarTurno();
            },


            error: error => {

              this.mostrarError(
                error,
                'No se pudo cancelar el turno.'
              );
            }
          });
      });
  }


  // =======================================================
  // ESTADOS
  // =======================================================
puedeConfirmar(): boolean {

  return (
    this.normalizarEstado(
      this.turno?.estado
    ) === 'pendiente'
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
      estado === 'ensala' ||
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
        .split(/\s+/)
        .filter(Boolean);


    if (!partes.length) {
      return 'P';
    }


    return partes
      .slice(0, 2)
      .map(
        parte =>
          parte
            .charAt(0)
            .toUpperCase()
      )
      .join('');
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
        .split('-')
        .map(Number);


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

    // Compatibilidad con turnos viejos
    case 0:
      return 'Recepción';

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
      estado === null ||
      estado === undefined
    ) {
      return '';
    }


   if (
  typeof estado ===
  'number'
) {

  const mapa: {
    [key: number]: string;
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
      'ausente',

    8:
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
      .replace(/\s/g, '')
      .replace(/-/g, '')
      .replace(/_/g, '');
  }


 obtenerTextoEstado(): string {

  const estado =
    this.normalizarEstado(
      this.turno?.estado
    );


  const mapa: {
    [key: string]: string;
  } = {

    pendiente: 'Pendiente',

    confirmado: 'Confirmado',

    ensala: 'En sala',

    espera: 'En sala',

    enatencion: 'En atención',

    atendido: 'Atendido',

    cancelado: 'Cancelado',

    ausente: 'Ausente',

    noasistio: 'No asistió'
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
    hora: string | null | undefined
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
    mensajeDefault: string
  ): void {

    const mensaje =
      error?.error?.message ??
      error?.error?.mensaje ??
      error?.error ??
      mensajeDefault;


    Swal.fire({
      icon:
        'error',

      title:
        'Ocurrió un problema',

      text:
        typeof mensaje ===
          'string'
          ? mensaje
          : mensajeDefault,

      confirmButtonColor:
        '#17483d'
    });
  }
}