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
import { SuscripcionService, WhatsAppEstadoCupo } from '../../services/suscripcion.service';

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

      AlertaService,

    private readonly suscripcionService: SuscripcionService

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

    // Se consulta después de conocer el rol real del usuario.
    this.cargarAvisosInicio();

  }

  // =========================================================
  // AVISOS: roles, fechas y cupo real
  // =========================================================
  mostrarAvisoSuscripcion = false;
  mostrarAvisoWhatsApp = false;
  diasRestantesSuscripcion: number | null = null;
  mensajesWhatsAppDisponibles = 0;
  private claveAvisoWhatsApp = '';

  private readonly avisosCerrados = new Set<string>();

  private get esAdministradorAvisos(): boolean {
    // Admin + profesional mantiene el permiso incluso en "Mi agenda".
    return this.rol === 'ADMIN' || this.esAdminYProfesional;
  }

  private get puedeVerAvisoWhatsApp(): boolean {
    return this.rol !== 'SECRETARIA';
  }

  private estaCerrado(clave: string): boolean {
    try {
      return sessionStorage.getItem(clave) === '1';
    } catch {
      return this.avisosCerrados.has(clave);
    }
  }

  private guardarCierre(clave: string): void {
    this.avisosCerrados.add(clave);
    try {
      sessionStorage.setItem(clave, '1');
    } catch {
      // El cierre sigue funcionando aunque el navegador bloquee storage.
    }
  }

  private claveSuscripcion(): string {
    return `coria-aviso-suscripcion-${this.fechaVencimientoAviso}-${this.diasRestantesSuscripcion}`;
  }

  private fechaVencimientoAviso = '';

  cerrarAvisoSuscripcion(): void {
    this.guardarCierre(this.claveSuscripcion());
    this.mostrarAvisoSuscripcion = false;
  }

  cerrarAvisoWhatsApp(): void {
    this.guardarCierre(this.claveAvisoWhatsApp);
    this.mostrarAvisoWhatsApp = false;
  }

  private cargarAvisosInicio(): void {
    this.mostrarAvisoSuscripcion = false;
    this.mostrarAvisoWhatsApp = false;

    if (this.esAdministradorAvisos) {
      this.suscripcionService.obtenerActual().subscribe({
        next: (suscripcion) => {
          const datos = suscripcion as unknown as Record<string, unknown>;
          const estado = String(datos['estado'] ?? '').toLowerCase();
          if (estado !== 'activa' && estado !== 'enprueba') return;

          // La fecha exacta debe ser la fecha real de vencimiento de la API.
          const valor = datos['fechaFin'];

          if (typeof valor !== 'string' || !valor) return;

          const fecha = this.fechaLocal(valor);
          if (!fecha) return;

          const hoy = new Date();
          const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
          const dias = Math.round((Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) - Date.UTC(inicioHoy.getFullYear(), inicioHoy.getMonth(), inicioHoy.getDate())) / 86400000);
          this.diasRestantesSuscripcion = dias;
          this.fechaVencimientoAviso = this.claveFecha(fecha);
          this.mostrarAvisoSuscripcion =
            (dias === 3 || dias === 0) && !this.estaCerrado(this.claveSuscripcion());
        },
        error: (error) => console.warn('No se pudo consultar el aviso de suscripción', error)
      });
    }

    if (this.puedeVerAvisoWhatsApp) {
      this.suscripcionService.obtenerEstadoWhatsApp().subscribe({
        next: (estado: WhatsAppEstadoCupo) => {
          const disponibles = Number(estado.mensajesDisponiblesTotales);
          const consumidos = Number(estado.mensajesConsumidos) + Number(estado.mensajesExtraConsumidos ?? 0);
          if (!Number.isFinite(disponibles) || !Number.isFinite(consumidos)
              || disponibles < 0 || consumidos < 0) return;

          // El 20% se calcula sobre el total real del ciclo (usados + disponibles).
          const total = disponibles + consumidos;
          if (total <= 0) return;

          this.mensajesWhatsAppDisponibles = disponibles;
          // Una compra o el nuevo ciclo generan una clave distinta.
          // No se vuelve a mostrar durante el mismo episodio de saldo bajo.
          const identidad = `${estado.periodoInicio}-${estado.mensajesIncluidos}-${total}`;
          this.claveAvisoWhatsApp = `coria-aviso-whatsapp-${identidad}`;
          this.mostrarAvisoWhatsApp = disponibles / total <= 0.20
            && !this.estaCerrado(this.claveAvisoWhatsApp);
        },
        error: (error) => console.warn('No se pudo consultar el cupo de WhatsApp', error)
      });
    }
  }

  private fechaLocal(valor: string): Date | null {
    const match = /^(\\d{4})-(\\d{2})-(\\d{2})/.exec(valor);
    if (!match) return null;
    const fecha = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return fecha.getFullYear() === Number(match[1])
      && fecha.getMonth() === Number(match[2]) - 1
      && fecha.getDate() === Number(match[3]) ? fecha : null;
  }

  private claveFecha(fecha: Date): string {
    return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
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
