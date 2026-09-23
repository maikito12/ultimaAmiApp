import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterModule
} from '@angular/router';



import {
  DashboardHomeCumple,
  DashboardHomeResponse,
  DashboardHomeService,
  DashboardHomeTurno,
  RolInicio,
  VistaInicio
} from '../../services/dashboard-home.service';
import { AlertaService } from '../../services/alerta.service';


interface InicioKpi {
  id:
    | 'turnos-hoy'
    | 'pacientes'
    | 'atendidos'
    | 'pendientes'
    | 'profesionales';

  label: string;

  valor:
    number
    | string;

  detalle?: string;

  tipo:
    | 'primary'
    | 'success'
    | 'warning'
    | 'neutral';
}


@Component({
  selector:
    'app-inicio',

  standalone:
    true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl:
    './inicio.component.html',

  styleUrl:
    './inicio.component.css'
})
export class InicioComponent
  implements OnInit {

  // =========================================================
  // ESTADO
  // =========================================================

  nombreUsuario =
    '';

  rol:
    RolInicio =
      'ADMIN';

  esAdminYProfesional =
    false;

  vistaActiva:
    VistaInicio =
      'ORGANIZACION';

  cargando =
    true;

  fechaApi =
    '';

  fechaTexto =
    '';

  // =========================================================
  // DATOS REALES
  // =========================================================

  kpis:
    InicioKpi[] =
      [];

  proximosTurnos:
    DashboardHomeTurno[] =
      [];

  cumplesHoy:
    DashboardHomeCumple[] =
      [];


  constructor(
    private readonly dashboardHomeService:
      DashboardHomeService,

    private readonly alertaService:
      AlertaService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.cargarInicio();

  }


  // =========================================================
  // CARGAR HOME
  // =========================================================

  cargarInicio(
    vista?: VistaInicio
  ): void {

    if (this.cargando && this.fechaApi) {
      return;
    }


    this.cargando =
      true;


    this.dashboardHomeService
      .obtener(
        vista
      )
      .subscribe({

        next: (
          response:
            DashboardHomeResponse
        ) => {

          this.aplicarRespuesta(
            response
          );


          this.cargando =
            false;

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error cargando Inicio:',
            error
          );


          this.cargando =
            false;


          this.alertaService.error(
            'No se pudo cargar el inicio',
            this.obtenerMensajeError(
              error,
              'No pudimos obtener el resumen de la organización.'
            )
          );

        }

      });

  }


  // =========================================================
  // APLICAR RESPONSE
  // =========================================================

  private aplicarRespuesta(
    response:
      DashboardHomeResponse
  ): void {

    this.nombreUsuario =
      response.nombreUsuario
      ||
      'Usuario';


    this.rol =
      response.rol;


    this.esAdminYProfesional =
      response.puedeCambiarVista;


    this.vistaActiva =
      response.vista;


    this.fechaApi =
      response.fecha;


    this.fechaTexto =
      this.formatearFecha(
        response.fecha
      );


    this.proximosTurnos =
      response.proximosTurnos
      ??
      [];


    this.cumplesHoy =
      response.cumplesHoy
      ??
      [];


    this.construirKpis(
      response
    );

  }


  // =========================================================
  // KPIS
  // =========================================================

  private construirKpis(
    response:
      DashboardHomeResponse
  ): void {

    const stats =
      response.stats;


    const kpis:
      InicioKpi[] =
      [
        {
          id:
            'turnos-hoy',

          label:
            'Turnos de hoy',

          valor:
            stats.turnosHoy,

          detalle:
            `${stats.pendientesHoy} pendientes`,

          tipo:
            'primary'
        },

        {
          id:
            'pacientes',

          label:
            this.vistaActiva ===
              'MI_AGENDA'
                ? 'Mis pacientes'
                : 'Pacientes',

          valor:
            stats.pacientesTotal,

          detalle:
            this.vistaActiva ===
              'MI_AGENDA'
                ? 'Vinculados a tu atención'
                : 'Total activos',

          tipo:
            'neutral'
        },

        {
          id:
            'atendidos',

          label:
            'Atendidos hoy',

          valor:
            stats.turnosAtendidosHoy,

          detalle:
            `${stats.porcentajeAtendidos}% de la agenda`,

          tipo:
            'success'
        },

        {
          id:
            'pendientes',

          label:
            'Por confirmar',

          valor:
            stats.pendientesHoy,

          detalle:
            stats.pendientesHoy === 1
              ? 'Requiere atención'
              : 'Requieren atención',

          tipo:
            'warning'
        }
      ];


    if (
      this.rol ===
        'ADMIN'
      &&
      this.vistaActiva ===
        'ORGANIZACION'
    ) {

      kpis.push({
        id:
          'profesionales',

        label:
          'Profesionales',

        valor:
          stats.profesionalesActivos,

        detalle:
          'Activos en la organización',

        tipo:
          'neutral'
      });

    }


    this.kpis =
      kpis;

  }


  // =========================================================
  // GETTERS SEGÚN ROL
  // =========================================================

  get tituloPrincipal():
    string {

    if (
      this.rol ===
        'SECRETARIA'
    ) {

      return 'Agenda del día';

    }


    if (
      this.rol ===
        'PROFESIONAL'
      ||
      this.vistaActiva ===
        'MI_AGENDA'
    ) {

      return 'Mi jornada';

    }


    return 'Resumen de la organización';

  }


  get subtituloPrincipal():
    string {

    if (
      this.rol ===
        'SECRETARIA'
    ) {

      return 'Organizá los turnos y el flujo de pacientes de hoy.';

    }


    if (
      this.rol ===
        'PROFESIONAL'
      ||
      this.vistaActiva ===
        'MI_AGENDA'
    ) {

      return 'Tus próximos pacientes y tareas para hoy.';

    }


    return 'Una vista rápida de la actividad de hoy.';

  }


  get mostrarMetricasOrganizacion():
    boolean {

    return (
      this.rol ===
        'ADMIN'
      &&
      this.vistaActiva ===
        'ORGANIZACION'
    );

  }


  get mostrarAccesoHistoria():
    boolean {

    return (
      this.rol ===
        'PROFESIONAL'
      ||
      this.vistaActiva ===
        'MI_AGENDA'
    );

  }


  get mostrarGestionOperativa():
    boolean {

    return (
      this.rol ===
        'SECRETARIA'
      ||
      this.rol ===
        'ADMIN'
    );

  }


  get puedeVerEstadisticas():
    boolean {

    return (
      this.rol ===
        'ADMIN'
      ||
      this.rol ===
        'PROFESIONAL'
    );

  }


  get puedeVerAutomatizaciones():
    boolean {

    return (
      this.rol ===
        'ADMIN'
      ||
      this.rol ===
        'PROFESIONAL'
    );

  }


  get pendientesHoy():
    number {

    const kpi =
      this.kpis.find(
        x =>
          x.id ===
            'pendientes'
      );


    return Number(
      kpi?.valor
      ??
      0
    );

  }


  get turnosVisibles():
    DashboardHomeTurno[] {

    return this.proximosTurnos;

  }


  // =========================================================
  // CAMBIAR VISTA
  // =========================================================

  cambiarVista(
    vista:
      VistaInicio
  ): void {

    if (
      vista ===
        this.vistaActiva
      ||
      this.cargando
    ) {
      return;
    }


    this.cargarInicio(
      vista
    );

  }


  // =========================================================
  // ESTADOS
  // =========================================================

  claseEstado(
    estado:
      DashboardHomeTurno['estado']
  ): string {

    const mapa:
      Record<
        DashboardHomeTurno['estado'],
        string
      > =
      {
        'Pendiente':
          'estado pendiente',

        'Confirmado':
          'estado confirmado',

        'En sala':
          'estado sala',

        'En atención':
          'estado atencion',

        'Atendido':
          'estado atendido',

        'Cancelado':
          'estado cancelado',

        'No asistió':
          'estado no-asistio'
      };


    return mapa[estado];

  }


  // =========================================================
  // AYUDAS
  // =========================================================

  iniciales(
    nombre:
      string
  ): string {

    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        parte =>
          parte
            .charAt(0)
            .toUpperCase()
      )
      .join('');

  }


  trackById(
    _:
      number,

    item:
      {
        id: string;
      }
  ): string {

    return item.id;

  }


  private formatearFecha(
    fechaIso:
      string
  ): string {

    if (!fechaIso) {
      return '';
    }


    const partes =
      fechaIso
        .split('-')
        .map(Number);


    if (
      partes.length !==
        3
      ||
      partes.some(
        x =>
          !Number.isFinite(x)
      )
    ) {
      return fechaIso;
    }


    const fecha =
      new Date(
        partes[0],
        partes[1] - 1,
        partes[2],
        12,
        0,
        0
      );


    const texto =
      new Intl.DateTimeFormat(
        'es-AR',
        {
          weekday:
            'long',

          day:
            'numeric',

          month:
            'long'
        }
      )
      .format(
        fecha
      );


    return (
      texto
        .charAt(0)
        .toUpperCase()
      +
      texto.slice(1)
    );

  }


  private obtenerMensajeError(
    error:
      any,

    mensajeDefault:
      string
  ): string {

    return (
      error?.error?.message
      ??
      error?.error?.Message
      ??
      (
        typeof error?.error ===
          'string'
          ? error.error
          : null
      )
      ??
      mensajeDefault
    );

  }
}
