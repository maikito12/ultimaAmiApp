import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import { TurnosService } from '../../services/turno-service.service';
import { ContextoService } from '../../services/contexto.service';


// =========================================================
// TIPOS
// =========================================================

type VistaAgenda =
  | 'tabla'
  | 'calendario';

type ModoAgenda =
  | 'todos'
  | 'mia';


interface DiaSemanaAgenda {

  fecha: string;

  nombre: string;

  numero: number;

  mes: string;

  esHoy: boolean;
}


interface ProfesionalFiltro {

  id: string;

  nombre: string;
}


// =========================================================
// COMPONENT
// =========================================================

@Component({
  selector: 'app-turnos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './turnos-tabla.component.html',

  styleUrls: [
    './turnos-tabla.component.css'
  ]
})
export class TurnosComponent
  implements OnInit {

  // =======================================================
  // DATOS
  // =======================================================

  turnos: any[] = [];

  turnosFiltrados: any[] = [];


  // =======================================================
  // CARGA
  // =======================================================

  cargando = false;


  // =======================================================
  // VISTA
  // =======================================================

  vistaActual: VistaAgenda =
    'tabla';


  // =======================================================
  // FILTROS
  // =======================================================

  filtroTexto = '';

  filtroEstado = '';

  filtroProfesional = '';


  // =======================================================
  // FECHA
  // =======================================================

  fechaSeleccionada =
    this.obtenerFechaHoy();


  // =======================================================
  // CALENDARIO
  // =======================================================

  diasSemana: DiaSemanaAgenda[] =
    [];


  // =======================================================
  // PROFESIONALES DEL FILTRO
  // =======================================================

  profesionalesFiltro:
    ProfesionalFiltro[] = [];


  // =======================================================
  // CONTEXTO / ROLES
  // =======================================================

  rolActual = '';

  esAdmin = false;

  esSecretaria = false;

  esProfesional = false;

  esProfesionalSolo = false;


  // =======================================================
  // PROFESIONAL ACTUAL
  // =======================================================

  profesionalOrganizacionId:
    string | null = null;


  // =======================================================
  // MODO DE AGENDA
  // =======================================================

  modoAgenda: ModoAgenda =
    'todos';


  // =======================================================
  // CONFIG SWEETALERT
  // =======================================================

  private readonly toastConfig: any = {

    toast: true,

    position: 'top-end',

    showConfirmButton: false,

    timer: 2500,

    timerProgressBar: true,

    background: '#ffffff',

    color: '#1e293b'
  };
 


  // =======================================================
  // CONSTRUCTOR
  // =======================================================

  constructor(

    private turnosService:
      TurnosService,

    private contextoService:
      ContextoService,

    private router:
      Router,

    private route:
      ActivatedRoute
  ) {}


  // =======================================================
  // INIT
  // =======================================================

  ngOnInit(): void {

    this.cargarContexto();

    this.cargarFechaDesdeUrl();

    this.generarSemana();

    this.cargarTurnos();
  }


  // =======================================================
  // CONTEXTO
  // =======================================================

  private cargarContexto(): void {

    this.rolActual =
      (
        this.contextoService
          .getRol() ??
        ''
      )
        .toString()
        .trim()
        .toLowerCase();


    this.esAdmin =
      this.contextoService
        .esAdmin();


    this.esSecretaria =
      this.contextoService
        .esSecretaria();


    this.esProfesional =
      this.contextoService
        .esProfesionalActual();


    this.esProfesionalSolo =
      this.contextoService
        .esProfesionalSolo();


    this.profesionalOrganizacionId =
      this.contextoService
        .getProfesionalOrganizacionId();


    // -----------------------------------------------------
    // PROFESIONAL PURO
    // -----------------------------------------------------
    // Nunca ve la agenda completa de la organización.
    // Su agenda queda fijada automáticamente.
    // -----------------------------------------------------

    if (
      this.esProfesionalSolo &&
      this.profesionalOrganizacionId
    ) {

      this.modoAgenda = 'mia';

      this.filtroProfesional =
        this.profesionalOrganizacionId;

      return;
    }


    // -----------------------------------------------------
    // ADMIN QUE TAMBIÉN ES PROFESIONAL
    // -----------------------------------------------------
    // Empieza viendo todos.
    // Después podrá alternar:
    //
    // Todos los profesionales
    // Mi agenda
    // -----------------------------------------------------

    if (
      this.esAdmin &&
      this.esProfesional &&
      this.profesionalOrganizacionId
    ) {

      this.modoAgenda = 'todos';

      return;
    }


    // -----------------------------------------------------
    // SECRETARIA / ADMIN NORMAL
    // -----------------------------------------------------

    this.modoAgenda = 'todos';
  }


  // =======================================================
  // FECHA DESDE URL
  // =======================================================

  private cargarFechaDesdeUrl(): void {

    const fechaQuery =
      this.route
        .snapshot
        .queryParamMap
        .get('fecha');


    if (
      fechaQuery &&
      this.esFechaValida(fechaQuery)
    ) {

      this.fechaSeleccionada =
        fechaQuery;
    }
  }


  // =======================================================
  // CARGAR TURNOS
  // =======================================================

  cargarTurnos(): void {

    if (
      this.vistaActual ===
      'tabla'
    ) {

      this.cargarDia();

      return;
    }


    this.cargarSemana();
  }


  // =======================================================
  // CARGAR DÍA
  // =======================================================

  private cargarDia(): void {

    this.cargando = true;


    const filtro =
      this.construirFiltroAgenda(
        this.fechaSeleccionada
      );


    this.turnosService
      .obtenerAgenda(filtro)
      .subscribe({

        next: (response: any) => {

        const turnos =
  this.normalizarRespuesta(
    response
  );


this.turnos =
  turnos.map(turno => ({
    ...turno,

    fecha:
      turno?.fecha ??
      this.fechaSeleccionada
  }));

          this.actualizarProfesionalesFiltro();


          this.aplicarFiltros();


          this.cargando = false;
        },


        error: (error) => {

          console.error(
            'Error cargando agenda:',
            error
          );


          this.turnos = [];

          this.turnosFiltrados = [];

          this.profesionalesFiltro = [];


          this.cargando = false;


          Swal.fire({
            ...this.toastConfig,

            icon: 'error',

            title:
              'No se pudo cargar la agenda'
          });
        }
      });
  }


  // =======================================================
  // CARGAR SEMANA
  // =======================================================

private cargarSemana(): void {

  this.cargando = true;

  this.generarSemana();


  const requests =
    this.diasSemana.map(
      dia =>
        this.turnosService
          .obtenerAgenda(
            this.construirFiltroAgenda(
              dia.fecha
            )
          )
    );


  forkJoin(requests)
    .subscribe({

      next: (responses: any[]) => {

        const turnosSemana: any[] = [];


        responses.forEach(
          (response, index) => {

            const fechaDelDia =
              this.diasSemana[index].fecha;


            const turnos =
              this.normalizarRespuesta(
                response
              );


            // =============================================
            // IMPORTANTE
            // =============================================
            // El endpoint agenda no devuelve la fecha
            // dentro de cada turno.
            //
            // Como sabemos qué request pertenece a qué día,
            // se la agregamos acá.
            // =============================================

            const turnosConFecha =
              turnos.map(turno => ({
                ...turno,

                fecha:
                  turno?.fecha ??
                  fechaDelDia
              }));


            turnosSemana.push(
              ...turnosConFecha
            );
          }
        );


        this.turnos =
          this.eliminarDuplicados(
            turnosSemana
          );


        this.actualizarProfesionalesFiltro();


        this.aplicarFiltros();


        this.cargando = false;
      },


      error: (error) => {

        console.error(
          'Error cargando calendario:',
          error
        );


        this.turnos = [];

        this.turnosFiltrados = [];

        this.profesionalesFiltro = [];


        this.cargando = false;


        Swal.fire({
          ...this.toastConfig,

          icon: 'error',

          title:
            'No se pudo cargar el calendario'
        });
      }
    });
}

  // =======================================================
  // CONSTRUIR FILTRO BACKEND
  // =======================================================

  private construirFiltroAgenda(
    fecha: string
  ): any {

    const filtro: any = {

      fecha
    };


    // -----------------------------------------------------
    // PROFESIONAL SOLO
    // -----------------------------------------------------

    if (
      this.esProfesionalSolo &&
      this.profesionalOrganizacionId
    ) {

      filtro.profesionalOrganizacionId =
        this.profesionalOrganizacionId;


      return filtro;
    }


    // -----------------------------------------------------
    // ADMIN + PROFESIONAL EN "MI AGENDA"
    // -----------------------------------------------------

    if (
      this.modoAgenda === 'mia' &&
      this.profesionalOrganizacionId
    ) {

      filtro.profesionalOrganizacionId =
        this.profesionalOrganizacionId;


      return filtro;
    }


    // -----------------------------------------------------
    // SECRETARIA / ADMIN
    // -----------------------------------------------------
    //
    // Si seleccionan un profesional en el filtro,
    // también lo mandamos al backend.
    //
    // Si está vacío:
    // -> obtiene toda la organización.
    // -----------------------------------------------------

    if (
      this.filtroProfesional
    ) {

      filtro.profesionalOrganizacionId =
        this.filtroProfesional;
    }


    return filtro;
  }


  // =======================================================
  // CAMBIO DE MODO DE AGENDA
  // =======================================================

  cambiarModoAgenda(
    modo: ModoAgenda
  ): void {

    // -----------------------------------------------------
    // PROFESIONAL PURO
    // -----------------------------------------------------
    // No permitimos cambiarlo a "todos".
    // -----------------------------------------------------

    if (
      this.esProfesionalSolo
    ) {

      this.modoAgenda =
        'mia';

      return;
    }


    // -----------------------------------------------------
    // MI AGENDA
    // -----------------------------------------------------

    if (
      modo === 'mia'
    ) {

      if (
        !this.esProfesional ||
        !this.profesionalOrganizacionId
      ) {

        return;
      }


      this.modoAgenda =
        'mia';


      this.filtroProfesional =
        this.profesionalOrganizacionId;


      this.cargarTurnos();


      return;
    }


    // -----------------------------------------------------
    // TODOS
    // -----------------------------------------------------

    this.modoAgenda =
      'todos';


    this.filtroProfesional = '';


    this.cargarTurnos();
  }


  // =======================================================
  // CAMBIO DE PROFESIONAL
  // =======================================================

  cambiarProfesional(): void {

    // -----------------------------------------------------
    // PROFESIONAL SOLO
    // -----------------------------------------------------

    if (
      this.esProfesionalSolo
    ) {

      this.filtroProfesional =
        this.profesionalOrganizacionId
        ?? '';

      return;
    }


    // -----------------------------------------------------
    // SI ADMIN PROFESIONAL ELIGE SU PROPIO ID
    // NO NECESARIAMENTE CAMBIAMOS EL MODO A "MIA".
    //
    // "MI AGENDA" es un modo explícito.
    // El selector sigue siendo simplemente un filtro.
    // -----------------------------------------------------

    this.cargarTurnos();
  }


  // =======================================================
  // ¿MOSTRAR FILTRO PROFESIONAL?
  // =======================================================

  puedeFiltrarProfesionales():
    boolean {

    return (
      this.esAdmin ||
      this.esSecretaria
    );
  }


  // =======================================================
  // ¿MOSTRAR CAMBIO TODOS / MI AGENDA?
  // =======================================================

  puedeCambiarModoAgenda():
    boolean {

    return (
      this.esAdmin &&
      this.esProfesional &&
      !!this.profesionalOrganizacionId
    );
  }


  // =======================================================
  // PROFESIONALES PARA SELECT
  // =======================================================

  private actualizarProfesionalesFiltro():
    void {

    // -----------------------------------------------------
    // IMPORTANTE
    // -----------------------------------------------------
    //
    // Esta lista se obtiene de los turnos que devolvió
    // la agenda.
    //
    // Más adelante podemos cambiarla por el endpoint
    // GET /api/ProfesionalOrganizacion para que aparezcan
    // también profesionales que todavía no tienen turnos
    // en el día/semana mostrada.
    //
    // -----------------------------------------------------

    const mapa =
      new Map<
        string,
        ProfesionalFiltro
      >();


    this.turnos
      .forEach(turno => {

        const id =
          this.obtenerProfesionalOrganizacionId(
            turno
          );


        const nombre =
          this.obtenerProfesional(
            turno
          );


        if (
          !id ||
          !nombre
        ) {

          return;
        }


        mapa.set(
          id,
          {
            id,
            nombre
          }
        );
      });


    this.profesionalesFiltro =
      Array
        .from(
          mapa.values()
        )
        .sort(
          (a, b) =>
            a.nombre
              .localeCompare(
                b.nombre,
                'es'
              )
        );
  }


  // =======================================================
  // RESPUESTA API
  // =======================================================

  private normalizarRespuesta(
    response: any
  ): any[] {

    if (
      Array.isArray(response)
    ) {

      return response;
    }


    if (
      Array.isArray(
        response?.data
      )
    ) {

      return response.data;
    }


    if (
      Array.isArray(
        response?.items
      )
    ) {

      return response.items;
    }


    if (
      Array.isArray(
        response?.resultado
      )
    ) {

      return response.resultado;
    }


    return [];
  }


  // =======================================================
  // ELIMINAR DUPLICADOS
  // =======================================================

  private eliminarDuplicados(
    turnos: any[]
  ): any[] {

    const mapa =
      new Map<string, any>();


    turnos
      .forEach(turno => {

        const id =
          turno?.id ??
          turno?.turnoId;


        if (
          id
        ) {

          mapa.set(
            id,
            turno
          );
        }
      });


    return Array
      .from(
        mapa.values()
      );
  }


   // =======================================================
  // FILTROS
  // =======================================================

  aplicarFiltros(): void {

    const busqueda =
      this.filtroTexto
        .trim()
        .toLowerCase();


    const estadoFiltro =
      this.normalizarEstado(
        this.filtroEstado
      );


    this.turnosFiltrados =
      this.turnos
        .filter(turno => {

          // -------------------------------------------------
          // PACIENTE
          // -------------------------------------------------

          const paciente =
            this.obtenerPaciente(turno)
              .toLowerCase();


          // -------------------------------------------------
          // DNI
          // -------------------------------------------------

          const dni =
            (
              turno?.pacienteDni ??
              turno?.dni ??
              ''
            )
              .toString()
              .toLowerCase();


          // -------------------------------------------------
          // PROFESIONAL
          // -------------------------------------------------

          const profesional =
            this.obtenerProfesional(turno)
              .toLowerCase();


          // -------------------------------------------------
          // ESPECIALIDAD
          // -------------------------------------------------

          const especialidad =
            this.obtenerEspecialidad(turno)
              .toLowerCase();


          // -------------------------------------------------
          // SUCURSAL
          // -------------------------------------------------

          const sucursal =
            this.obtenerSucursal(turno)
              .toLowerCase();


          // -------------------------------------------------
          // BÚSQUEDA GENERAL
          // -------------------------------------------------

          const coincideTexto =
            !busqueda ||

            paciente.includes(
              busqueda
            ) ||

            dni.includes(
              busqueda
            ) ||

            profesional.includes(
              busqueda
            ) ||

            especialidad.includes(
              busqueda
            ) ||

            sucursal.includes(
              busqueda
            );


          // -------------------------------------------------
          // ESTADO
          // -------------------------------------------------

          const estado =
            this.normalizarEstado(
              turno?.estado
            );


          const coincideEstado =
            !estadoFiltro ||
            estado === estadoFiltro;


          // -------------------------------------------------
          // PROFESIONAL
          // -------------------------------------------------
          //
          // Aunque normalmente ya filtramos desde backend,
          // también lo validamos acá.
          //
          // Esto evita inconsistencias si algún endpoint
          // devuelve más información de la esperada.
          // -------------------------------------------------
let coincideProfesional =
  true;


if (
  this.filtroProfesional
) {

  const profesionalId =
    this.obtenerProfesionalOrganizacionId(
      turno
    );


  /*
   * Si la API devuelve el ID, hacemos una segunda
   * validación local.
   *
   * Si NO lo devuelve, confiamos en el filtro que
   * ya enviamos al backend.
   */
  coincideProfesional =
    !profesionalId ||
    profesionalId === this.filtroProfesional;
}


          return (
            coincideTexto &&
            coincideEstado &&
            coincideProfesional
          );
        })

        // ---------------------------------------------------
        // ORDEN
        // ---------------------------------------------------

        .sort(
          (a, b) => {

            const fechaA =
              this.obtenerFechaTurno(a);


            const fechaB =
              this.obtenerFechaTurno(b);


            if (
              fechaA !== fechaB
            ) {

              return fechaA.localeCompare(
                fechaB
              );
            }


            return this
              .obtenerHora(a)
              .localeCompare(
                this.obtenerHora(b)
              );
          }
        );
  }


  // =======================================================
  // LIMPIAR FILTROS
  // =======================================================

  limpiarFiltros(): void {

    this.filtroTexto = '';

    this.filtroEstado = '';


    // -----------------------------------------------------
    // PROFESIONAL SOLO
    // -----------------------------------------------------

    if (
      this.esProfesionalSolo
    ) {

      this.filtroProfesional =
        this.profesionalOrganizacionId
        ?? '';
    }


    // -----------------------------------------------------
    // ADMIN + PROFESIONAL EN MI AGENDA
    // -----------------------------------------------------

    else if (
      this.modoAgenda === 'mia'
    ) {

      this.filtroProfesional =
        this.profesionalOrganizacionId
        ?? '';
    }


    // -----------------------------------------------------
    // TODOS
    // -----------------------------------------------------

    else {

      this.filtroProfesional = '';
    }


    this.cargarTurnos();
  }


  // =======================================================
  // CAMBIO DE FILTROS
  // =======================================================

  cambiarFiltroTexto(): void {

    this.aplicarFiltros();
  }


  cambiarFiltroEstado(): void {

    this.aplicarFiltros();
  }


  // =======================================================
  // CAMBIO DE FECHA
  // =======================================================

  cambiarFecha(): void {

    if (
      !this.fechaSeleccionada ||
      !this.esFechaValida(
        this.fechaSeleccionada
      )
    ) {

      return;
    }


    this.generarSemana();


    this.actualizarFechaUrl();


    this.cargarTurnos();
  }


  // =======================================================
  // IR A HOY
  // =======================================================

  irAHoy(): void {

    this.fechaSeleccionada =
      this.obtenerFechaHoy();


    this.generarSemana();


    this.actualizarFechaUrl();


    this.cargarTurnos();
  }


  // =======================================================
  // ACTUALIZAR FECHA EN URL
  // =======================================================

  private actualizarFechaUrl(): void {

    this.router.navigate(
      [],
      {
        relativeTo:
          this.route,

        queryParams: {
          fecha:
            this.fechaSeleccionada
        },

        queryParamsHandling:
          'merge',

        replaceUrl: true
      }
    );
  }


  // =======================================================
  // VISTAS
  // =======================================================

  cambiarVista(
    vista: VistaAgenda
  ): void {

    if (
      this.vistaActual === vista
    ) {

      return;
    }


    this.vistaActual =
      vista;


    this.generarSemana();


    this.cargarTurnos();
  }


  // =======================================================
  // SEMANA ANTERIOR
  // =======================================================

  semanaAnterior(): void {

    const fecha =
      this.parseFechaLocal(
        this.fechaSeleccionada
      );


    fecha.setDate(
      fecha.getDate() - 7
    );


    this.fechaSeleccionada =
      this.formatearFechaApi(
        fecha
      );


    this.generarSemana();


    this.actualizarFechaUrl();


    this.cargarTurnos();
  }


  // =======================================================
  // SEMANA SIGUIENTE
  // =======================================================

  semanaSiguiente(): void {

    const fecha =
      this.parseFechaLocal(
        this.fechaSeleccionada
      );


    fecha.setDate(
      fecha.getDate() + 7
    );


    this.fechaSeleccionada =
      this.formatearFechaApi(
        fecha
      );


    this.generarSemana();


    this.actualizarFechaUrl();


    this.cargarTurnos();
  }


  // =======================================================
  // GENERAR SEMANA
  // =======================================================
  //
  // Siempre genera:
  //
  // 0 -> Lunes
  // 1 -> Martes
  // 2 -> Miércoles
  // 3 -> Jueves
  // 4 -> Viernes
  // 5 -> Sábado
  // 6 -> Domingo
  //
  // =======================================================

  private generarSemana(): void {

    const fechaBase =
      this.parseFechaLocal(
        this.fechaSeleccionada
      );


    const diaActual =
      fechaBase.getDay();


    // -----------------------------------------------------
    // JS:
    //
    // Domingo = 0
    // Lunes   = 1
    // ...
    // Sábado  = 6
    //
    // Convertimos siempre al lunes correspondiente.
    // -----------------------------------------------------

    const diferenciaLunes =
      diaActual === 0
        ? -6
        : 1 - diaActual;


    const lunes =
      new Date(
        fechaBase
      );


    lunes.setDate(
      fechaBase.getDate() +
      diferenciaLunes
    );


    const hoy =
      this.obtenerFechaHoy();


    const nombres = [

      'Lun',

      'Mar',

      'Mié',

      'Jue',

      'Vie',

      'Sáb',

      'Dom'
    ];


    this.diasSemana =
      Array.from(
        {
          length: 7
        },

        (_, index) => {

          const fecha =
            new Date(
              lunes
            );


          fecha.setDate(
            lunes.getDate() +
            index
          );


          const fechaApi =
            this.formatearFechaApi(
              fecha
            );


          return {

            fecha:
              fechaApi,

            nombre:
              nombres[index],

            numero:
              fecha.getDate(),

            mes:
              fecha
                .toLocaleDateString(
                  'es-AR',
                  {
                    month:
                      'short'
                  }
                )
                .replace(
                  '.',
                  ''
                ),

            esHoy:
              fechaApi === hoy
          };
        }
      );
  }


  // =======================================================
  // TURNOS DE UN DÍA
  // =======================================================

obtenerTurnosDia(
  fecha: string
): any[] {

  return this.turnosFiltrados
    .filter(
      turno =>
        this.obtenerFechaTurno(
          turno
        ) === fecha
    )
    .sort(
      (a, b) =>
        this.obtenerHora(a)
          .localeCompare(
            this.obtenerHora(b)
          )
    );
}

  // =======================================================
  // CANTIDAD DE TURNOS DE UN DÍA
  // =======================================================

  obtenerCantidadTurnosDia(
    fecha: string
  ): number {

    return this
      .obtenerTurnosDia(
        fecha
      )
      .length;
  }


  // =======================================================
  // TEXTO RESUMEN DEL DÍA
  // =======================================================

  obtenerResumenDia(
    fecha: string
  ): string {

    const cantidad =
      this.obtenerCantidadTurnosDia(
        fecha
      );


    if (
      cantidad === 0
    ) {

      return 'Sin turnos';
    }


    if (
      cantidad === 1
    ) {

      return '1 turno';
    }


    return `${cantidad} turnos`;
  }


  // =======================================================
  // CANTIDAD DE PROFESIONALES DEL DÍA
  // =======================================================

  obtenerCantidadProfesionalesDia(
    fecha: string
  ): number {

    const profesionales =
      new Set<string>();


    this.obtenerTurnosDia(
      fecha
    )
      .forEach(
        turno => {

          const id =
            this.obtenerProfesionalOrganizacionId(
              turno
            );


          if (
            id
          ) {

            profesionales.add(
              id
            );

            return;
          }


          // -----------------------------------------------
          // FALLBACK
          // -----------------------------------------------
          // Si por algún motivo la API no devuelve el ID,
          // usamos el nombre solamente para el contador.
          // -----------------------------------------------

          const nombre =
            this.obtenerProfesional(
              turno
            );


          if (
            nombre
          ) {

            profesionales.add(
              nombre
            );
          }
        }
      );


    return profesionales.size;
  }


  // =======================================================
  // RESUMEN COMPLETO DEL DÍA
  // =======================================================

  obtenerResumenCompletoDia(
    fecha: string
  ): string {

    const turnos =
      this.obtenerCantidadTurnosDia(
        fecha
      );


    if (
      turnos === 0
    ) {

      return 'Sin turnos';
    }


    // -----------------------------------------------------
    // MI AGENDA / PROFESIONAL SOLO
    // -----------------------------------------------------

    if (
      this.modoAgenda === 'mia' ||
      this.esProfesionalSolo
    ) {

      return turnos === 1
        ? '1 turno'
        : `${turnos} turnos`;
    }


    // -----------------------------------------------------
    // AGENDA GENERAL
    // -----------------------------------------------------

    const profesionales =
      this.obtenerCantidadProfesionalesDia(
        fecha
      );


    if (
      profesionales <= 1
    ) {

      return turnos === 1
        ? '1 turno'
        : `${turnos} turnos`;
    }


    const textoTurnos =
      turnos === 1
        ? '1 turno'
        : `${turnos} turnos`;


    const textoProfesionales =
      profesionales === 1
        ? '1 profesional'
        : `${profesionales} profesionales`;


    return (
      `${textoTurnos} · ` +
      textoProfesionales
    );
  }


  // =======================================================
  // ¿DÍA SELECCIONADO?
  // =======================================================

  esDiaSeleccionado(
    fecha: string
  ): boolean {

    return (
      fecha ===
      this.fechaSeleccionada
    );
  }


  // =======================================================
  // SELECCIONAR DÍA DESDE CALENDARIO
  // =======================================================

  seleccionarDia(
    fecha: string
  ): void {

    if (
      !fecha
    ) {

      return;
    }


    this.fechaSeleccionada =
      fecha;


    this.actualizarFechaUrl();


    // -----------------------------------------------------
    // No recargamos la semana porque ya tenemos los turnos
    // de los siete días cargados.
    // -----------------------------------------------------
  }


  // =======================================================
  // TOTAL DE TURNOS VISIBLES
  // =======================================================

  obtenerTotalTurnosVisibles():
    number {

    return this
      .turnosFiltrados
      .length;
  }


  // =======================================================
  // TOTAL DEL DÍA SELECCIONADO
  // =======================================================

  obtenerTotalDiaSeleccionado():
    number {

    if (
      this.vistaActual ===
      'tabla'
    ) {

      return this
        .turnosFiltrados
        .length;
    }


    return this
      .obtenerCantidadTurnosDia(
        this.fechaSeleccionada
      );
  }


  // =======================================================
  // ¿HAY FILTROS ACTIVOS?
  // =======================================================

  hayFiltrosActivos():
    boolean {

    const tieneTexto =
      !!this.filtroTexto
        .trim();


    const tieneEstado =
      !!this.filtroEstado;


    let tieneProfesional =
      false;


    if (
      !this.esProfesionalSolo &&
      this.modoAgenda ===
        'todos'
    ) {

      tieneProfesional =
        !!this.filtroProfesional;
    }


    return (
      tieneTexto ||
      tieneEstado ||
      tieneProfesional
    );
  }


  // =======================================================
  // NAVEGACIÓN - NUEVO TURNO
  // =======================================================

  nuevoTurno(): void {

    const queryParams: any = {

      fecha:
        this.fechaSeleccionada
    };


    // -----------------------------------------------------
    // PROFESIONAL SOLO
    // -----------------------------------------------------

    if (
      this.esProfesionalSolo &&
      this.profesionalOrganizacionId
    ) {

      queryParams
        .profesionalOrganizacionId =
          this.profesionalOrganizacionId;
    }


    // -----------------------------------------------------
    // MI AGENDA
    // -----------------------------------------------------

    else if (
      this.modoAgenda === 'mia' &&
      this.profesionalOrganizacionId
    ) {

      queryParams
        .profesionalOrganizacionId =
          this.profesionalOrganizacionId;
    }


    // -----------------------------------------------------
    // FILTRO PROFESIONAL ACTIVO
    // -----------------------------------------------------

    else if (
      this.filtroProfesional
    ) {

      queryParams
        .profesionalOrganizacionId =
          this.filtroProfesional;
    }


    this.router.navigate(
      [
        '/dashboard/turnos/nuevo'
      ],
      {
        queryParams
      }
    );
  }


  // =======================================================
  // NAVEGACIÓN - VER TURNO
  // =======================================================

  verDetalle(
    turno: any
  ): void {

    const id =
      this.obtenerId(
        turno
      );


    if (
      !id
    ) {

      return;
    }


    this.router.navigate(
      [
        '/dashboard/turnos',
        id
      ],
      {
        queryParams: {

          fecha:
            this.obtenerFechaTurno(
              turno
            ) ||
            this.fechaSeleccionada
        }
      }
    );
  }


  // =======================================================
  // HELPER PROFESIONAL ORGANIZACIÓN ID
  // =======================================================

  obtenerProfesionalOrganizacionId(
    turno: any
  ): string {

    return (
      turno
        ?.profesionalOrganizacionId ??

      turno
        ?.profesional_organizacion_id ??

      turno
        ?.idProfesionalOrganizacion ??

      turno
        ?.profesionalOrganizacion
        ?.id ??

      ''
    )
      .toString();
  }

  // =======================================================
  // ESTADOS - CONFIRMAR TURNO
  // =======================================================

  confirmarTurno(
    turno: any
  ): void {

    const id =
      this.obtenerId(
        turno
      );


    if (
      !id
    ) {

      return;
    }


    Swal.fire({
      title:
        '¿Confirmar turno?',

      text:
        `Se confirmará el turno de ${this.obtenerPaciente(turno)}.`,

      icon:
        'question',

      showCancelButton:
        true,

      confirmButtonText:
        'Confirmar',

      cancelButtonText:
        'Volver',

      confirmButtonColor:
        '#17483d'
    })
      .then(
        result => {

          if (
            !result.isConfirmed
          ) {

            return;
          }


          this.turnosService
            .confirmarTurno(
              id
            )
            .subscribe({

              next: () => {

                Swal.fire({
                  ...this.toastConfig,

                  icon:
                    'success',

                  title:
                    'Turno confirmado'
                });


                this.cargarTurnos();
              },


              error: error => {

                this.mostrarError(
                  error,
                  'No se pudo confirmar el turno'
                );
              }
            });
        }
      );
  }


  // =======================================================
  // CHECK-IN
  // =======================================================

  checkIn(
    turno: any
  ): void {

    const id =
      this.obtenerId(
        turno
      );


    if (
      !id
    ) {

      return;
    }


    this.turnosService
      .hacerCheckIn(
        id
      )
      .subscribe({

        next: () => {

          Swal.fire({
            ...this.toastConfig,

            icon:
              'success',

            title:
              'Paciente ingresado a sala'
          });


          this.cargarTurnos();
        },


        error: error => {

          this.mostrarError(
            error,
            'No se pudo realizar el check-in'
          );
        }
      });
  }


  // =======================================================
  // INICIAR ATENCIÓN
  // =======================================================

  iniciarAtencion(
    turno: any
  ): void {

    const id =
      this.obtenerId(
        turno
      );


    if (
      !id
    ) {

      return;
    }


    this.turnosService
      .iniciarAtencion(
        id
      )
      .subscribe({

        next: () => {

          Swal.fire({
            ...this.toastConfig,

            icon:
              'success',

            title:
              'Atención iniciada'
          });


          this.cargarTurnos();
        },


        error: error => {

          this.mostrarError(
            error,
            'No se pudo iniciar la atención'
          );
        }
      });
  }


  // =======================================================
  // FINALIZAR ATENCIÓN
  // =======================================================

  finalizarAtencion(
    turno: any
  ): void {

    const id =
      this.obtenerId(
        turno
      );


    if (
      !id
    ) {

      return;
    }


    Swal.fire({
      title:
        '¿Finalizar atención?',

      text:
        `Se marcará como atendido a ${this.obtenerPaciente(turno)}.`,

      icon:
        'question',

      showCancelButton:
        true,

      confirmButtonText:
        'Finalizar',

      cancelButtonText:
        'Volver',

      confirmButtonColor:
        '#16a34a'
    })
      .then(
        result => {

          if (
            !result.isConfirmed
          ) {

            return;
          }


          this.turnosService
            .finalizarAtencion(
              id
            )
            .subscribe({

              next: () => {

                Swal.fire({
                  ...this.toastConfig,

                  icon:
                    'success',

                  title:
                    'Consulta finalizada'
                });


                this.cargarTurnos();
              },


              error: error => {

                this.mostrarError(
                  error,
                  'No se pudo finalizar la atención'
                );
              }
            });
        }
      );
  }


  // =======================================================
  // NO ASISTIÓ
  // =======================================================

  registrarNoAsistio(
    turno: any
  ): void {

    const id =
      this.obtenerId(
        turno
      );


    if (
      !id
    ) {

      return;
    }


    Swal.fire({
      title:
        '¿El paciente no asistió?',

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
      .then(
        result => {

          if (
            !result.isConfirmed
          ) {

            return;
          }


          this.turnosService
            .registrarNoAsistio(
              id
            )
            .subscribe({

              next: () => {

                Swal.fire({
                  ...this.toastConfig,

                  icon:
                    'success',

                  title:
                    'Marcado como no asistió'
                });


                this.cargarTurnos();
              },


              error: error => {

                this.mostrarError(
                  error,
                  'No se pudo actualizar el turno'
                );
              }
            });
        }
      );
  }


  // =======================================================
  // CANCELAR TURNO
  // =======================================================

  cancelarTurno(
    turno: any
  ): void {

    const id =
      this.obtenerId(
        turno
      );


    if (
      !id
    ) {

      return;
    }


    Swal.fire({
      title:
        'Cancelar turno',

      text:
        `¿Querés cancelar el turno de ${this.obtenerPaciente(turno)}?`,

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
        '#dc2626',

      inputValidator: value => {

        if (
          !value?.trim()
        ) {

          return (
            'Ingresá un motivo de cancelación.'
          );
        }


        return null;
      }
    })
      .then(
        result => {

          if (
            !result.isConfirmed
          ) {

            return;
          }


          this.turnosService
            .cancelarTurno(
              id,
              result.value
            )
            .subscribe({

              next: () => {

                Swal.fire({
                  ...this.toastConfig,

                  icon:
                    'success',

                  title:
                    'Turno cancelado'
                });


                this.cargarTurnos();
              },


              error: error => {

                this.mostrarError(
                  error,
                  'No se pudo cancelar el turno'
                );
              }
            });
        }
      );
  }


  // =======================================================
  // ACCIONES SEGÚN ESTADO
  // =======================================================

  puedeConfirmar(
    turno: any
  ): boolean {

    return (
      this.normalizarEstado(
        turno?.estado
      ) ===
      'pendiente'
    );
  }


  puedeCheckIn(
    turno: any
  ): boolean {

    return (
      this.normalizarEstado(
        turno?.estado
      ) ===
      'confirmado'
    );
  }


  puedeIniciar(
    turno: any
  ): boolean {

    const estado =
      this.normalizarEstado(
        turno?.estado
      );


    return (
      estado ===
        'ensala' ||

      estado ===
        'en_sala' ||

      estado ===
        'espera'
    );
  }


  puedeFinalizar(
    turno: any
  ): boolean {

    const estado =
      this.normalizarEstado(
        turno?.estado
      );


    return (
      estado ===
        'enatencion' ||

      estado ===
        'en_atencion'
    );
  }

puedeCancelar(
  turno: any
): boolean {

  const estado =
    this.normalizarEstado(
      turno?.estado
    );

  return [
    'pendiente',
    'confirmado'
  ].includes(
    estado
  );
}
puedeNoAsistio(
  turno: any
): boolean {

  const estado =
    this.normalizarEstado(
      turno?.estado
    );

  return [
    'confirmado',
    'ensala'
  ].includes(
    estado
  );
}


  // =======================================================
  // HELPERS - ID TURNO
  // =======================================================

  obtenerId(
    turno: any
  ): string {

    return (
      turno?.id ??
      turno?.turnoId ??
      ''
    )
      .toString();
  }


  // =======================================================
  // HELPERS - PACIENTE
  // =======================================================

  obtenerPaciente(
    turno: any
  ): string {

    return (
      turno
        ?.pacienteNombre ??

      turno
        ?.nombrePaciente ??

      turno
        ?.paciente ??

      'Paciente'
    )
      .toString();
  }


  // =======================================================
  // HELPERS - PROFESIONAL
  // =======================================================

  obtenerProfesional(
    turno: any
  ): string {

    return (
      turno
        ?.profesionalNombre ??

      turno
        ?.nombreProfesional ??

      turno
        ?.profesional ??

      'Profesional'
    )
      .toString();
  }


  // =======================================================
  // HELPERS - ESPECIALIDAD
  // =======================================================

  obtenerEspecialidad(
    turno: any
  ): string {

    return (
      turno
        ?.especialidadNombre ??

      turno
        ?.especialidad ??

      ''
    )
      .toString();
  }


  // =======================================================
  // HELPERS - SUCURSAL
  // =======================================================

  obtenerSucursal(
    turno: any
  ): string {

    return (
      turno
        ?.sucursalNombre ??

      turno
        ?.sucursal ??

      ''
    )
      .toString();
  }


  // =======================================================
  // HELPERS - FECHA
  // =======================================================

  obtenerFechaTurno(
    turno: any
  ): string {

    return (
      turno
        ?.fecha ??

      ''
    )
      .toString()
      .substring(
        0,
        10
      );
  }


  // =======================================================
  // HELPERS - HORA
  // =======================================================

  obtenerHora(
    turno: any
  ): string {

    const hora =
      turno
        ?.horaInicio ??

      turno
        ?.hora ??

      '';


    if (
      !hora
    ) {

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
  // HELPERS - DNI
  // =======================================================

  obtenerDni(
    turno: any
  ): string {

    return (
      turno
        ?.pacienteDni ??

      turno
        ?.dni ??

      ''
    )
      .toString();
  }


  // =======================================================
  // HELPERS - INICIALES
  // =======================================================

  obtenerIniciales(
    turno: any
  ): string {

    const nombre =
      this.obtenerPaciente(
        turno
      );


    const partes =
      nombre
        .trim()
        .split(
          /\s+/
        )
        .filter(
          Boolean
        );


    if (
      !partes.length
    ) {

      return 'P';
    }


    return partes
      .slice(
        0,
        2
      )
      .map(
        parte =>
          parte.charAt(
            0
          )
      )
      .join(
        ''
      )
      .toUpperCase();
  }


  // =======================================================
  // NORMALIZAR ESTADO
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


    // -----------------------------------------------------
    // ENUM NUMÉRICO
    // -----------------------------------------------------

    if (
      typeof estado ===
      'number'
    ) {

     const mapa: {
  [key: number]: string;
} = {

  1: 'pendiente',

  2: 'confirmado',

  3: 'ensala',

  4: 'enatencion',

  5: 'atendido',

  6: 'cancelado',

  7: 'noasistio'
};

      return (
        mapa[estado] ??
        ''
      );
    }


    // -----------------------------------------------------
    // TEXTO
    // -----------------------------------------------------

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
      );
  }


  // =======================================================
  // TEXTO ESTADO
  // =======================================================

  obtenerTextoEstado(
    estado: any
  ): string {

    const valor =
      this.normalizarEstado(
        estado
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

      en_sala:
        'En sala',

      espera:
        'En sala',

      enatencion:
        'En atención',

      en_atencion:
        'En atención',

      atendido:
        'Atendido',

      cancelado:
        'Cancelado',

      noasistio:
        'No asistió',

      no_asistio:
        'No asistió'
    };


    return (
      mapa[valor] ??
      estado
    );
  }


  // =======================================================
  // CLASE CSS ESTADO
  // =======================================================

  obtenerClaseEstado(
    estado: any
  ): string {

    const valor =
      this.normalizarEstado(
        estado
      );


    if (
      valor ===
      'pendiente'
    ) {

      return (
        'status-pendiente'
      );
    }


    if (
      valor ===
      'confirmado'
    ) {

      return (
        'status-confirmado'
      );
    }


    if (
      valor ===
        'ensala' ||

      valor ===
        'en_sala' ||

      valor ===
        'espera'
    ) {

      return (
        'status-sala'
      );
    }


    if (
      valor ===
        'enatencion' ||

      valor ===
        'en_atencion'
    ) {

      return (
        'status-atencion'
      );
    }


    if (
      valor ===
      'atendido'
    ) {

      return (
        'status-atendido'
      );
    }


    if (
      valor ===
        'noasistio' ||

      valor ===
        'no_asistio'
    ) {

      return (
        'status-no-asistio'
      );
    }


    if (
      valor ===
      'cancelado'
    ) {

      return (
        'status-cancelado'
      );
    }


    return '';
  }


  // =======================================================
  // FECHA VISUAL
  // =======================================================

  formatearFechaVisual(
    fecha: string
  ): string {

    if (
      !fecha
    ) {

      return '-';
    }


    const date =
      this.parseFechaLocal(
        fecha
      );


    return date
      .toLocaleDateString(
        'es-AR',
        {
          day:
            '2-digit',

          month:
            '2-digit',

          year:
            'numeric'
        }
      );
  }


  // =======================================================
  // TÍTULO SEMANA
  // =======================================================

  tituloSemana(): string {

    if (
      !this.diasSemana.length
    ) {

      return '';
    }


    const inicio =
      this.parseFechaLocal(
        this.diasSemana[0]
          .fecha
      );


    const fin =
      this.parseFechaLocal(
        this.diasSemana[6]
          .fecha
      );


    const mesInicio =
      inicio
        .toLocaleDateString(
          'es-AR',
          {
            month:
              'long'
          }
        );


    const mesFin =
      fin
        .toLocaleDateString(
          'es-AR',
          {
            month:
              'long'
          }
        );


    // -----------------------------------------------------
    // MISMO MES
    // -----------------------------------------------------

    if (
      inicio.getMonth() ===
        fin.getMonth() &&

      inicio.getFullYear() ===
        fin.getFullYear()
    ) {

      return (
        `${this.capitalizar(mesInicio)} ` +
        `${inicio.getFullYear()}`
      );
    }


    // -----------------------------------------------------
    // DISTINTO MES - MISMO AÑO
    // -----------------------------------------------------

    if (
      inicio.getFullYear() ===
      fin.getFullYear()
    ) {

      return (
        `${this.capitalizar(mesInicio)} - ` +
        `${this.capitalizar(mesFin)} ` +
        `${fin.getFullYear()}`
      );
    }


    // -----------------------------------------------------
    // DISTINTO AÑO
    // -----------------------------------------------------

    return (
      `${this.capitalizar(mesInicio)} ` +
      `${inicio.getFullYear()} - ` +
      `${this.capitalizar(mesFin)} ` +
      `${fin.getFullYear()}`
    );
  }


  // =======================================================
  // FECHA HOY
  // =======================================================

  private obtenerFechaHoy():
    string {

    return this
      .formatearFechaApi(
        new Date()
      );
  }


  // =======================================================
  // FORMATEAR FECHA PARA API
  // =======================================================

  private formatearFechaApi(
    fecha: Date
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


    return (
      `${year}-${month}-${day}`
    );
  }


  // =======================================================
  // PARSEAR FECHA LOCAL
  // =======================================================

  private parseFechaLocal(
    fecha: string
  ): Date {

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
    );
  }


  // =======================================================
  // VALIDAR FECHA
  // =======================================================

  private esFechaValida(
    fecha: string
  ): boolean {

    if (
      !fecha
    ) {

      return false;
    }


    if (
      !/^\d{4}-\d{2}-\d{2}$/
        .test(
          fecha
        )
    ) {

      return false;
    }


    const date =
      this.parseFechaLocal(
        fecha
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return false;
    }


    return (
      this.formatearFechaApi(
        date
      ) === fecha
    );
  }


  // =======================================================
  // CAPITALIZAR
  // =======================================================

  private capitalizar(
    texto: string
  ): string {

    if (
      !texto
    ) {

      return texto;
    }


    return (
      texto
        .charAt(
          0
        )
        .toUpperCase() +

      texto
        .slice(
          1
        )
    );
  }


  // =======================================================
  // MOSTRAR ERROR
  // =======================================================

  private mostrarError(
    error: any,
    mensajeDefault: string
  ): void {

    const mensaje =
      error
        ?.error
        ?.message ??

      error
        ?.error
        ?.mensaje ??

      error
        ?.error ??

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