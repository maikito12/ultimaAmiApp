import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  forkJoin
} from 'rxjs';



import {
  EstadisticaDia,
  EstadisticaDiaSemana,
  EstadisticaEspecialidad,
  EstadisticaFiltroOpcion,
  EstadisticaHorario,
  EstadisticaObraSocial,
  EstadisticaOrigen,
  EstadisticaProfesional,
  EstadisticaSucursal,
  EstadisticasConsulta,
  EstadisticasResponse,
  EstadisticasService
} from '../../services/estadisticas.service';
import { AlertaService } from '../../services/alerta.service';


type PeriodoEstadisticas =
  | 'hoy'
  | 'ultimos_7_dias'
  | 'este_mes'
  | 'mes_pasado'
  | 'personalizado';


interface FiltroEstadisticas {
  periodo:
    PeriodoEstadisticas;

  fechaInicio:
    string;

  fechaFin:
    string;

  sucursalId:
    string;

  profesionalId:
    string;

  especialidadId:
    string;
}


interface KpiEstadistica {
  id:
    string;

  label:
    string;

  valor:
    number
    | string;

  detalle:
    string;

  tipo:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral';
}


interface SerieDiaVisual {
  fecha:
    string;

  label:
    string;

  valor:
    number;
}


interface EstadoPrincipal {
  id:
    'atendidos'
    | 'cancelados'
    | 'no-asistio';

  label:
    string;

  cantidad:
    number;

  porcentaje:
    number;
}


@Component({
  selector:
    'app-estadisticas',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './estadisticas.component.html',

  styleUrl:
    './estadisticas.component.css'
})
export class EstadisticasComponent
  implements OnInit {

  // =========================================================
  // FILTROS
  // =========================================================

  filtro:
    FiltroEstadisticas =
      {
        periodo:
          'este_mes',

        fechaInicio:
          '',

        fechaFin:
          '',

        sucursalId:
          'todas',

        profesionalId:
          'todos',

        especialidadId:
          'todas'
      };


  sucursales:
    EstadisticaFiltroOpcion[] =
      [];

  profesionales:
    EstadisticaFiltroOpcion[] =
      [];

  especialidades:
    EstadisticaFiltroOpcion[] =
      [];


  // =========================================================
  // ESTADO
  // =========================================================

  cargando =
    true;

  fechaActualizacion =
    '';

  alcance:
    'ORGANIZACION'
    | 'MI_AGENDA' =
      'ORGANIZACION';

  desdeReal =
    '';

  hastaReal =
    '';


  // =========================================================
  // DATOS
  // =========================================================

  kpis:
    KpiEstadistica[] =
      [];

  evolucionTurnos:
    SerieDiaVisual[] =
      [];

  estadosPrincipales:
    EstadoPrincipal[] =
      [];

  porEstadoCompleto =
    [] as EstadisticasResponse['porEstado'];

  origenesReserva:
    EstadisticaOrigen[] =
      [];

  horarios:
    EstadisticaHorario[] =
      [];

  obrasSociales:
    EstadisticaObraSocial[] =
      [];

  porDiaSemana:
    EstadisticaDiaSemana[] =
      [];

  porSucursal:
    EstadisticaSucursal[] =
      [];

  porEspecialidad:
    EstadisticaEspecialidad[] =
      [];

  porProfesional:
    EstadisticaProfesional[] =
      [];


  constructor(
    private readonly estadisticasService:
      EstadisticasService,

    private readonly alertaService:
      AlertaService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.cargarTodo();

  }


  // =========================================================
  // CARGA INICIAL
  // =========================================================

  cargarTodo(): void {

    this.cargando =
      true;


    const consulta =
      this.construirConsulta();


    if (!consulta) {

      this.cargando =
        false;

      return;

    }


    forkJoin({
      filtros:
        this.estadisticasService
          .obtenerFiltros(),

      estadisticas:
        this.estadisticasService
          .obtener(
            consulta
          )
    })
    .subscribe({

      next: (
        response
      ) => {

        this.aplicarFiltrosDisponibles(
          response.filtros
        );


        this.aplicarEstadisticas(
          response.estadisticas
        );


        this.cargando =
          false;

      },


      error: (
        error: any
      ) => {

        console.error(
          'Error cargando estadísticas:',
          error
        );


        this.cargando =
          false;


        this.alertaService.error(
          'No se pudieron cargar las estadísticas',
          this.obtenerMensajeError(
            error,
            'No pudimos obtener los datos del período seleccionado.'
          )
        );

      }

    });

  }


  // =========================================================
  // RECARGAR SOLO ESTADÍSTICAS
  // =========================================================

  cargarEstadisticas(): void {

    const consulta =
      this.construirConsulta();


    if (!consulta) {
      return;
    }


    this.cargando =
      true;


    this.estadisticasService
      .obtener(
        consulta
      )
      .subscribe({

        next: (
          response
        ) => {

          this.aplicarEstadisticas(
            response
          );


          this.cargando =
            false;

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error cargando estadísticas:',
            error
          );


          this.cargando =
            false;


          this.alertaService.error(
            'No se pudieron cargar las estadísticas',
            this.obtenerMensajeError(
              error,
              'Revisá los filtros seleccionados e intentá nuevamente.'
            )
          );

        }

      });

  }


  // =========================================================
  // FILTROS DEL BACKEND
  // =========================================================

  private aplicarFiltrosDisponibles(
    response: {
      profesionales:
        EstadisticaFiltroOpcion[];

      sucursales:
        EstadisticaFiltroOpcion[];

      especialidades:
        EstadisticaFiltroOpcion[];
    }
  ): void {

    this.profesionales =
      [
        {
          id:
            'todos',

          nombre:
            'Todos los profesionales'
        },
        ...(
          response.profesionales
          ??
          []
        )
      ];


    this.sucursales =
      [
        {
          id:
            'todas',

          nombre:
            'Todas las sucursales'
        },
        ...(
          response.sucursales
          ??
          []
        )
      ];


    this.especialidades =
      [
        {
          id:
            'todas',

          nombre:
            'Todas las especialidades'
        },
        ...(
          response.especialidades
          ??
          []
        )
      ];

  }


  // =========================================================
  // APLICAR RESPONSE
  // =========================================================

  private aplicarEstadisticas(
    response:
      EstadisticasResponse
  ): void {

    this.alcance =
      response.alcance;


    this.desdeReal =
      response.desde;


    this.hastaReal =
      response.hasta;


    this.kpis =
      [
        {
          id:
            'turnos',

          label:
            'Turnos del período',

          valor:
            response.kpis
              .turnosTotales,

          detalle:
            `${response.kpis.promedioTurnosPorDia} por día`,

          tipo:
            'primary'
        },

        {
          id:
            'asistencia',

          label:
            'Asistencia',

          valor:
            `${this.formatearPorcentaje(
              response.kpis
                .porcentajeAsistencia
            )}%`,

          detalle:
            `${response.kpis.atendidos} atendidos`,

          tipo:
            'success'
        },

        {
          id:
            'pacientes',

          label:
            'Pacientes únicos',

          valor:
            response.kpis
              .pacientesUnicos,

          detalle:
            `${response.kpis.pacientesQueVolvieron} volvieron`,

          tipo:
            'neutral'
        },

        {
          id:
            'retorno',

          label:
            'Retorno',

          valor:
            `${this.formatearPorcentaje(
              response.kpis
                .porcentajeRetorno
            )}%`,

          detalle:
            'Pacientes con 2+ atenciones',

          tipo:
            'success'
        },

        {
          id:
            'cancelacion',

          label:
            'Cancelación',

          valor:
            `${this.formatearPorcentaje(
              response.kpis
                .porcentajeCancelacion
            )}%`,

          detalle:
            `${response.kpis.cancelados} cancelados`,

          tipo:
            'warning'
        },

        {
          id:
            'no-asistio',

          label:
            'No asistieron',

          valor:
            response.kpis
              .noAsistio,

          detalle:
            `${response.kpis.pendientes} pendientes · ${response.kpis.confirmados} confirmados`,

          tipo:
            'danger'
        }
      ];


    this.evolucionTurnos =
      this.completarDias(
        response.desde,
        response.hasta,
        response.porDia
      );


    this.porEstadoCompleto =
      response.porEstado
      ??
      [];


    this.estadosPrincipales =
      this.crearEstadosPrincipales(
        response
      );


    this.origenesReserva =
      response.porOrigen
      ??
      [];


    this.horarios =
      (
        response.porHorario
        ??
        []
      )
      .slice(
        0,
        8
      );


    this.obrasSociales =
      (
        response.porObraSocial
        ??
        []
      )
      .slice(
        0,
        8
      );


    this.porDiaSemana =
      response.porDiaSemana
      ??
      [];


    this.porSucursal =
      response.porSucursal
      ??
      [];


    this.porEspecialidad =
      response.porEspecialidad
      ??
      [];


    this.porProfesional =
      response.porProfesional
      ??
      [];


    this.fechaActualizacion =
      `Actualizado ${new Intl.DateTimeFormat(
        'es-AR',
        {
          hour:
            '2-digit',

          minute:
            '2-digit'
        }
      ).format(
        new Date()
      )}`;

  }


  // =========================================================
  // FILTROS
  // =========================================================

  aplicarFiltros(): void {

    if (
      this.filtro.periodo ===
        'personalizado'
    ) {
      return;
    }


    this.cargarEstadisticas();

  }


  aplicarFechasPersonalizadas():
    void {

    if (
      !this.filtro.fechaInicio
      ||
      !this.filtro.fechaFin
    ) {

      this.alertaService.warning(
        'Completá las fechas',
        'Elegí una fecha desde y una fecha hasta.'
      );

      return;

    }


    if (
      this.filtro.fechaFin <
      this.filtro.fechaInicio
    ) {

      this.alertaService.warning(
        'Período inválido',
        'La fecha hasta no puede ser anterior a la fecha desde.'
      );

      return;

    }


    this.cargarEstadisticas();

  }


  restablecerFiltros():
    void {

    this.filtro =
      {
        periodo:
          'este_mes',

        fechaInicio:
          '',

        fechaFin:
          '',

        sucursalId:
          'todas',

        profesionalId:
          'todos',

        especialidadId:
          'todas'
      };


    this.cargarEstadisticas();

  }


  get mostrarFechasPersonalizadas():
    boolean {

    return (
      this.filtro.periodo ===
        'personalizado'
    );

  }


  get mostrarFiltroProfesional():
    boolean {

    return (
      this.alcance ===
        'ORGANIZACION'
      &&
      this.profesionales.length >
        1
    );

  }


  get subtitulo():
    string {

    if (
      this.alcance ===
        'MI_AGENDA'
    ) {

      return 'Analizá el rendimiento de tu agenda y el comportamiento de tus turnos.';

    }


    return 'Una vista clara de la actividad y la demanda de la organización.';

  }


  get periodoTexto():
    string {

    if (
      !this.desdeReal
      ||
      !this.hastaReal
    ) {
      return '';
    }


    return (
      `${this.formatearFechaCorta(
        this.desdeReal
      )} — ${this.formatearFechaCorta(
        this.hastaReal
      )}`
    );

  }


  // =========================================================
  // QUERY
  // =========================================================

  private construirConsulta():
    EstadisticasConsulta
    | null {

    const periodo =
      this.resolverPeriodo();


    if (!periodo) {
      return null;
    }


    const consulta:
      EstadisticasConsulta =
      {
        desde:
          periodo.desde,

        hasta:
          periodo.hasta
      };


    if (
      this.filtro.profesionalId !==
        'todos'
    ) {

      consulta
        .profesionalOrganizacionId =
          this.filtro.profesionalId;

    }


    if (
      this.filtro.sucursalId !==
        'todas'
    ) {

      consulta.sucursalId =
        this.filtro.sucursalId;

    }


    if (
      this.filtro.especialidadId !==
        'todas'
    ) {

      consulta.especialidadId =
        this.filtro.especialidadId;

    }


    return consulta;

  }


  private resolverPeriodo():
    {
      desde:
        string;

      hasta:
        string;
    }
    | null {

    const hoy =
      this.inicioDelDia(
        new Date()
      );


    switch (
      this.filtro.periodo
    ) {

      case 'hoy':

        return {
          desde:
            this.fechaIso(
              hoy
            ),

          hasta:
            this.fechaIso(
              hoy
            )
        };


      case 'ultimos_7_dias': {

        const desde =
          new Date(
            hoy
          );


        desde.setDate(
          desde.getDate() -
          6
        );


        return {
          desde:
            this.fechaIso(
              desde
            ),

          hasta:
            this.fechaIso(
              hoy
            )
        };
      }


      case 'mes_pasado': {

        const desde =
          new Date(
            hoy.getFullYear(),
            hoy.getMonth() - 1,
            1
          );


        const hasta =
          new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            0
          );


        return {
          desde:
            this.fechaIso(
              desde
            ),

          hasta:
            this.fechaIso(
              hasta
            )
        };
      }


      case 'personalizado':

        if (
          !this.filtro.fechaInicio
          ||
          !this.filtro.fechaFin
        ) {
          return null;
        }


        return {
          desde:
            this.filtro.fechaInicio,

          hasta:
            this.filtro.fechaFin
        };


      case 'este_mes':
      default: {

        const desde =
          new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            1
          );


        return {
          desde:
            this.fechaIso(
              desde
            ),

          hasta:
            this.fechaIso(
              hoy
            )
        };
      }
    }

  }


  // =========================================================
  // VISUALES
  // =========================================================

  get maxEvolucion():
    number {

    return Math.max(
      ...this.evolucionTurnos
        .map(
          item =>
            item.valor
        ),
      1
    );

  }


  alturaBarra(
    valor:
      number
  ): number {

    if (
      valor <= 0
    ) {
      return 3;
    }


    return Math.max(
      7,
      Math.round(
        (
          valor /
          this.maxEvolucion
        )
        *
        100
      )
    );

  }


  get picoTurnos():
    number {

    return Math.max(
      ...this.evolucionTurnos
        .map(
          x =>
            x.valor
        ),
      0
    );

  }


  mostrarLabelDia(
    index:
      number
  ): boolean {

    const total =
      this.evolucionTurnos.length;


    if (
      total <= 12
    ) {
      return true;
    }


    const salto =
      total <= 31
        ? 5
        : Math.ceil(
            total /
            10
          );


    return (
      index === 0
      ||
      index ===
        total - 1
      ||
      index %
        salto ===
        0
    );

  }


  maxCantidad(
    items:
      Array<{
        cantidad:
          number;
      }>
  ): number {

    return Math.max(
      ...items.map(
        x =>
          x.cantidad
      ),
      1
    );

  }


  anchoRelativo(
    cantidad:
      number,

    items:
      Array<{
        cantidad:
          number;
      }>
  ): number {

    if (
      cantidad <= 0
    ) {
      return 0;
    }


    return Math.max(
      4,
      Math.round(
        cantidad
        /
        this.maxCantidad(
          items
        )
        *
        100
      )
    );

  }


  get porcentajeAtendidosResueltos():
    number {

    const atendidos =
      this.estadosPrincipales
        .find(
          x =>
            x.id ===
              'atendidos'
        )
        ?.cantidad
      ??
      0;


    const total =
      this.estadosPrincipales
        .reduce(
          (
            acumulado,
            x
          ) =>
            acumulado +
            x.cantidad,
          0
        );


    if (
      total <= 0
    ) {
      return 0;
    }


    return Math.round(
      atendidos *
      100 /
      total
    );

  }


  get estiloDonut():
    string {

    const atendidos =
      this.obtenerEstadoPrincipal(
        'atendidos'
      )
      .porcentaje;


    const cancelados =
      this.obtenerEstadoPrincipal(
        'cancelados'
      )
      .porcentaje;


    const noAsistio =
      this.obtenerEstadoPrincipal(
        'no-asistio'
      )
      .porcentaje;


    const total =
      atendidos +
      cancelados +
      noAsistio;


    if (
      total <= 0
    ) {

      return (
        'conic-gradient(#edf2ef 0 100%)'
      );

    }


    const pAtendidos =
      atendidos *
      100 /
      total;


    const pCancelados =
      cancelados *
      100 /
      total;


    const corte2 =
      pAtendidos +
      pCancelados;


    return `conic-gradient(
      #2f7d5f 0 ${pAtendidos}%,
      #c99330 ${pAtendidos}% ${corte2}%,
      #c25b5b ${corte2}% 100%
    )`;

  }


  // =========================================================
  // HELPERS DATOS
  // =========================================================

  private crearEstadosPrincipales(
    response:
      EstadisticasResponse
  ): EstadoPrincipal[] {

    const total =
      response.kpis.atendidos
      +
      response.kpis.cancelados
      +
      response.kpis.noAsistio;


    const porcentaje = (
      cantidad:
        number
    ): number => {

      if (
        total <= 0
      ) {
        return 0;
      }


      return Math.round(
        cantidad *
        1000 /
        total
      )
      /
      10;

    };


    return [
      {
        id:
          'atendidos',

        label:
          'Atendidos',

        cantidad:
          response.kpis
            .atendidos,

        porcentaje:
          porcentaje(
            response.kpis
              .atendidos
          )
      },

      {
        id:
          'cancelados',

        label:
          'Cancelados',

        cantidad:
          response.kpis
            .cancelados,

        porcentaje:
          porcentaje(
            response.kpis
              .cancelados
          )
      },

      {
        id:
          'no-asistio',

        label:
          'No asistieron',

        cantidad:
          response.kpis
            .noAsistio,

        porcentaje:
          porcentaje(
            response.kpis
              .noAsistio
          )
      }
    ];

  }


  private obtenerEstadoPrincipal(
    id:
      EstadoPrincipal['id']
  ): EstadoPrincipal {

    return (
      this.estadosPrincipales
        .find(
          x =>
            x.id ===
              id
        )
      ??
      {
        id,
        label:
          '',
        cantidad:
          0,
        porcentaje:
          0
      }
    );

  }


  private completarDias(
    desde:
      string,

    hasta:
      string,

    datos:
      EstadisticaDia[]
  ): SerieDiaVisual[] {

    const mapa =
      new Map<
        string,
        number
      >(
        (
          datos
          ??
          []
        )
        .map(
          x =>
            [
              x.fecha,
              x.cantidad
            ]
        )
      );


    const actual =
      this.parseFechaLocal(
        desde
      );


    const fin =
      this.parseFechaLocal(
        hasta
      );


    const resultado:
      SerieDiaVisual[] =
      [];


    while (
      actual <=
      fin
    ) {

      const fecha =
        this.fechaIso(
          actual
        );


      resultado.push({
        fecha,

        label:
          String(
            actual.getDate()
          ),

        valor:
          mapa.get(
            fecha
          )
          ??
          0
      });


      actual.setDate(
        actual.getDate() +
        1
      );

    }


    return resultado;

  }


  formatearPorcentaje(
    valor:
      number
  ): string {

    return Number(
      valor
      ??
      0
    )
    .toLocaleString(
      'es-AR',
      {
        maximumFractionDigits:
          1
      }
    );

  }


  private formatearFechaCorta(
    fecha:
      string
  ): string {

    const date =
      this.parseFechaLocal(
        fecha
      );


    return new Intl.DateTimeFormat(
      'es-AR',
      {
        day:
          '2-digit',

        month:
          'short'
      }
    )
    .format(
      date
    );

  }


  private inicioDelDia(
    fecha:
      Date
  ): Date {

    return new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      12,
      0,
      0
    );

  }


  private fechaIso(
    fecha:
      Date
  ): string {

    const year =
      fecha.getFullYear();


    const month =
      String(
        fecha.getMonth() +
        1
      )
      .padStart(
        2,
        '0'
      );


    const day =
      String(
        fecha.getDate()
      )
      .padStart(
        2,
        '0'
      );


    return `${year}-${month}-${day}`;

  }


  private parseFechaLocal(
    fecha:
      string
  ): Date {

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
      day,
      12,
      0,
      0
    );

  }


  trackById(
    _:
      number,

    item:
      {
        id?: string;
        profesionalOrganizacionId?: string;
        sucursalId?: string;
        especialidadId?: string;
        obraSocialId?: string | null;
      }
  ): string {

    return (
      item.id
      ??
      item.profesionalOrganizacionId
      ??
      item.sucursalId
      ??
      item.especialidadId
      ??
      item.obraSocialId
      ??
      'particular'
    );

  }


  trackByLabel(
    _:
      number,

    item:
      {
        origen?: string;
        hora?: string;
        nombre?: string;
        dia?: string;
        estado?: string;
      }
  ): string {

    return (
      item.origen
      ??
      item.hora
      ??
      item.nombre
      ??
      item.dia
      ??
      item.estado
      ??
      ''
    );

  }


  private obtenerMensajeError(
    error:
      any,

    fallback:
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
      fallback
    );

  }
}
