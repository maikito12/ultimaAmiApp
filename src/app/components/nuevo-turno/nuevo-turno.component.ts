import {
  Component,
  OnInit
} from '@angular/core';
import {
  CommonModule,
  registerLocaleData
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import Swal from 'sweetalert2';

import localeEsAr
  from '@angular/common/locales/es-AR';

import {
  HorarioProfesional,
  ProfesionalEspecialidad,
  ProfesionalOrganizacionResumen,
  ProfesionalService,
  ProfesionalSucursal
} from '../../services/profesional.service';

import {
  ContextoService,
  OrganizacionContexto
} from '../../services/contexto.service';

import {
  TurnosService
} from '../../services/turno-service.service';
import { Paciente, PacientesService } from '../../services/pacientesd.service';
import { ConfiguracionOrganizacionService, ObraSocial } from '../../services/configuracion-organizacion.service';


type PasoTurno =
  | 'paciente'
  | 'profesional'
  | 'especialidad'
  | 'sucursal'
  | 'fecha'
  | 'confirmacion';

registerLocaleData(
  localeEsAr
);
@Component({
  selector: 'app-nuevo-turno',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './nuevo-turno.component.html',

  styleUrl:
    './nuevo-turno.component.css'
})
export class NuevoTurnoComponent
  implements OnInit {


  // =========================================================
  // PASOS
  // =========================================================

  pasoActual:
    PasoTurno = 'paciente';


  // =========================================================
  // CONTEXTO
  // =========================================================

  contextoActual:
    OrganizacionContexto | null = null;

  esProfesionalSolo = false;

  profesionalActualId:
    string | null = null;


  // =========================================================
  // PACIENTES
  // =========================================================

  pacientes:
    Paciente[] = [];

  pacientesFiltrados:
    Paciente[] = [];

  pacienteSeleccionado:
    Paciente | null = null;

  busquedaPaciente = '';

  cargandoPacientes = false;
modoPaciente:
  'buscar' | 'crear' = 'buscar';

obrasSociales: ObraSocial[] = [];

cargandoObrasSociales = false;
nuevoPaciente = {

  nombre: '',
  apellido: '',
  dni: '',

  email: '',
  telefono: '',

  fecha_nacimiento: '',
  direccion: '',
  sexo: '',

  obra_social_id: null as string | null,
  numero_afiliado: '',

  datos_extra: null

};


guardandoPaciente = false;

  // =========================================================
  // PROFESIONALES
  // =========================================================

  profesionales:
    ProfesionalOrganizacionResumen[] = [];

  profesionalSeleccionado:
    ProfesionalOrganizacionResumen | null = null;

  cargandoProfesionales = false;


  // =========================================================
  // ESPECIALIDADES
  // =========================================================

  especialidades:
    ProfesionalEspecialidad[] = [];

  especialidadSeleccionada:
    ProfesionalEspecialidad | null = null;

  cargandoEspecialidades = false;


  // =========================================================
  // SUCURSALES
  // =========================================================

  sucursales:
    ProfesionalSucursal[] = [];

  sucursalSeleccionada:
    ProfesionalSucursal | null = null;

  cargandoSucursales = false;


 // =========================================================
// FECHA / HORA
// =========================================================

fechaSeleccionada = '';

horaSeleccionada = '';

motivoConsulta = '';

observaciones = '';

horariosProfesional: HorarioProfesional[] = [];

horariosFiltrados: HorarioProfesional[] = [];

cargandoHorarios = false;

horasDisponibles: string[] = [];

mesActual = new Date();

diasCalendario: {
  fecha: string;
  numero: number;
  esMesActual: boolean;
  esHoy: boolean;
  disponible: boolean;
  pasado: boolean;
}[] = [];

  // =========================================================
  // GUARDAR
  // =========================================================

  guardando = false;


  constructor(

  private pacientesService:
    PacientesService,

  private profesionalService:
    ProfesionalService,

  private contextoService:
    ContextoService,

  private configuracionOrganizacionService:
    ConfiguracionOrganizacionService,

  private turnosService:
    TurnosService,

  private router:
    Router

) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.fechaSeleccionada =
      this.obtenerFechaHoy();

    this.cargarContexto();

    this.cargarPacientes();

    this.cargarObrasSociales();
  }


  // =========================================================
  // CONTEXTO
  // =========================================================

  private cargarContexto(): void {

    this.contextoService
      .obtenerOrganizaciones()
      .subscribe({

        next: (
          organizaciones:
            OrganizacionContexto[]
        ) => {

          const actual =
            organizaciones.find(
              x => x.esActual
            );

          if (!actual) {

            console.warn(
              'No se encontró organización activa.'
            );

            return;
          }

          this.contextoActual =
            actual;

          this.profesionalActualId =
            actual
              .profesionalOrganizacionId;

          /*
           * Profesional "puro":
           * rol 2.
           *
           * Si es admin y también profesional,
           * NO salteamos profesional todavía.
           */

          this.esProfesionalSolo =
            actual.rol === 2 &&
            !!actual
              .profesionalOrganizacionId;

        },

        error: (error: any) => {

          console.error(
            'Error obteniendo contexto:',
            error
          );
        }
      });
  }


  // =========================================================
  // PACIENTES
  // =========================================================

  cargarPacientes(): void {

    this.cargandoPacientes =
      true;

    this.pacientesService
      .obtenerPacientes(
        1,
        200
      )
      .subscribe({

        next: (response: any) => {

          const items =
            response?.items ??
            response?.Items ??
            [];

          this.pacientes =
            Array.isArray(items)
              ? items
              : [];

          this.pacientesFiltrados =
            [...this.pacientes];

          this.cargandoPacientes =
            false;
        },

        error: (error: any) => {

          console.error(
            'Error cargando pacientes:',
            error
          );

          this.cargandoPacientes =
            false;

          Swal.fire({
            icon: 'error',
            title:
              'No se pudieron cargar los pacientes'
          });
        }
      });
  }

abrirCrearPaciente(): void {

  this.modoPaciente =
    'crear';


  const busqueda =
    this.busquedaPaciente
      .trim();


  /*
   * Si lo que escribió parece un DNI,
   * lo dejamos precargado.
   */
  if (
    /^\d+$/.test(busqueda)
  ) {

    this.nuevoPaciente.dni =
      busqueda;
  }
}


volverABuscarPaciente(): void {

  this.modoPaciente =
    'buscar';

  this.resetNuevoPaciente();
}


private resetNuevoPaciente(): void {

  this.nuevoPaciente = {

    nombre: '',
    apellido: '',
    dni: '',

    email: '',
    telefono: '',

    fecha_nacimiento: '',
    direccion: '',
    sexo: '',

    obra_social_id: null,
    numero_afiliado: '',

    datos_extra: null

  };
}

crearPacienteYContinuar(): void {

  if (
    !this.nuevoPaciente.nombre.trim()
  ) {

    this.mostrarValidacion(
      'Ingresá el nombre.'
    );

    return;
  }


  if (
    !this.nuevoPaciente.apellido.trim()
  ) {

    this.mostrarValidacion(
      'Ingresá el apellido.'
    );

    return;
  }

if (
  !this.nuevoPaciente
    .obra_social_id
) {

  this.nuevoPaciente
    .numero_afiliado = '';
}

  if (
    !this.nuevoPaciente.dni.trim()
  ) {

    this.mostrarValidacion(
      'Ingresá el DNI.'
    );

    return;
  }


  this.guardandoPaciente =
    true;


  const payload = {

    nombre:
      this.nuevoPaciente.nombre.trim(),

    apellido:
      this.nuevoPaciente.apellido.trim(),

    dni:
      this.nuevoPaciente.dni.trim(),

    email:
      this.normalizarOpcional(
        this.nuevoPaciente.email
      ),

    telefono:
      this.normalizarOpcional(
        this.nuevoPaciente.telefono
      ),

    fecha_nacimiento:
      this.nuevoPaciente
        .fecha_nacimiento ||
      null,

    direccion:
      this.normalizarOpcional(
        this.nuevoPaciente.direccion
      ),

    sexo:
      this.normalizarOpcional(
        this.nuevoPaciente.sexo
      ),

    obra_social_id:
      this.nuevoPaciente
        .obra_social_id,

    numero_afiliado:
      this.normalizarOpcional(
        this.nuevoPaciente
          .numero_afiliado
      ),

    datos_extra:
      null
  };


  this.pacientesService
    .crearPaciente(payload)
    .subscribe({

      next: (
        pacienteCreado
      ) => {

        this.guardandoPaciente =
          false;


        /*
         * Lo usamos directamente
         * para el turno.
         */
        this.pacienteSeleccionado =
          pacienteCreado;


        /*
         * También lo agregamos al listado local.
         */
        this.pacientes.push(
          pacienteCreado
        );

        this.pacientesFiltrados =
          [...this.pacientes];


        this.modoPaciente =
          'buscar';


        this.resetNuevoPaciente();


        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title:
            'Paciente creado',
          showConfirmButton: false,
          timer: 2000
        });


        /*
         * Avanzamos al siguiente paso
         * exactamente igual que si
         * lo hubiéramos seleccionado.
         */
        this.continuarDesdePaciente();
      },


      error: (
        error: any
      ) => {

        this.guardandoPaciente =
          false;


        console.error(
          'Error creando paciente:',
          error
        );


        const mensaje =
          error?.error?.message ??
          error?.error?.title ??
          'No se pudo crear el paciente.';


        Swal.fire({
          icon: 'error',
          title:
            'No se pudo crear el paciente',
          text:
            typeof mensaje === 'string'
              ? mensaje
              : 'No se pudo crear el paciente.',
          confirmButtonColor:
            '#17483d'
        });
      }
    });
}
  buscarPaciente(): void {

    const texto =
      this.busquedaPaciente
        .trim()
        .toLowerCase();

    if (!texto) {

      this.pacientesFiltrados =
        [...this.pacientes];

      return;
    }

    this.pacientesFiltrados =
      this.pacientes.filter(
        paciente => {

          const nombre =
            `${paciente.nombre} ${paciente.apellido}`
              .toLowerCase();

          const dni =
            paciente.dni
              ?.toLowerCase() ??
            '';

          return (
            nombre.includes(texto) ||
            dni.includes(texto)
          );
        }
      );
  }


  seleccionarPaciente(
    paciente: Paciente
  ): void {

    this.pacienteSeleccionado =
      paciente;

    this.continuarDesdePaciente();
  }


  private continuarDesdePaciente():
    void {

    if (
      this.esProfesionalSolo &&
      this.profesionalActualId
    ) {

      this.pasoActual =
        'especialidad';

      this.cargarEspecialidades(
        this.profesionalActualId
      );

      return;
    }

    this.pasoActual =
      'profesional';

    this.cargarProfesionales();
  }


  // =========================================================
  // PROFESIONALES
  // =========================================================

  cargarProfesionales(): void {

    if (
      this.profesionales.length
    ) {
      return;
    }

    this.cargandoProfesionales =
      true;

    this.profesionalService
      .obtenerProfesionalesOrganizacion()
      .subscribe({

        next: (
          profesionales:
            ProfesionalOrganizacionResumen[]
        ) => {

          this.profesionales =
            profesionales.filter(
              x => x.activo
            );

          this.cargandoProfesionales =
            false;
        },

        error: (error: any) => {

          console.error(
            'Error cargando profesionales:',
            error
          );

          this.cargandoProfesionales =
            false;

          Swal.fire({
            icon: 'error',
            title:
              'No se pudieron cargar los profesionales'
          });
        }
      });
  }


  seleccionarProfesional(
    profesional:
      ProfesionalOrganizacionResumen
  ): void {

    this.profesionalSeleccionado =
      profesional;

    this.especialidadSeleccionada =
      null;

    this.sucursalSeleccionada =
      null;

    this.especialidades = [];
    this.sucursales = [];

    this.pasoActual =
      'especialidad';

    this.cargarEspecialidades(
      profesional.id
    );
  }


  // =========================================================
  // ESPECIALIDADES
  // =========================================================

  cargarEspecialidades(
    profesionalOrganizacionId:
      string
  ): void {

    this.cargandoEspecialidades =
      true;

    this.profesionalService
      .obtenerProfesionalEspecialidades(
        profesionalOrganizacionId
      )
      .subscribe({

        next: (
          especialidades:
            ProfesionalEspecialidad[]
        ) => {

          this.especialidades =
            especialidades.filter(
              x => x.activo
            );

          this.cargandoEspecialidades =
            false;


          /*
           * Si tiene una sola especialidad,
           * podemos seleccionarla
           * automáticamente.
           */

          if (
            this.especialidades.length
            === 1
          ) {

            this.seleccionarEspecialidad(
              this.especialidades[0]
            );
          }
        },

        error: (error: any) => {

          console.error(
            'Error cargando especialidades:',
            error
          );

          this.cargandoEspecialidades =
            false;

          Swal.fire({
            icon: 'error',
            title:
              'No se pudieron cargar las especialidades'
          });
        }
      });
  }


  seleccionarEspecialidad(
    especialidad:
      ProfesionalEspecialidad
  ): void {

    this.especialidadSeleccionada =
      especialidad;

    const profesionalId =
      this.obtenerProfesionalId();

    if (!profesionalId) {

      Swal.fire({
        icon: 'error',
        title:
          'No se pudo identificar al profesional'
      });

      return;
    }

    this.pasoActual =
      'sucursal';

    this.cargarSucursales(
      profesionalId
    );
  }


  // =========================================================
  // SUCURSALES
  // =========================================================

  cargarSucursales(
    profesionalOrganizacionId:
      string
  ): void {

    this.cargandoSucursales =
      true;

    this.profesionalService
      .obtenerProfesionalSucursales(
        profesionalOrganizacionId
      )
      .subscribe({

        next: (
          sucursales:
            ProfesionalSucursal[]
        ) => {

          this.sucursales =
            sucursales.filter(
              x => x.activo
            );

          this.cargandoSucursales =
            false;


          if (
            this.sucursales.length
            === 1
          ) {

            this.seleccionarSucursal(
              this.sucursales[0]
            );
          }
        },

        error: (error: any) => {

          console.error(
            'Error cargando sucursales:',
            error
          );

          this.cargandoSucursales =
            false;

          Swal.fire({
            icon: 'error',
            title:
              'No se pudieron cargar las sucursales'
          });
        }
      });
  }




  // =========================================================
  // FECHA / HORA
  // =========================================================

  continuarAConfirmacion():
    void {

    if (
      !this.fechaSeleccionada
    ) {

      this.mostrarValidacion(
        'Seleccioná una fecha.'
      );

      return;
    }

    if (
      !this.horaSeleccionada
    ) {

      this.mostrarValidacion(
        'Seleccioná una hora.'
      );

      return;
    }

    this.pasoActual =
      'confirmacion';
  }


  // =========================================================
  // CREAR TURNO
  // =========================================================

  confirmarTurno(): void {

    if (
      !this.pacienteSeleccionado ||
      !this.especialidadSeleccionada ||
      !this.sucursalSeleccionada
    ) {

      this.mostrarValidacion(
        'Faltan datos para crear el turno.'
      );

      return;
    }

    const profesionalId =
      this.obtenerProfesionalId();

    if (!profesionalId) {

      this.mostrarValidacion(
        'No se pudo identificar al profesional.'
      );

      return;
    }

    this.guardando = true;


    const payload = {

      pacienteId:
        this.pacienteSeleccionado.id,

      profesionalOrganizacionId:
        profesionalId,

      profesionalEspecialidadId:
        this.especialidadSeleccionada.id,

      sucursalId:
        this.sucursalSeleccionada
          .sucursalId,

      fecha:
        this.fechaSeleccionada,

horaInicio:
  this.normalizarHoraApi(
    this.horaSeleccionada
  ),

      motivoConsulta:
        this.normalizarOpcional(
          this.motivoConsulta
        ),

      observaciones:
        this.normalizarOpcional(
          this.observaciones
        ),

      /*
       * OrigenTurno.Recepcion.
       *
       * Si en tu enum Recepcion
       * no es 0 lo ajustamos.
       */
      origen: 0
    };


    this.turnosService
      .crearTurno(payload)
      .subscribe({

        next: () => {

          this.guardando =
            false;

          Swal.fire({
            icon: 'success',
            title:
              'Turno creado',
            text:
              'El turno fue registrado correctamente.',
            confirmButtonColor:
              '#17483d'
          }).then(() => {

            this.router.navigate([
              '/dashboard/turnos'
            ]);

          });
        },

        error: (error: any) => {

          this.guardando =
            false;

          this.mostrarError(
            error
          );
        }
      });
  }
private normalizarHoraApi(
  hora: string
): string {

  if (!hora) {
    return '';
  }

  // input type="time" normalmente devuelve HH:mm
  if (hora.length === 5) {
    return `${hora}:00`;
  }

  return hora;
}


  // =========================================================
  // VOLVER PASO
  // =========================================================
volverPaso(): void {

  switch (this.pasoActual) {

    case 'paciente':
      this.cancelar();
      break;


    case 'profesional':

      this.pasoActual =
        'paciente';

      this.profesionalSeleccionado =
        null;

      this.especialidadSeleccionada =
        null;

      this.sucursalSeleccionada =
        null;

      this.fechaSeleccionada =
        '';

      this.horaSeleccionada =
        '';

      break;


    case 'especialidad':

      if (this.esProfesionalSolo) {

        this.pasoActual =
          'paciente';

      } else {

        this.pasoActual =
          'profesional';
      }

      this.especialidadSeleccionada =
        null;

      this.sucursalSeleccionada =
        null;

      this.fechaSeleccionada =
        '';

      this.horaSeleccionada =
        '';

      break;


    case 'sucursal':

      this.pasoActual =
        'especialidad';

      this.sucursalSeleccionada =
        null;

      this.fechaSeleccionada =
        '';

      this.horaSeleccionada =
        '';

      break;


    case 'fecha':

      this.pasoActual =
        'sucursal';

      this.fechaSeleccionada =
        '';

      this.horaSeleccionada =
        '';

      this.horasDisponibles =
        [];

      break;


    case 'confirmacion':

      this.pasoActual =
        'fecha';

      break;

  }
}



  // =========================================================
  // CANCELAR
  // =========================================================

  cancelar(): void {

    this.router.navigate([
      '/dashboard/turnos'
    ]);
  }


  // =========================================================
  // HELPERS
  // =========================================================

  obtenerProfesionalId():
    string | null {

    if (
      this.esProfesionalSolo
    ) {

      return this
        .profesionalActualId;
    }

    return this
      .profesionalSeleccionado
      ?.id ??
      null;
  }


  obtenerNombreProfesional():
    string {

    if (
      this.profesionalSeleccionado
    ) {

      return this
        .profesionalSeleccionado
        .profesional;
    }

    if (
      this.esProfesionalSolo
    ) {

      return 'Mi agenda';
    }

    return '-';
  }


  obtenerNombrePaciente():
    string {

    if (
      !this.pacienteSeleccionado
    ) {

      return '-';
    }

    return `${this.pacienteSeleccionado.nombre} ${this.pacienteSeleccionado.apellido}`;
  }


  obtenerInicialesPaciente(
    paciente: Paciente
  ): string {

    return (
      `${paciente.nombre
        ?.charAt(0) ?? ''}${
        paciente.apellido
          ?.charAt(0) ?? ''
      }`
    ).toUpperCase();
  }


  pasoCompletado(
    paso: PasoTurno
  ): boolean {

    switch (paso) {

      case 'paciente':
        return !!this
          .pacienteSeleccionado;

      case 'profesional':
        return (
          this.esProfesionalSolo ||
          !!this
            .profesionalSeleccionado
        );

      case 'especialidad':
        return !!this
          .especialidadSeleccionada;

      case 'sucursal':
        return !!this
          .sucursalSeleccionada;

      case 'fecha':
        return (
          !!this.fechaSeleccionada &&
          !!this.horaSeleccionada
        );

      default:
        return false;
    }
  }


  private obtenerFechaHoy():
    string {

    const hoy =
      new Date();

    const year =
      hoy.getFullYear();

    const month =
      String(
        hoy.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        hoy.getDate()
      ).padStart(
        2,
        '0'
      );

    return `${year}-${month}-${day}`;
  }


  private normalizarOpcional(
    valor: string
  ): string | null {

    const texto =
      valor?.trim();

    return texto
      ? texto
      : null;
  }


  private mostrarValidacion(
    mensaje: string
  ): void {

    Swal.fire({
      icon: 'warning',
      title:
        'Revisá los datos',
      text:
        mensaje,
      confirmButtonColor:
        '#17483d'
    });
  }


  private mostrarError(
    error: any
  ): void {

    console.error(
      'Error creando turno:',
      error
    );

    const mensaje =
      error?.error?.message ??
      error?.error?.mensaje ??
      error?.error?.title ??
      (
        typeof error?.error === 'string'
          ? error.error
          : null
      ) ??
      'No se pudo crear el turno.';


    Swal.fire({
      icon: 'error',
      title:
        'No se pudo crear el turno',
      text:
        mensaje,
      confirmButtonColor:
        '#17483d'
    });
  }

  cargarObrasSociales(): void {

  this.cargandoObrasSociales =
    true;

  this.configuracionOrganizacionService
    .obtenerObrasSociales()
    .subscribe({

      next: (response) => {

        this.obrasSociales =
          (response.items ?? [])
            .filter(
              obra => obra.activo
            );

        this.cargandoObrasSociales =
          false;
      },

      error: (error: any) => {

        console.error(
          'Error cargando obras sociales:',
          error
        );

        this.obrasSociales = [];

        this.cargandoObrasSociales =
          false;
      }

    });
}

seleccionarSucursal(
  sucursal: ProfesionalSucursal
): void {

  this.sucursalSeleccionada =
    sucursal;

  this.fechaSeleccionada = '';

  this.horaSeleccionada = '';

  this.horasDisponibles = [];

  this.pasoActual =
    'fecha';

  this.cargarHorariosParaTurno();
}

cargarHorariosParaTurno(): void {

  const profesionalId =
    this.obtenerProfesionalId();

  if (
    !profesionalId ||
    !this.especialidadSeleccionada ||
    !this.sucursalSeleccionada
  ) {

    return;
  }

  this.cargandoHorarios = true;

  this.profesionalService
    .obtenerHorariosProfesional()
    .subscribe({

      next: (
        horarios: HorarioProfesional[]
      ) => {

        this.horariosProfesional =
          horarios ?? [];

        /*
         * Nos quedamos solamente con los
         * horarios que corresponden al turno
         * que estamos armando.
         */
        this.horariosFiltrados =
          this.horariosProfesional.filter(
            horario =>

              horario.profesionalOrganizacionId
                === profesionalId

              &&

              horario.profesionalEspecialidadId
                === this.especialidadSeleccionada!.id

              &&

              horario.sucursalId
                === this.sucursalSeleccionada!.sucursalId
          );

        this.cargandoHorarios =
          false;

        this.mesActual =
          new Date();

        this.generarCalendario();

        if (
          this.horariosFiltrados.length === 0
        ) {

          Swal.fire({
            icon: 'warning',
            title:
              'Sin horarios configurados',
            text:
              'El profesional no tiene horarios configurados para esta especialidad y sucursal.',
            confirmButtonColor:
              '#17483d'
          });
        }
      },

      error: (error: any) => {

        this.cargandoHorarios =
          false;

        console.error(
          'Error cargando horarios:',
          error
        );

        Swal.fire({
          icon: 'error',
          title:
            'No se pudieron cargar los horarios',
          text:
            'No pudimos obtener la agenda configurada del profesional.',
          confirmButtonColor:
            '#17483d'
        });
      }
    });
}

generarCalendario(): void {

  const year =
    this.mesActual.getFullYear();

  const month =
    this.mesActual.getMonth();


  const primerDiaMes =
    new Date(
      year,
      month,
      1
    );


  const ultimoDiaMes =
    new Date(
      year,
      month + 1,
      0
    );


  /*
   * Queremos calendario de lunes a domingo.
   *
   * JS:
   * domingo = 0
   * lunes = 1
   *
   * Convertimos para comenzar el lunes.
   */

  const diaSemanaInicio =
    primerDiaMes.getDay();

  const diasAntes =
    diaSemanaInicio === 0
      ? 6
      : diaSemanaInicio - 1;


  const inicioCalendario =
    new Date(
      year,
      month,
      1 - diasAntes
    );


  const dias: {
    fecha: string;
    numero: number;
    esMesActual: boolean;
    esHoy: boolean;
    disponible: boolean;
    pasado: boolean;
  }[] = [];


  /*
   * 42 posiciones:
   * 6 semanas x 7 días.
   */

  for (
    let i = 0;
    i < 42;
    i++
  ) {

    const fecha =
      new Date(
        inicioCalendario
      );

    fecha.setDate(
      inicioCalendario.getDate()
      + i
    );


    const fechaApi =
      this.formatearFechaApi(
        fecha
      );


    dias.push({

      fecha:
        fechaApi,

      numero:
        fecha.getDate(),

      esMesActual:
        fecha.getMonth()
        === month,

      esHoy:
        fechaApi
        === this.obtenerFechaHoy(),

      pasado:
        this.esFechaPasada(
          fecha
        ),

      disponible:
        this.esDiaDisponible(
          fecha
        )

    });
  }


  this.diasCalendario =
    dias;
}

private esDiaDisponible(
  fecha: Date
): boolean {

  if (
    this.esFechaPasada(fecha)
  ) {

    return false;
  }


  const diaSemana =
    this.convertirDiaSemana(
      fecha
    );


  return this
    .horariosFiltrados
    .some(
      horario =>
        horario.diaSemana
        === diaSemana
    );
}

private convertirDiaSemana(
  fecha: Date
): number {

  /*
   * Base de datos:
   * 1 lunes
   * 2 martes
   * 3 miércoles
   * 4 jueves
   * 5 viernes
   * 6 sábado
   * 7 domingo
   */

  const jsDay =
    fecha.getDay();

  return jsDay === 0
    ? 7
    : jsDay;
}

seleccionarFechaCalendario(
  dia: {
    fecha: string;
    disponible: boolean;
    pasado: boolean;
  }
): void {

  if (
    !dia.disponible ||
    dia.pasado
  ) {

    return;
  }

  this.fechaSeleccionada =
    dia.fecha;

  this.horaSeleccionada = '';

  this.generarHorasDisponibles();
}
generarHorasDisponibles(): void {

  if (
    !this.fechaSeleccionada ||
    !this.especialidadSeleccionada
  ) {

    this.horasDisponibles = [];

    return;
  }


  const fecha =
    this.parseFechaLocal(
      this.fechaSeleccionada
    );


  const diaSemana =
    this.convertirDiaSemana(
      fecha
    );


  const horariosDia =
    this.horariosFiltrados
      .filter(
        horario =>
          horario.diaSemana === diaSemana
      );


  const duracion =
    Number(
      this.especialidadSeleccionada
        .duracionTurno
    );


  if (
    !duracion ||
    duracion <= 0
  ) {

    console.error(
      'Duración de turno inválida:',
      this.especialidadSeleccionada
    );

    this.horasDisponibles = [];

    return;
  }


  // =======================================================
  // 1. GENERAMOS TODOS LOS HORARIOS POSIBLES
  // =======================================================

  const slots: string[] = [];


  horariosDia.forEach(
    horario => {

      const inicio =
        this.horaAMinutos(
          horario.horaInicio
        );


      const fin =
        this.horaAMinutos(
          horario.horaFin
        );


      let actual =
        inicio;


      while (
        actual + duracion <= fin
      ) {

        slots.push(
          this.minutosAHora(
            actual
          )
        );


        actual +=
          duracion;
      }
    }
  );


  const horariosGenerados =
    Array.from(
      new Set(slots)
    )
      .sort();


  // =======================================================
  // 2. SI NO TENEMOS PROFESIONAL, NO PODEMOS VALIDAR OCUPACIÓN
  // =======================================================

  if (
    !this.profesionalActualId
  ) {

    this.horasDisponibles =
      horariosGenerados;

    return;
  }


  // =======================================================
  // 3. CONSULTAMOS TURNOS YA CREADOS PARA ESE DÍA
  // =======================================================

  const filtro = {

    fecha:
      this.fechaSeleccionada,

    profesionalOrganizacionId:
      this.profesionalActualId,
  };


  this.turnosService
    .obtenerAgenda(
      filtro
    )
    .subscribe({

      next: (response: any) => {

        const turnos =
          Array.isArray(response)
            ? response
            : response?.data ?? [];


        // =================================================
        // HORAS YA OCUPADAS
        // =================================================

        const horasOcupadas =
          new Set<string>(
            turnos.map(
              (turno: any) =>
                this.normalizarHora(
                  turno?.horaInicio ??
                  turno?.hora
                )
            )
          );


        // =================================================
        // SACAMOS LOS HORARIOS OCUPADOS
        // =================================================

        this.horasDisponibles =
          horariosGenerados
            .filter(
              hora =>
                !horasOcupadas.has(
                  this.normalizarHora(
                    hora
                  )
                )
            );


        // =================================================
        // SI TENÍA SELECCIONADO UNO QUE AHORA ESTÁ OCUPADO
        // =================================================

        if (
          this.horaSeleccionada &&
          horasOcupadas.has(
            this.normalizarHora(
              this.horaSeleccionada
            )
          )
        ) {

          this.horaSeleccionada = '';
        }


        console.log(
          'HORARIOS GENERADOS:',
          horariosGenerados
        );

        console.log(
          'HORAS OCUPADAS:',
          Array.from(
            horasOcupadas
          )
        );

        console.log(
          'HORARIOS DISPONIBLES:',
          this.horasDisponibles
        );
      },


      error: error => {

        console.error(
          'Error consultando agenda:',
          error
        );


        /*
         * Mejor no mostrar horarios si no pudimos
         * comprobar cuáles están ocupados.
         */
        this.horasDisponibles = [];
      }
    });
}
private normalizarHora(
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

private horaAMinutos(
  hora: string
): number {

  if (!hora) {
    return 0;
  }


  /*
   * Funciona tanto con:
   *
   * 09:00
   * 09:00:00
   */

  const partes =
    hora
      .split(':')
      .map(Number);


  const horas =
    partes[0] ?? 0;

  const minutos =
    partes[1] ?? 0;


  return (
    horas * 60 +
    minutos
  );
}

private minutosAHora(
  minutos: number
): string {

  const hora =
    Math.floor(
      minutos / 60
    );

  const minuto =
    minutos % 60;


  return (
    `${String(hora)
      .padStart(2, '0')}:${
      String(minuto)
        .padStart(2, '0')
    }`
  );
}
private formatearFechaApi(
  fecha: Date
): string {

  const year =
    fecha.getFullYear();

  const month =
    String(
      fecha.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      fecha.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
}


private parseFechaLocal(
  fecha: string
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
    day
  );
}


private esFechaPasada(
  fecha: Date
): boolean {

  const hoy =
    new Date();

  hoy.setHours(
    0,
    0,
    0,
    0
  );


  const comparar =
    new Date(fecha);

  comparar.setHours(
    0,
    0,
    0,
    0
  );


  return comparar < hoy;
}

mesAnterior(): void {

  this.mesActual =
    new Date(
      this.mesActual.getFullYear(),
      this.mesActual.getMonth() - 1,
      1
    );

  this.generarCalendario();
}


mesSiguiente(): void {

  this.mesActual =
    new Date(
      this.mesActual.getFullYear(),
      this.mesActual.getMonth() + 1,
      1
    );

  this.generarCalendario();
}


tituloMes(): string {

  return this.mesActual
    .toLocaleDateString(
      'es-AR',
      {
        month: 'long',
        year: 'numeric'
      }
    );
}

parseFechaLocalPublica(
  fecha: string
): Date {

  return this.parseFechaLocal(
    fecha
  );
}

continuarDesdeFecha(): void {

  if (
    !this.fechaSeleccionada ||
    !this.horaSeleccionada
  ) {

    this.mostrarValidacion(
      'Seleccioná una fecha y un horario.'
    );

    return;
  }

  this.pasoActual =
    'confirmacion';
}
}