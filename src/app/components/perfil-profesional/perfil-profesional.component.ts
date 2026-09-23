import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ProfesionalService,
  MiPerfilProfesional,
  EstadoConfiguracionProfesional,
  ProfesionalEspecialidad,
  ProfesionalSucursal,
  HorarioProfesional,
  ProfesionalObraSocial,
  MiReservaOnline
} from '../../services/profesional.service';

import {
  ConfiguracionOrganizacionService,
  Especialidad,
  HorarioSucursal,
  ObraSocial,
  Sucursal
} from '../../services/configuracion-organizacion.service';
import { ContextoService } from '../../services/contexto.service';
import { AuthService } from '../../services/auth-service.service';

import { DialogoService } from '../../services/dialogo.service';
import { AlertaService } from '../../services/alerta.service';


@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './perfil-profesional.component.html',
  styleUrl: './perfil-profesional.component.css'
})
export class MiPerfilComponent implements OnInit {

  // =====================================================
  // WIZARD
  // =====================================================

  pasoActual = 1;

  totalPasos = 4;

  progreso = 0;


  // =====================================================
  // ESTADOS GENERALES
  // =====================================================

  cargando = true;

  guardando = false;

  convirtiendo = false;

  uniendoseOrganizacion = false;

  esProfesional = false;

guardandoHorario = false;
// =====================================================
// OBRAS SOCIALES
// =====================================================

listaObrasSociales: ObraSocial[] = [];

obrasSocialesSeleccionadas =
  new Set<string>();

cargandoObrasSociales = false;

guardandoObrasSociales = false;

// =====================================================
// RESERVA ONLINE DEL PROFESIONAL
// =====================================================

reservaOnline: MiReservaOnline = {
  aceptaTurnosOnline: false,
  mostrarEnReservaOnline: false
};

cargandoReservaOnline = false;

guardandoReservaOnline = false;

// =====================================================
// MODO DE VISUALIZACIÓN
// =====================================================

// false = muestra el resumen del perfil completo
// true  = muestra nuevamente el wizard para editar
modoEdicion = false;
seccionEditando:
  | 'perfil'
  | 'especialidades'
  | 'sucursales'
  | 'horarios'
  | 'obras-sociales'
  | null = null;

get configuracionCompleta(): boolean {

  return !!(
    this.estado?.perfilCompleto &&
    this.estado?.tieneEspecialidades &&
    this.estado?.tieneSucursales &&
    this.estado?.tieneHorarios
  );

}
  estado: EstadoConfiguracionProfesional | null = null;


  // =====================================================
  // RELACIÓN PROFESIONAL - ORGANIZACIÓN
  // =====================================================

  profesionalOrganizacionId: string | null = null;


  // =====================================================
  // PASO 1 - PERFIL
  // =====================================================

  perfil: MiPerfilProfesional = {

    id: '',

    nombrePublico: '',

    matricula: '',

    fotoUrl: '',

    descripcion: '',

    duracionTurnoDefault: 30,

    perfilCompleto: false

  };


  // =====================================================
  // PASO 2 - ESPECIALIDADES
  // =====================================================

  listaEspecialidades: Especialidad[] = [];

  especialidadesSeleccionadas =
    new Set<string>();

  duracionPorEspecialidad:
    Record<string, number> = {};

  cargandoEspecialidades = false;

// =====================================================
// PASO 3 - SUCURSALES
// =====================================================

listaSucursales: Sucursal[] = [];

sucursalesSeleccionadas =
  new Set<string>();

cargandoSucursales = false;

// =====================================================
// PASO 4 - HORARIOS
// =====================================================

listaHorariosProfesional: HorarioProfesional[] = [];

listaHorariosSucursal: HorarioSucursal[] = [];
especialidadesProfesional: ProfesionalEspecialidad[] = [];
cargandoHorarios = false;



diasSemana = [
  { id: 1, nombre: 'Lunes', corto: 'L', seleccionado: false },
  { id: 2, nombre: 'Martes', corto: 'M', seleccionado: false },
  { id: 3, nombre: 'Miércoles', corto: 'X', seleccionado: false },
  { id: 4, nombre: 'Jueves', corto: 'J', seleccionado: false },
  { id: 5, nombre: 'Viernes', corto: 'V', seleccionado: false },
  { id: 6, nombre: 'Sábado', corto: 'S', seleccionado: false },
  { id: 7, nombre: 'Domingo', corto: 'D', seleccionado: false }
];

nuevoHorarioProfesional = {
  profesionalEspecialidadId: '',
  sucursalId: '',
  horaInicio: '',
  horaFin: ''
};

subiendoFotoProfesional = false;

previewFotoProfesional: string | null = null;
  // =====================================================
  // CONSTRUCTOR
  // =====================================================

constructor(
  private profesionalService: ProfesionalService,
  private configuracionService: ConfiguracionOrganizacionService,
  private contextoService: ContextoService,
  private authService: AuthService,
  private alertaService: AlertaService,
  private dialogoService: DialogoService
) {}


  // =====================================================
  // UNIRME A OTRA ORGANIZACIÓN
  // =====================================================

  async ingresarCodigoInvitacion(): Promise<void> {

    if (this.uniendoseOrganizacion) {
      return;
    }

    const codigo =
      await this.dialogoService
        .entrada({
          titulo:
            'Unirme a una organización',

          mensaje:
            'Ingresá el código que te compartieron desde la clínica, consultorio u organización.',

          label:
            'Código de invitación',

          placeholder:
            'ABCD1234',

          textoConfirmar:
            'Unirme',

          textoCancelar:
            'Cancelar',

          requerido:
            true,

          minLength:
            8,

          inputMode:
            'text'
        });

    if (!codigo) {
      return;
    }

    const codigoNormalizado =
      codigo
        .trim()
        .toUpperCase();

    this.uniendoseOrganizacion =
      true;

    this.authService
      .unirseConInvitacion(
        codigoNormalizado
      )
      .subscribe({

        next: () => {

          this.uniendoseOrganizacion =
            false;

          this.alertaService.success(
            'Te uniste a la organización',
            'La invitación se aplicó correctamente. Estamos actualizando tu contexto.'
          );

          setTimeout(
            () => {
              window.location.reload();
            },
            900
          );
        },

        error: (error) => {

          this.uniendoseOrganizacion =
            false;

          console.error(
            'Error al usar código de invitación:',
            error
          );

          this.alertaService.error(
            'No pudimos usar el código',
            error?.error?.message
            ??
            error?.error?.Message
            ??
            'Revisá que el código sea correcto, esté activo y no haya vencido.'
          );
        }

      });
  }


  // =====================================================
  // INIT
  // =====================================================

ngOnInit(): void {

  this.inicializarPerfil();

}


// =====================================================
// CARGAR RELACIÓN PROFESIONAL - ORGANIZACIÓN
// =====================================================
// =====================================================
// CARGAR RELACIÓN PROFESIONAL - ORGANIZACIÓN ACTIVA
// =====================================================

private cargarProfesionalOrganizacion(): void {

  this.contextoService
    .obtenerOrganizaciones()
    .subscribe({

      next: (organizaciones) => {

        // ==========================================
        // BUSCAR ORGANIZACIÓN ACTUAL DEL JWT
        // ==========================================

        const organizacionActual =
          organizaciones.find(
            x => x.esActual
          );


        if (!organizacionActual) {

          console.warn(
            'No se encontró la organización activa.'
          );

          this.profesionalOrganizacionId =
            null;

          return;
        }


        console.log(
          'Organización activa en Mi Perfil:',
          organizacionActual
        );


        // ==========================================
        // VER SI ES PROFESIONAL EN ESTA ORGANIZACIÓN
        // ==========================================

        if (
          !organizacionActual.esProfesional ||
          !organizacionActual.profesionalOrganizacionId
        ) {

          console.warn(
            'El usuario no tiene perfil profesional en esta organización.'
          );

          this.profesionalOrganizacionId =
            null;

          return;
        }


        // ==========================================
        // USAR LA RELACIÓN CORRECTA
        // ==========================================

        this.profesionalOrganizacionId =
          organizacionActual.profesionalOrganizacionId;


        console.log(
          'ProfesionalOrganizacionId ACTIVO:',
          this.profesionalOrganizacionId
        );


        // ==========================================
        // CARGAR DATOS NECESARIOS
        // ==========================================

        if (
          this.configuracionCompleta &&
          !this.modoEdicion
        ) {

          this.cargarDatosResumen();

          return;
        }


        if (this.pasoActual === 2) {
          this.cargarEspecialidades();
        }


        if (this.pasoActual === 3) {
          this.cargarSucursales();
        }


        if (this.pasoActual === 4) {
          this.cargarHorarios();
        }

      },


      error: (error) => {

        console.error(
          'Error obteniendo el contexto de organización:',
          error
        );

        this.profesionalOrganizacionId =
          null;

      }

    });

}


  // =====================================================
  // INICIALIZAR PERFIL
  // =====================================================

  private inicializarPerfil(): void {

    this.cargando = true;

    this.profesionalService
      .obtenerMiPerfil()
      .subscribe({

      next: (perfil) => {

  this.esProfesional = true;

  this.perfil = perfil;

  // Primero cargamos la relación
  // profesional-organización.
  this.cargarProfesionalOrganizacion();

  // Después cargamos el estado del wizard.
  this.cargarEstadoConfiguracion();

},


        error: (error) => {

          console.log(
            'El usuario todavía no tiene perfil profesional.',
            error
          );

          this.esProfesional = false;

          this.cargando = false;

        }

      });

  }


  // =====================================================
  // CONVERTIRME EN PROFESIONAL
  // =====================================================

  convertirmeEnProfesional(): void {

    if (this.convirtiendo) {
      return;
    }

    this.convirtiendo = true;

    this.profesionalService
      .convertirme()
      .subscribe({

        next: () => {

          this.convirtiendo = false;

          this.esProfesional = true;

          this.pasoActual = 1;

          this.progreso = 0;

          this.alertaService.success(
            'Perfil profesional creado',
            'Ahora completá tus datos profesionales para continuar.'
          );

          this.inicializarPerfil();

        },


        error: (error) => {

          this.convirtiendo = false;

          console.error(
            'Error al convertir usuario en profesional:',
            error
          );

          this.alertaService.error(
            'No pudimos crear el perfil',
            error?.error?.message
            ??
            'Ocurrió un error al crear tu perfil profesional.'
          );

        }

      });

  }


  // =====================================================
  // CARGAR ESTADO CONFIGURACIÓN
  // =====================================================

cargarEstadoConfiguracion(): void {

  this.profesionalService
    .obtenerEstadoConfiguracion()
    .subscribe({

      next: (estado) => {

        this.estado = estado;

        this.progreso =
          estado.porcentaje;

        // ==========================================
        // CONFIGURACIÓN COMPLETA
        // ==========================================

        if (this.configuracionCompleta) {

          // Al entrar normalmente mostramos resumen.
          this.modoEdicion = false;

          // Cargamos toda la información que necesita
          // la ficha/resumen.
          this.cargarDatosResumen();

          this.cargando = false;

          return;
        }


        // ==========================================
        // CONFIGURACIÓN INCOMPLETA
        // ==========================================

        this.modoEdicion = true;

        this.pasoActual =
          this.obtenerPasoActual(estado);

        this.cargando = false;


        // ==========================================
        // CARGAR INFORMACIÓN DEL PASO
        // ==========================================

        if (this.pasoActual === 2) {
          this.cargarEspecialidades();
        }

        if (this.pasoActual === 3) {
          this.cargarSucursales();
        }

        if (this.pasoActual === 4) {
          this.cargarHorarios();
        }

      },


      error: (error) => {

        console.error(
          'Error al obtener estado de configuración:',
          error
        );

        this.cargando = false;

      }

    });

}


// =====================================================
// CARGAR DATOS PARA EL RESUMEN
// =====================================================

cargarDatosResumen(): void {

  if (!this.profesionalOrganizacionId) {

    console.warn(
      'Todavía no tenemos profesionalOrganizacionId para cargar el resumen.'
    );

    return;
  }


  // Carga especialidades seleccionadas
  this.cargarEspecialidades();

  // Carga sucursales seleccionadas
  this.cargarSucursales();

  // Carga horarios y datos relacionados
  this.cargarHorarios();
 // Obras sociales
  this.cargarObrasSociales();

  // Reserva online del profesional
  this.cargarReservaOnline();
}


// =====================================================
// RESERVA ONLINE DEL PROFESIONAL
// =====================================================

cargarReservaOnline(): void {

  if (this.cargandoReservaOnline) {
    return;
  }

  this.cargandoReservaOnline = true;

  this.profesionalService
    .obtenerMiReservaOnline()
    .subscribe({

      next: (configuracion) => {

        this.reservaOnline =
          configuracion;

        this.cargandoReservaOnline =
          false;

      },

      error: (error) => {

        this.cargandoReservaOnline =
          false;

        console.error(
          'Error cargando configuración de reserva online:',
          error
        );

      }

    });

}


actualizarReservaOnline(): void {

  if (
    this.guardandoReservaOnline ||
    this.cargandoReservaOnline
  ) {
    return;
  }

  this.guardandoReservaOnline = true;

  const configuracionAnterior = {
    ...this.reservaOnline
  };

  this.profesionalService
    .actualizarMiReservaOnline({
      aceptaTurnosOnline:
        this.reservaOnline.aceptaTurnosOnline,

      mostrarEnReservaOnline:
        this.reservaOnline.mostrarEnReservaOnline
    })
    .subscribe({

      next: (configuracion) => {

        this.reservaOnline =
          configuracion;

        this.guardandoReservaOnline =
          false;

        this.alertaService.success(
          'Reserva online actualizada'
        );

      },

      error: (error) => {

        this.guardandoReservaOnline =
          false;

        this.reservaOnline =
          configuracionAnterior;

        console.error(
          'Error actualizando reserva online:',
          error
        );

        this.alertaService.error(
          'No pudimos guardar el cambio',
          error?.error?.message
          ??
          'Intentá nuevamente.'
        );

        // Volvemos a consultar el backend para dejar
        // la pantalla sincronizada con el valor real.
        this.cargarReservaOnline();

      }

    });

}


  // =====================================================
  // DETERMINAR PASO ACTUAL
  // =====================================================

  private obtenerPasoActual(
    estado: EstadoConfiguracionProfesional
  ): number {

    if (!estado.perfilCompleto) {
      return 1;
    }

    if (!estado.tieneEspecialidades) {
      return 2;
    }

    if (!estado.tieneSucursales) {
      return 3;
    }

    if (!estado.tieneHorarios) {
      return 4;
    }

    return 4;

  }


  // =====================================================
  // PASO MÁXIMO DESBLOQUEADO
  // =====================================================

  get pasoMaximoDesbloqueado(): number {

    if (!this.estado) {
      return 1;
    }

    if (!this.estado.perfilCompleto) {
      return 1;
    }

    if (!this.estado.tieneEspecialidades) {
      return 2;
    }

    if (!this.estado.tieneSucursales) {
      return 3;
    }

    return 4;

  }


  // =====================================================
  // SABER SI PASO ESTÁ BLOQUEADO
  // =====================================================

  pasoBloqueado(
    paso: number
  ): boolean {

    return paso >
      this.pasoMaximoDesbloqueado;

  }


  // =====================================================
  // SABER SI PASO ESTÁ COMPLETADO
  // =====================================================

  pasoCompletado(
    paso: number
  ): boolean {

    if (!this.estado) {
      return false;
    }

    switch (paso) {

      case 1:
        return this.estado.perfilCompleto;

      case 2:
        return this.estado.tieneEspecialidades;

      case 3:
        return this.estado.tieneSucursales;

      case 4:
        return this.estado.tieneHorarios;

      default:
        return false;

    }

  }


  // =====================================================
  // IR A PASO
  // =====================================================

  irAPaso(
    paso: number
  ): void {

    if (this.pasoBloqueado(paso)) {
      return;
    }

    this.pasoActual = paso;


    // ==========================================
    // CARGAR DATOS DEL PASO
    // ==========================================

   if (paso === 2) {
  this.cargarEspecialidades();
}

if (paso === 3) {
  this.cargarSucursales();
}

if (paso === 4) {
  this.cargarHorarios();
}
  }


  // =====================================================
  // PASO ANTERIOR
  // =====================================================

  pasoAnterior(): void {

    if (this.pasoActual <= 1) {
      return;
    }

    this.pasoActual--;

  }


  // =====================================================
  // SIGUIENTE PASO
  // =====================================================

  siguientePaso(): void {

    switch (this.pasoActual) {

      case 1:

        this.guardarPasoPerfil();

        break;


      case 2:

        this.guardarPasoEspecialidades();

        break;


    case 3:

  this.guardarPasoSucursales();

  break;


      case 4:

  this.guardarHorarioProfesional();

  break;

    }

  }


  // =====================================================
  // PASO 1
  // GUARDAR PERFIL
  // =====================================================

  guardarPasoPerfil(): void {

    if (this.guardando) {
      return;
    }


    // ==========================================
    // NOMBRE
    // ==========================================

    if (
      !this.perfil.nombrePublico ||
      !this.perfil.nombrePublico.trim()
    ) {

      this.alertaService.warning(
        'Falta el nombre profesional',
        'Ingresá el nombre que querés mostrar a tus pacientes.'
      );

      return;

    }


    // ==========================================
    // MATRÍCULA
    // ==========================================

    if (
      !this.perfil.matricula ||
      !this.perfil.matricula.trim()
    ) {

      this.alertaService.warning(
        'Falta la matrícula',
        'Ingresá tu matrícula profesional para continuar.'
      );

      return;

    }


    // ==========================================
    // DESCRIPCIÓN
    // ==========================================

    if (
      !this.perfil.descripcion ||
      !this.perfil.descripcion.trim()
    ) {

      this.alertaService.warning(
        'Falta la descripción',
        'Escribí una breve descripción de tu perfil profesional.'
      );

      return;

    }


    // ==========================================
    // DURACIÓN
    // ==========================================

    if (
      this.perfil.duracionTurnoDefault < 5 ||
      this.perfil.duracionTurnoDefault > 120
    ) {

      this.alertaService.warning(
        'Duración inválida',
        'La duración del turno debe estar entre 5 y 120 minutos.'
      );

      return;

    }


    this.guardando = true;


    // ==========================================
    // ACTUALIZAR
    // ==========================================

    this.profesionalService
      .actualizarMiPerfil({

        nombrePublico:
          this.perfil.nombrePublico.trim(),

        matricula:
          this.perfil.matricula.trim(),

        fotoUrl:
          this.perfil.fotoUrl || null,

        descripcion:
          this.perfil.descripcion.trim(),

        duracionTurnoDefault:
          this.perfil.duracionTurnoDefault

      })
      .subscribe({

        next: (perfilActualizado) => {

          this.perfil =
            perfilActualizado;


          // ======================================
          // REFRESCAR ESTADO
          // ======================================

          this.profesionalService
            .obtenerEstadoConfiguracion()
            .subscribe({

              next: (estado) => {

                this.estado = estado;

                this.progreso =
                  estado.porcentaje;

                this.guardando = false;


             if (estado.perfilCompleto) {

  // ==========================================
  // EDICIÓN DE PERFIL YA CONFIGURADO
  // ==========================================

  if (this.seccionEditando === 'perfil') {

    this.finalizarEdicionSeccion(
      'Perfil actualizado'
    );

    return;
  }


  // ==========================================
  // ONBOARDING INICIAL
  // ==========================================

  this.pasoActual = 2;

  this.cargarEspecialidades();

  this.alertaService.success(
    'Datos guardados',
    'Tu perfil básico está completo. Ahora elegí tu especialidad.'
  );

}

              },


              error: (error) => {

                this.guardando = false;

                console.error(
                  'Error actualizando estado:',
                  error
                );

              }

            });

        },


        error: (error) => {

          this.guardando = false;

          console.error(
            'Error guardando perfil:',
            error
          );

          this.mostrarErrorBackend(
            error,
            'Ocurrió un error al guardar tu perfil.'
          );

        }

      });

  }


  // =====================================================
  // PASO 2
  // CARGAR ESPECIALIDADES DE LA ORGANIZACIÓN
  // =====================================================

  cargarEspecialidades(): void {

    if (this.cargandoEspecialidades) {
      return;
    }


    // Para cargar lo seleccionado necesitamos
    // conocer la relación profesional-organización.

    if (!this.profesionalOrganizacionId) {

      console.warn(
        'No se encontró profesionalOrganizacionId.'
      );

      return;

    }


    this.cargandoEspecialidades = true;


    // Primero obtenemos las especialidades
    // habilitadas por la organización.

    this.configuracionService
      .obtenerEspecialidades()
      .subscribe({

        next: (respuesta) => {

          this.listaEspecialidades =
            respuesta.data?.items ?? [];


          // Después buscamos cuáles de ellas
          // ya tiene seleccionadas el profesional.

          this.cargarEspecialidadesProfesional();

        },


        error: (error) => {

          this.cargandoEspecialidades = false;

          console.error(
            'Error cargando especialidades:',
            error
          );

          this.mostrarErrorBackend(
            error,
            'No pudimos cargar las especialidades disponibles.'
          );

        }

      });

  }


  // =====================================================
  // PASO 2
  // CARGAR ESPECIALIDADES YA SELECCIONADAS
  // =====================================================

  private cargarEspecialidadesProfesional(): void {

    if (!this.profesionalOrganizacionId) {

      this.cargandoEspecialidades = false;

      return;

    }


    this.profesionalService
      .obtenerProfesionalEspecialidades(
        this.profesionalOrganizacionId
      )
      .subscribe({

        next: (especialidades) => {

          this.especialidadesSeleccionadas.clear();

          this.duracionPorEspecialidad = {};


          // ======================================
          // CARGAR SELECCIONADAS
          // ======================================

          especialidades.forEach(
            (item: ProfesionalEspecialidad) => {

              this.especialidadesSeleccionadas
                .add(
                  item.especialidadId
                );

              this.duracionPorEspecialidad[
                item.especialidadId
              ] =
                item.duracionTurno;

            }
          );


          // ======================================
          // DURACIÓN DEFAULT
          // ======================================

          this.listaEspecialidades.forEach(
            (especialidad) => {

              if (
                !this.duracionPorEspecialidad[
                  especialidad.id
                ]
              ) {

                this.duracionPorEspecialidad[
                  especialidad.id
                ] =
                  this.perfil
                    .duracionTurnoDefault || 30;

              }

            }
          );


          this.cargandoEspecialidades = false;

        },


        error: (error) => {

          this.cargandoEspecialidades = false;

          console.error(
            'Error cargando especialidades del profesional:',
            error
          );

          this.mostrarErrorBackend(
            error,
            'No pudimos cargar tus especialidades.'
          );

        }

      });

  }


  // =====================================================
  // PASO 2
  // SABER SI ESTÁ SELECCIONADA
  // =====================================================

  especialidadSeleccionada(
    especialidadId: string
  ): boolean {

    return this.especialidadesSeleccionadas
      .has(especialidadId);

  }


  // =====================================================
  // PASO 2
  // SELECCIONAR / DESELECCIONAR
  // =====================================================

  toggleEspecialidad(
    especialidadId: string
  ): void {

    if (
      this.especialidadesSeleccionadas
        .has(especialidadId)
    ) {

      this.especialidadesSeleccionadas
        .delete(especialidadId);

      return;

    }


    this.especialidadesSeleccionadas
      .add(especialidadId);


    // Si todavía no tiene duración,
    // usamos la duración general del perfil.

    if (
      !this.duracionPorEspecialidad[
        especialidadId
      ]
    ) {

      this.duracionPorEspecialidad[
        especialidadId
      ] =
        this.perfil.duracionTurnoDefault || 30;

    }

  }


  // =====================================================
  // PASO 2
  // GUARDAR ESPECIALIDADES
  // =====================================================

  guardarPasoEspecialidades(): void {

    if (this.guardando) {
      return;
    }


    if (!this.profesionalOrganizacionId) {

      this.alertaService.error(
        'No encontramos la organización',
        'No pudimos determinar en qué organización estás configurando tu perfil.'
      );

      return;

    }


    // ==========================================
    // VALIDAR SELECCIÓN
    // ==========================================

    if (
      this.especialidadesSeleccionadas.size === 0
    ) {

      this.alertaService.warning(
        'Elegí una especialidad',
        'Seleccioná al menos una especialidad para continuar.'
      );

      return;

    }


    // ==========================================
    // ARMAR DTO
    // ==========================================

    const especialidades =
      Array.from(
        this.especialidadesSeleccionadas
      )
      .map((especialidadId) => ({

        especialidadId,

        duracionTurno:
          this.duracionPorEspecialidad[
            especialidadId
          ] ||
          this.perfil.duracionTurnoDefault ||
          30

      }));


    this.guardando = true;


    // ==========================================
    // GUARDAR
    // ==========================================

    this.profesionalService
      .guardarProfesionalEspecialidades({

        profesionalOrganizacionId:
          this.profesionalOrganizacionId,

        especialidades

      })
      .subscribe({

        next: () => {


          // ======================================
          // REFRESCAR ESTADO
          // ======================================

          this.profesionalService
            .obtenerEstadoConfiguracion()
            .subscribe({

              next: (estado) => {

                this.estado = estado;

                this.progreso =
                  estado.porcentaje;

                this.guardando = false;


           if (
  estado.tieneEspecialidades
) {

  // ==========================================
  // EDICIÓN
  // ==========================================

  if (
    this.seccionEditando ===
      'especialidades'
  ) {

    this.finalizarEdicionSeccion(
      'Especialidades actualizadas'
    );

    return;
  }


  // ==========================================
  // ONBOARDING
  // ==========================================

  this.pasoActual = 3;

  this.cargarSucursales();

  this.alertaService.success(
    'Especialidades guardadas',
    'Ahora elegí las sucursales donde vas a atender.'
  );

}

              },


              error: (error) => {

                this.guardando = false;

                console.error(
                  'Error refrescando estado:',
                  error
                );

              }

            });

        },


        error: (error) => {

          this.guardando = false;

          console.error(
            'Error guardando especialidades:',
            error
          );

          this.mostrarErrorBackend(
            error,
            'No pudimos guardar las especialidades.'
          );

        }

      });

  }


  // =====================================================
  // ERROR BACKEND
  // =====================================================

  private mostrarErrorBackend(
    error: any,
    mensajeDefault: string
  ): void {

    const mensaje =
      error?.error?.message ||
      error?.error?.Message ||
      (
        typeof error?.error === 'string'
          ? error.error
          : null
      ) ||
      mensajeDefault;


    this.alertaService.error(
      'Ocurrió un problema',
      mensaje
    );

  }


  // =====================================================
  // FINALIZAR PERFIL
  // =====================================================

 finalizarPerfil(): void {

  if (!this.estado) {
    return;
  }


  if (!this.configuracionCompleta) {

    this.alertaService.warning(
      'Configuración incompleta',
      'Completá todos los pasos antes de finalizar.'
    );

    return;
  }


  this.modoEdicion = false;

  this.cargarDatosResumen();


  this.alertaService.success(
    '¡Perfil completo!',
    'Tu perfil profesional ya está configurado.'
  );

}
duracionPersonalizada: {
  [especialidadId: string]: boolean
} = {};


private readonly duracionesPredefinidas =
  [15, 20, 30, 45, 60, 90, 120];


esDuracionPredefinida(
  especialidadId: string
): boolean {

  return this.duracionesPredefinidas.includes(
    Number(
      this.duracionPorEspecialidad[
        especialidadId
      ]
    )
  );

}


cambiarDuracion(
  especialidadId: string,
  valor: number | string
): void {

  if (valor === 'personalizado') {

    this.duracionPersonalizada[
      especialidadId
    ] = true;

    this.duracionPorEspecialidad[
      especialidadId
    ] = 30;

    return;
  }

  this.duracionPersonalizada[
    especialidadId
  ] = false;

  this.duracionPorEspecialidad[
    especialidadId
  ] = Number(valor);

}
// =====================================================
// PASO 3
// CARGAR SUCURSALES DISPONIBLES
// =====================================================

cargarSucursales(): void {

  if (this.cargandoSucursales) {
    return;
  }

  if (!this.profesionalOrganizacionId) {

    console.warn(
      'No se encontró profesionalOrganizacionId.'
    );

    return;
  }

  this.cargandoSucursales = true;

  this.configuracionService
    .obtenerSucursales()
    .subscribe({

      next: (sucursales) => {

        this.listaSucursales =
          sucursales;

        this.cargarSucursalesProfesional();

      },

      error: (error) => {

        this.cargandoSucursales =
          false;

        this.mostrarErrorBackend(
          error,
          'No pudimos cargar las sucursales disponibles.'
        );

      }

    });

}


// =====================================================
// PASO 3
// CARGAR SUCURSALES YA SELECCIONADAS
// =====================================================

private cargarSucursalesProfesional(): void {

  if (!this.profesionalOrganizacionId) {

    this.cargandoSucursales = false;

    return;
  }

  this.profesionalService
    .obtenerProfesionalSucursales(
      this.profesionalOrganizacionId
    )
    .subscribe({

      next: (sucursales) => {

        this.sucursalesSeleccionadas.clear();

        sucursales.forEach(
          (item: ProfesionalSucursal) => {

            this.sucursalesSeleccionadas.add(
              item.sucursalId
            );

          }
        );

        this.cargandoSucursales =
          false;

      },

      error: (error) => {

        this.cargandoSucursales =
          false;

        this.mostrarErrorBackend(
          error,
          'No pudimos cargar tus sucursales.'
        );

      }

    });

}


// =====================================================
// PASO 3
// SABER SI ESTÁ SELECCIONADA
// =====================================================

sucursalSeleccionada(
  sucursalId: string
): boolean {

  return this.sucursalesSeleccionadas
    .has(sucursalId);

}


// =====================================================
// PASO 3
// SELECCIONAR / DESELECCIONAR
// =====================================================

toggleSucursal(
  sucursalId: string
): void {

  if (
    this.sucursalesSeleccionadas
      .has(sucursalId)
  ) {

    this.sucursalesSeleccionadas
      .delete(sucursalId);

    return;
  }

  this.sucursalesSeleccionadas
    .add(sucursalId);

}


// =====================================================
// PASO 3
// GUARDAR SUCURSALES
// =====================================================

guardarPasoSucursales(): void {

  if (this.guardando) {
    return;
  }

 if (!this.profesionalOrganizacionId) {

  this.alertaService.error(
    'No pudimos continuar',
    'No pudimos identificar la organización.'
  );

  return;
}

  if (
    this.sucursalesSeleccionadas.size === 0
  ) {

    this.alertaService.warning(
      'Elegí una sucursal',
      'Seleccioná al menos un lugar de atención para continuar.'
    );

    return;
  }

  const sucursales =
    Array.from(
      this.sucursalesSeleccionadas
    ).map((sucursalId) => ({

      sucursalId

    }));

  this.guardando = true;

  this.profesionalService
    .guardarProfesionalSucursales({

      profesionalOrganizacionId:
        this.profesionalOrganizacionId,

      sucursales

    })
    .subscribe({

      next: () => {

        this.profesionalService
          .obtenerEstadoConfiguracion()
          .subscribe({

            next: (estado) => {

              this.estado = estado;

              this.progreso =
                estado.porcentaje;

              this.guardando = false;

          if (estado.tieneSucursales) {

  // ==========================================
  // EDICIÓN
  // ==========================================

  if (
    this.seccionEditando ===
      'sucursales'
  ) {

    this.finalizarEdicionSeccion(
      'Lugares de atención actualizados'
    );

    return;
  }


  // ==========================================
  // ONBOARDING
  // ==========================================

  this.pasoActual = 4;

  this.cargarHorarios();

  this.alertaService.success(
    'Sucursales guardadas',
    'Ahora configurá tus horarios de atención.'
  );

}
            },

            error: (error) => {

              this.guardando = false;

              console.error(
                'Error refrescando estado:',
                error
              );

            }

          });

      },

      error: (error) => {

        this.guardando = false;

        this.mostrarErrorBackend(
          error,
          'No pudimos guardar las sucursales.'
        );

      }

    });

}
// =====================================================
// PASO 4
// CARGAR TODO LO NECESARIO
// =====================================================

cargarHorarios(): void {

  if (this.cargandoHorarios) {
    return;
  }

  if (!this.profesionalOrganizacionId) {

    this.mostrarError(
      'No pudimos identificar la organización.'
    );

    return;
  }

  this.cargandoHorarios = true;
// ==========================================
// SUCURSALES DE LA ORGANIZACIÓN
// ==========================================

this.configuracionService
  .obtenerSucursales()
  .subscribe({

    next: (sucursales) => {

      this.listaSucursales = sucursales;

      console.log(
        'Sucursales cargadas para horarios:',
        this.listaSucursales
      );

    },

    error: (error) => {

      console.error(
        'Error cargando sucursales:',
        error
      );

      this.listaSucursales = [];

    }

  });

  // ==========================================
  // 1. ESPECIALIDADES DEL PROFESIONAL
  // ==========================================

  this.profesionalService
    .obtenerProfesionalEspecialidades(
      this.profesionalOrganizacionId
    )
    .subscribe({

      next: (especialidades) => {

        this.especialidadesProfesional =
          especialidades.filter(
            x => x.activo
          );

      },

      error: (error) => {

        console.error(
          'Error cargando especialidades del profesional:',
          error
        );

        this.especialidadesProfesional = [];

      }

    });


  // ==========================================
  // 2. HORARIOS DE APERTURA DE LA ORGANIZACIÓN
  // ==========================================

  this.configuracionService
    .obtenerHorariosSucursal()
    .subscribe({

      next: (horariosSucursal) => {

        this.listaHorariosSucursal =
          horariosSucursal;


        // ======================================
        // 3. HORARIOS DEL PROFESIONAL
        // ======================================

        this.profesionalService
          .obtenerHorariosProfesional()
          .subscribe({

            next: (horariosProfesional) => {

              this.listaHorariosProfesional =
                horariosProfesional;

              this.cargandoHorarios =
                false;

            },

            error: (error) => {

              this.cargandoHorarios =
                false;

              this.mostrarErrorBackend(
                error,
                'No pudimos cargar tus horarios.'
              );

            }

          });

      },

      error: (error) => {

        this.cargandoHorarios =
          false;

        this.mostrarErrorBackend(
          error,
          'No pudimos cargar los horarios de apertura.'
        );

      }

    });

}

eliminandoHorarioId: string | null = null;


eliminarHorarioProfesional(
  horarioId: string
): void {

  if (this.eliminandoHorarioId) {
    return;
  }

  this.dialogoService.confirmar({
    titulo:
      '¿Eliminar horario?',

    mensaje:
      'Este bloque dejará de estar disponible para recibir turnos.',

    textoConfirmar:
      'Sí, eliminar',

    textoCancelar:
      'Cancelar',

    variante:
      'danger'
  })
  .then(resultado => {

    if (!resultado) {
      return;
    }

    this.eliminandoHorarioId =
      horarioId;


    /*
     * Lo sacamos visualmente YA.
     * Guardamos copia por si backend falla.
     */
    const horarioEliminado =
      this.listaHorariosProfesional
        .find(x => x.id === horarioId);

    this.listaHorariosProfesional =
      this.listaHorariosProfesional
        .filter(
          horario =>
            horario.id !== horarioId
        );


    this.profesionalService
      .eliminarHorarioProfesional(
        horarioId
      )
      .subscribe({

        next: () => {

          this.eliminandoHorarioId =
            null;

          this.alertaService.success(
            'Horario eliminado'
          );


          /*
           * IMPORTANTE:
           * NO hacemos cargarHorarios()
           * ni recargamos toda la pantalla.
           *
           * El estado/configuración lo podemos
           * actualizar silenciosamente.
           */
          this.cargarEstadoConfiguracion();
        },

        error: (error: any) => {

          this.eliminandoHorarioId =
            null;


          /*
           * Rollback visual.
           */
          if (horarioEliminado) {

            this.listaHorariosProfesional = [
              ...this.listaHorariosProfesional,
              horarioEliminado
            ].sort(
              (a, b) =>
                a.diaSemana -
                b.diaSemana
            );
          }


          this.mostrarErrorBackend(
            error,
            'No pudimos eliminar el horario.'
          );
        }

      });

  });
}// =====================================================
// PASO 4
// HORARIOS DE APERTURA DE LA SUCURSAL
// =====================================================

horariosAperturaSucursal(
  sucursalId: string
): HorarioSucursal[] {

  return this.listaHorariosSucursal
    .filter(
      x => x.sucursalId === sucursalId
    )
    .sort(
      (a, b) =>
        a.diaSemana - b.diaSemana
    );

}obtenerHorarioAperturaDia(
  sucursalId: string,
  diaSemana: number
): HorarioSucursal | undefined {

  return this.listaHorariosSucursal
    .find(
      x =>
        x.sucursalId === sucursalId &&
        x.diaSemana === diaSemana
    );

}

// =====================================================
// PASO 4
// GUARDAR HORARIO
// =====================================================

guardarHorarioProfesional(): void {

  if (this.guardandoHorario) {
    return;
  }

  if (!this.profesionalOrganizacionId) {

    this.mostrarError(
      'No pudimos identificar la organización.'
    );

    return;
  }

  if (
    !this.nuevoHorarioProfesional.profesionalEspecialidadId ||
    !this.nuevoHorarioProfesional.sucursalId ||
    !this.nuevoHorarioProfesional.horaInicio ||
    !this.nuevoHorarioProfesional.horaFin
  ) {

    this.mostrarError(
      'Completá especialidad, sucursal y horario.'
    );

    return;
  }

  const diasSeleccionados =
    this.diasSemana.filter(
      d => d.seleccionado
    );

  if (diasSeleccionados.length === 0) {

    this.mostrarError(
      'Seleccioná al menos un día.'
    );

    return;
  }

  if (
    this.nuevoHorarioProfesional.horaInicio >=
    this.nuevoHorarioProfesional.horaFin
  ) {

    this.mostrarError(
      'La hora de inicio debe ser anterior a la hora de fin.'
    );

    return;
  }


  // ==========================================
  // VALIDAR CONTRA HORARIO DE APERTURA
  // ==========================================

  for (const dia of diasSeleccionados) {

    const apertura =
      this.obtenerHorarioAperturaDia(
        this.nuevoHorarioProfesional.sucursalId,
        dia.id
      );

    if (!apertura) {

      this.mostrarError(
        `${dia.nombre}: la sucursal no tiene horario de apertura configurado.`
      );

      return;
    }

    const inicio =
      this.normalizarHora(
        this.nuevoHorarioProfesional.horaInicio
      );

    const fin =
      this.normalizarHora(
        this.nuevoHorarioProfesional.horaFin
      );

    if (
      inicio < apertura.horaInicio ||
      fin > apertura.horaFin
    ) {

      this.mostrarError(
        `${dia.nombre}: el horario debe estar entre ${apertura.horaInicio.substring(0, 5)} y ${apertura.horaFin.substring(0, 5)}.`
      );

      return;
    }

  }


  // ==========================================
  // GUARDAR UNO POR DÍA
  // ==========================================

  this.guardandoHorario = true;

  let completados = 0;
  let errores = 0;

  diasSeleccionados.forEach(
    dia => {

      this.profesionalService
        .crearHorarioProfesional({

          profesionalOrganizacionId:
            this.profesionalOrganizacionId!,

          profesionalEspecialidadId:
            this.nuevoHorarioProfesional
              .profesionalEspecialidadId,

          sucursalId:
            this.nuevoHorarioProfesional
              .sucursalId,

          diaSemana:
            dia.id,

          horaInicio:
            this.normalizarHora(
              this.nuevoHorarioProfesional.horaInicio
            ),

          horaFin:
            this.normalizarHora(
              this.nuevoHorarioProfesional.horaFin
            )

        })
        .subscribe({

          next: () => {

            completados++;

            this.verificarFinGuardadoHorarios(
              completados,
              errores,
              diasSeleccionados.length
            );

          },

          error: (error) => {

            console.error(
              'Error guardando horario:',
              error
            );

            completados++;

            errores++;

            this.verificarFinGuardadoHorarios(
              completados,
              errores,
              diasSeleccionados.length
            );

          }

        });

    }
  );

}private verificarFinGuardadoHorarios(
  completados: number,
  errores: number,
  total: number
): void {

  if (completados !== total) {
    return;
  }

  this.guardandoHorario = false;

  this.cargarHorarios();

  if (errores === 0) {

    this.nuevoHorarioProfesional = {
      profesionalEspecialidadId: '',
      sucursalId: '',
      horaInicio: '',
      horaFin: ''
    };

    this.diasSemana.forEach(
      d => d.seleccionado = false
    );

    this.alertaService.success(
      'Horario guardado',
      'Tu disponibilidad quedó configurada.'
    );

    return;
  }

  this.alertaService.warning(
    'Algunos horarios no se guardaron',
    `Hubo ${errores} errores. Revisá los horarios seleccionados.`
  );

}private normalizarHora(
  hora: string
): string {

  return hora.length === 5
    ? `${hora}:00`
    : hora;

}

// =====================================================
// HELPER - MOSTRAR ERROR
// =====================================================

private mostrarError(
  mensaje: string
): void {

  this.alertaService.error(
    'Revisá la información',
    mensaje
  );

}

get horariosAgrupados(): any[] {

  const grupos: {
    [key: string]: {
      sucursalId: string;
      profesionalEspecialidadId: string;
      horarios: HorarioProfesional[];
    }
  } = {};


  this.listaHorariosProfesional
    .forEach(horario => {

      const clave =
        `${horario.sucursalId}_${horario.profesionalEspecialidadId}`;


      if (!grupos[clave]) {

        grupos[clave] = {

          sucursalId:
            horario.sucursalId,

          profesionalEspecialidadId:
            horario.profesionalEspecialidadId,

          horarios: []

        };

      }


      grupos[clave].horarios.push(
        horario
      );

    });


  return Object
    .values(grupos)
    .map(grupo => {

      grupo.horarios.sort(
        (a, b) =>
          a.diaSemana -
          b.diaSemana
      );

      return grupo;

    });

}

obtenerNombreEspecialidadProfesional(
  profesionalEspecialidadId: string
): string {

  return (
    this.especialidadesProfesional
      .find(
        x =>
          x.id ===
          profesionalEspecialidadId
      )
      ?.especialidad
    ||
    'Especialidad'
  );

}

obtenerNombreSucursal(
  sucursalId: string
): string {

  return (
    this.listaSucursales
      .find(
        x => x.id === sucursalId
      )
      ?.nombre
    ||
    'Sucursal'
  );

}

// =====================================================
// EDITAR CONFIGURACIÓN
// =====================================================

editarConfiguracion(): void {

  this.abrirEdicionSeccion('perfil');
}

abrirEdicionSeccion(
  seccion:
    | 'perfil'
    | 'especialidades'
    | 'sucursales'
    | 'horarios'
    | 'obras-sociales'
): void {

  if (!this.configuracionCompleta) {
    return;
  }

  this.seccionEditando = seccion;

  switch (seccion) {

    case 'perfil':
      this.pasoActual = 1;
      break;

    case 'especialidades':
      this.pasoActual = 2;
      this.cargarEspecialidades();
      break;

    case 'sucursales':
      this.pasoActual = 3;
      this.cargarSucursales();
      break;

    case 'horarios':
      this.pasoActual = 4;
      this.cargarHorarios();
      break;

    case 'obras-sociales':
      this.cargarObrasSociales();
      break;
  }
}
// =====================================================
// VOLVER AL RESUMEN
// =====================================================

cancelarEdicion(): void {

  this.seccionEditando = null;

  this.cargarDatosResumen();
}

private finalizarEdicionSeccion(
  mensaje: string
): void {

  this.seccionEditando = null;

  this.cargarDatosResumen();

  this.alertaService.success(
    mensaje
  );
}
// =====================================================
// OBRAS SOCIALES
// CARGAR CATÁLOGO + SELECCIÓN DEL PROFESIONAL
// =====================================================

cargarObrasSociales(): void {

  if (this.cargandoObrasSociales) {
    return;
  }

  if (!this.profesionalOrganizacionId) {

    console.warn(
      'No se encontró profesionalOrganizacionId para cargar obras sociales.'
    );

    return;
  }

  this.cargandoObrasSociales = true;

  // Primero obtenemos todas las obras sociales
  // disponibles de la organización activa.
  this.configuracionService
    .obtenerObrasSociales()
    .subscribe({

      next: (respuesta) => {

        this.listaObrasSociales =
          respuesta.items ?? [];

        // Después obtenemos cuáles acepta
        // actualmente este profesional.
        this.cargarObrasSocialesProfesional();
      },

      error: (error) => {

        this.cargandoObrasSociales = false;

        console.error(
          'Error cargando obras sociales:',
          error
        );

        this.mostrarErrorBackend(
          error,
          'No pudimos cargar las obras sociales disponibles.'
        );
      }

    });
}


// =====================================================
// OBRAS SOCIALES
// CARGAR SELECCIONADAS
// =====================================================

private cargarObrasSocialesProfesional(): void {

  if (!this.profesionalOrganizacionId) {

    this.cargandoObrasSociales = false;

    return;
  }

  this.profesionalService
    .obtenerProfesionalObrasSociales(
      this.profesionalOrganizacionId
    )
    .subscribe({

      next: (
        obrasSociales: ProfesionalObraSocial[]
      ) => {

        this.obrasSocialesSeleccionadas.clear();

        obrasSociales.forEach(
          (obraSocial) => {

            this.obrasSocialesSeleccionadas.add(
              obraSocial.id
            );
          }
        );

        this.cargandoObrasSociales = false;
      },

      error: (error) => {

        this.cargandoObrasSociales = false;

        console.error(
          'Error cargando obras sociales del profesional:',
          error
        );

        this.mostrarErrorBackend(
          error,
          'No pudimos cargar tus obras sociales.'
        );
      }

    });
}


// =====================================================
// OBRAS SOCIALES
// SABER SI ESTÁ SELECCIONADA
// =====================================================

obraSocialSeleccionada(
  obraSocialId: string
): boolean {

  return this.obrasSocialesSeleccionadas
    .has(obraSocialId);
}


// =====================================================
// OBRAS SOCIALES
// SELECCIONAR / DESELECCIONAR
// =====================================================

toggleObraSocial(
  obraSocialId: string
): void {

  if (
    this.obrasSocialesSeleccionadas
      .has(obraSocialId)
  ) {

    this.obrasSocialesSeleccionadas
      .delete(obraSocialId);

    return;
  }

  this.obrasSocialesSeleccionadas
    .add(obraSocialId);
}


// =====================================================
// OBRAS SOCIALES
// GUARDAR
// =====================================================

guardarObrasSociales(): void {

  if (this.guardandoObrasSociales) {
    return;
  }

  if (!this.profesionalOrganizacionId) {

    this.mostrarError(
      'No pudimos identificar la organización.'
    );

    return;
  }

  this.guardandoObrasSociales = true;

  this.profesionalService
    .guardarProfesionalObrasSociales({

      profesionalOrganizacionId:
        this.profesionalOrganizacionId,

      obrasSocialesIds:
        Array.from(
          this.obrasSocialesSeleccionadas
        )

    })
    .subscribe({

   next: () => {

  this.guardandoObrasSociales = false;

  if (
    this.seccionEditando ===
      'obras-sociales'
  ) {

    this.finalizarEdicionSeccion(
      'Obras sociales actualizadas'
    );

    return;
  }

  this.alertaService.success(
    'Obras sociales actualizadas',
    this.obrasSocialesSeleccionadas.size > 0
      ? 'Actualizamos las obras sociales que aceptás.'
      : 'Tu perfil quedó configurado para atención particular.'
  );
},
      error: (error) => {

        this.guardandoObrasSociales = false;

        console.error(
          'Error guardando obras sociales:',
          error
        );

        this.mostrarErrorBackend(
          error,
          'No pudimos actualizar tus obras sociales.'
        );
      }

    });
}

seleccionarFotoProfesional(
  event: Event
): void {

  const input =
    event.target as HTMLInputElement;

  if (
    !input.files ||
    input.files.length === 0
  ) {
    return;
  }

  const archivo =
    input.files[0];

  const reader =
    new FileReader();

  reader.onload = () => {

    this.previewFotoProfesional =
      reader.result as string;
  };

  reader.readAsDataURL(
    archivo
  );

  this.subirFotoProfesional(
    archivo
  );
}

private subirFotoProfesional(
  archivo: File
): void {

  this.subiendoFotoProfesional =
    true;

  this.profesionalService
    .subirFotoProfesional(
      archivo
    )
    .subscribe({

      next: (respuesta) => {

        this.subiendoFotoProfesional =
          false;

        this.previewFotoProfesional =
          respuesta.url;

        this.perfil.fotoUrl =
          respuesta.url;

        this.alertaService.success(
  'Foto subida correctamente'
);
      },

      error: (error) => {

        this.subiendoFotoProfesional =
          false;

        this.previewFotoProfesional =
          this.perfil?.fotoUrl ?? null;

        this.mostrarErrorBackend(
          error,
          'No pudimos subir la foto.'
        );
      }

    });
}

quitarFotoProfesional(): void {

  this.previewFotoProfesional =
    null;

  this.perfil.fotoUrl =
    null;
}
}