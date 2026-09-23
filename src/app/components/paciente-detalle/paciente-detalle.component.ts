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
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { forkJoin } from 'rxjs';

import {
  Paciente,
  PacientesService,
  UpdatePaciente
} from '../../services/pacientesd.service';

import {
  ConsultaMedica,
  ConsultaMedicaArchivo,
  ConsultaManualContexto,
  ConsultasMedicasService,
  CrearConsultaManual,
  GuardarConsultaMedica
} from '../../services/consultas-medicas.service';

import {
  AlertaService
} from '../../services/alerta.service';

import {
  DialogoService
} from '../../services/dialogo.service';


type SeccionPaciente =
  | 'resumen'
  | 'datos'
  | 'historia'
  | 'consultas'
  | 'archivos';


interface ArchivoConConsulta {
  archivo: ConsultaMedicaArchivo;
  consulta: ConsultaMedica;
}


interface FormularioConsulta {
  motivoConsulta: string;

  diagnostico: string;

  tratamiento: string;

  indicaciones: string;

  proximoControl: string;
}


interface DatoClinicoFila {
  clave: string;
  valor: string;
}


interface FormularioPaciente {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  direccion: string;
  sexo: string;
  numero_afiliado: string;
}


@Component({
  selector: 'app-paciente-detalle',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl:
    './paciente-detalle.component.html',

  styleUrl:
    './paciente-detalle.component.css'
})
export class PacienteDetalleComponent
  implements OnInit {

  paciente:
    Paciente | null =
      null;


  cargando =
    true;


  seccionActiva:
    SeccionPaciente =
      'resumen';


  // =========================================================
  // EDICIÓN DEL PACIENTE
  // =========================================================

  editandoPaciente =
    false;


  guardandoPaciente =
    false;


  formularioPaciente:
    FormularioPaciente =
      this.crearFormularioPacienteVacio();


  // =========================================================
  // HISTORIA CLÍNICA
  // =========================================================

  consultas:
    ConsultaMedica[] =
      [];


  cargandoHistoria =
    false;


  errorHistoria =
    false;


  // =========================================================
  // NUEVA EVOLUCIÓN MANUAL
  // =========================================================

  cargandoContextoManual =
    false;


  contextoManual:
    ConsultaManualContexto | null =
      null;


  especialidadManualId =
    '';


  archivosPendientes:
    File[] =
      [];


  modoFormularioConsulta:
    'crear' | 'editar' =
      'crear';


  mostrarFormularioConsulta =
    false;


  consultaEditando:
    ConsultaMedica | null =
      null;


  guardandoConsulta =
    false;


  formularioConsulta:
    FormularioConsulta =
      this.crearFormularioVacio();


  datosClinicosFormulario:
    DatoClinicoFila[] =
      [];


  // =========================================================
  // ARCHIVOS
  // =========================================================

  subiendoArchivoConsultaId:
    string | null =
      null;


  subiendoArchivosPestana =
    false;


  consultaArchivoSeleccionadaId =
    '';


  eliminandoArchivoId:
    string | null =
      null;


  archivoEditandoNombreId:
    string | null =
      null;


  nombreArchivoEditado =
    '';


  guardandoNombreArchivoId:
    string | null =
      null;


  subiendoArchivoDirecto =
    false;


  contextoArchivoDirecto:
    ConsultaManualContexto | null =
      null;


  especialidadArchivoDirectoId =
    '';


  constructor(
    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly pacientesService:
      PacientesService,

    private readonly consultasMedicasService:
      ConsultasMedicasService,

    private readonly alertaService:
      AlertaService,

    private readonly dialogoService:
      DialogoService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const id =
      this.route
        .snapshot
        .paramMap
        .get(
          'id'
        );


    if (!id) {

      this.router.navigate([
        '/dashboard/clientes'
      ]);

      return;
    }


    this.cargarPaciente(
      id
    );
  }


  // =========================================================
  // CARGAR PACIENTE
  // =========================================================

  cargarPaciente(
    id: string
  ): void {

    this.cargando =
      true;


    this.pacientesService
      .obtenerPaciente(
        id
      )
      .subscribe({

        next: (
          paciente: Paciente
        ) => {

          this.paciente =
            paciente;

          this.cargando =
            false;


          this.cargarHistoria(
            paciente.id
          );
        },


        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo paciente:',
            error
          );


          this.cargando =
            false;


          this.alertaService.error(
            'No se pudo cargar el paciente',
            this.obtenerMensajeError(
              error,
              'Ocurrió un error al obtener la ficha.'
            )
          );


          this.volver();
        }
      });
  }


  // =========================================================
  // HISTORIA CLÍNICA
  // =========================================================

  cargarHistoria(
    pacienteId?: string
  ): void {

    const id =
      pacienteId
      ??
      this.paciente?.id;


    if (!id) {
      return;
    }


    this.cargandoHistoria =
      true;

    this.errorHistoria =
      false;


    this.consultasMedicasService
      .obtenerPorPaciente(
        id
      )
      .subscribe({

        next: (
          consultas
        ) => {

          this.consultas =
            [...consultas]
              .sort(
                (
                  a,
                  b
                ) =>
                  new Date(
                    b.fecha
                  )
                    .getTime()
                  -
                  new Date(
                    a.fecha
                  )
                    .getTime()
              );


          if (
            this.consultas.length > 0
            &&
            (
              !this.consultaArchivoSeleccionadaId
              ||
              !this.consultas.some(
                item =>
                  item.id ===
                  this.consultaArchivoSeleccionadaId
              )
            )
          ) {

            this.consultaArchivoSeleccionadaId =
              this.consultas[0].id;
          }


          this.cargandoHistoria =
            false;
        },


        error: (
          error: any
        ) => {

          console.error(
            'Error obteniendo historia clínica:',
            error
          );


          this.consultas =
            [];

          this.cargandoHistoria =
            false;

          this.errorHistoria =
            true;


          this.alertaService.error(
            'No se pudo cargar la historia clínica',
            this.obtenerMensajeError(
              error,
              'Ocurrió un error al obtener las consultas del paciente.'
            )
          );
        }
      });
  }


  reintentarHistoria(): void {

    this.cargarHistoria();
  }


  // =========================================================
  // NAVEGACIÓN INTERNA
  // =========================================================

  cambiarSeccion(
    seccion:
      SeccionPaciente
  ): void {

    this.seccionActiva =
      seccion;
  }


  volver(): void {

    this.router.navigate([
      '/dashboard/clientes'
    ]);
  }


  irATurnos(): void {

    this.router.navigate([
      '/dashboard/turnos'
    ]);
  }


  abrirTurno(
    turnoId:
      string | null | undefined
  ): void {

    if (!turnoId) {

      this.alertaService.info(
        'Evolución manual',
        'Esta evolución fue cargada desde la ficha del paciente y no tiene un turno asociado.'
      );

      return;
    }


    this.router.navigate([
      '/dashboard/turnos',
      turnoId
    ]);
  }


  // =========================================================
  // NUEVA EVOLUCIÓN DESDE LA FICHA
  // =========================================================

  abrirNuevaEvolucion(): void {

    if (
      !this.paciente ||
      this.cargandoContextoManual
    ) {
      return;
    }


    this.cargandoContextoManual =
      true;


    this.consultasMedicasService
      .obtenerContextoManual()
      .subscribe({

        next: (
          contexto
        ) => {

          this.cargandoContextoManual =
            false;


          if (
            !contexto.especialidades ||
            contexto.especialidades.length === 0
          ) {

            this.alertaService.warning(
              'Sin especialidades',
              'Tu perfil profesional no tiene especialidades activas para registrar la evolución.'
            );

            return;
          }


          this.contextoManual =
            contexto;


          this.especialidadManualId =
            contexto.especialidades[0]
              .profesionalEspecialidadId;


          this.formularioConsulta =
            this.crearFormularioVacio();


          this.archivosPendientes =
            [];


          this.consultaEditando =
            null;


          this.modoFormularioConsulta =
            'crear';


          this.datosClinicosFormulario =
            [
              {
                clave: '',
                valor: ''
              }
            ];


          this.mostrarFormularioConsulta =
            true;


          this.irAlFormularioClinico();
        },


        error: (
          error: any
        ) => {

          this.cargandoContextoManual =
            false;


          console.error(
            'Error obteniendo contexto clínico:',
            error
          );


          this.alertaService.error(
            'No se puede registrar la evolución',
            this.obtenerMensajeError(
              error,
              'Tu usuario debe estar vinculado como profesional activo en esta organización.'
            )
          );
        }
      });
  }


  guardarConsulta(): void {

    if (
      this.modoFormularioConsulta ===
      'crear'
    ) {

      this.guardarNuevaEvolucion();

      return;
    }


    this.guardarEdicionConsulta();
  }


  guardarNuevaEvolucion(): void {

    if (
      !this.paciente ||
      !this.contextoManual ||
      this.guardandoConsulta
    ) {
      return;
    }


    if (
      !this.especialidadManualId
    ) {

      this.alertaService.warning(
        'Elegí una especialidad',
        'Seleccioná la especialidad con la que querés registrar esta evolución.'
      );

      return;
    }


    const tieneContenido =
      Boolean(
        this.formularioConsulta
          .motivoConsulta
          .trim()
        ||
        this.formularioConsulta
          .diagnostico
          .trim()
        ||
        this.formularioConsulta
          .tratamiento
          .trim()
        ||
        this.formularioConsulta
          .indicaciones
          .trim()
        ||
        this.formularioConsulta
          .proximoControl
          .trim()
        ||
        this.datosClinicosFormulario
          .some(
            dato =>
              dato.clave.trim()
              ||
              dato.valor.trim()
          )
        ||
        this.archivosPendientes
          .length > 0
      );


    if (!tieneContenido) {

      this.alertaService.warning(
        'Evolución vacía',
        'Cargá al menos una nota clínica, un próximo control o un archivo.'
      );

      return;
    }


    const datosConsulta =
      this.construirDatosConsulta();


    const tieneDatoSinClave =
      this.datosClinicosFormulario
        .some(
          dato =>
            !dato.clave.trim()
            &&
            Boolean(
              dato.valor.trim()
            )
        );


    if (
      tieneDatoSinClave
    ) {
      return;
    }


    const payload:
      CrearConsultaManual =
    {
      pacienteId:
        this.paciente.id,

      profesionalEspecialidadId:
        this.especialidadManualId,

      motivoConsulta:
        this.normalizarTexto(
          this.formularioConsulta
            .motivoConsulta
        ),

      diagnostico:
        this.normalizarTexto(
          this.formularioConsulta
            .diagnostico
        ),

      tratamiento:
        this.normalizarTexto(
          this.formularioConsulta
            .tratamiento
        ),

      indicaciones:
        this.normalizarTexto(
          this.formularioConsulta
            .indicaciones
        ),

      proximoControl:
        this.formularioConsulta
          .proximoControl
          ?.trim()
        ||
        null,

      datosConsulta:
        datosConsulta
    };


    const archivos =
      [...this.archivosPendientes];


    this.guardandoConsulta =
      true;


    this.consultasMedicasService
      .crearManual(
        payload
      )
      .subscribe({

        next: (
          nueva
        ) => {

          if (
            archivos.length === 0
          ) {

            this.finalizarNuevaEvolucion(
              nueva
            );

            return;
          }


          forkJoin(
            archivos.map(
              archivo =>
                this.consultasMedicasService
                  .subirArchivo(
                    nueva.id,
                    archivo
                  )
            )
          )
            .subscribe({

              next: (
                archivosGuardados
              ) => {

                nueva.archivos =
                  archivosGuardados;


                this.finalizarNuevaEvolucion(
                  nueva
                );
              },


              error: (
                error: any
              ) => {

                console.error(
                  'La evolución se guardó pero falló algún archivo:',
                  error
                );


                this.guardandoConsulta =
                  false;


                this.cerrarFormularioConsulta();


                this.cargarHistoria();


                this.alertaService.warning(
                  'Evolución guardada',
                  'La evolución se creó, pero uno o más archivos no pudieron subirse. Podés adjuntarlos desde la historia clínica.'
                );
              }
            });
        },


        error: (
          error: any
        ) => {

          this.guardandoConsulta =
            false;


          console.error(
            'Error creando evolución manual:',
            error
          );


          this.alertaService.error(
            'No se pudo guardar la evolución',
            this.obtenerMensajeError(
              error,
              'Revisá los datos e intentá nuevamente.'
            )
          );
        }
      });
  }


  seleccionarArchivosNuevaEvolucion(
    event: Event
  ): void {

    const input =
      event.target;


    if (!(input instanceof HTMLInputElement)) {
      return;
    }


    const archivos =
      Array.from(
        input.files
        ??
        []
      );


    input.value =
      '';


    for (
      const archivo of archivos
    ) {

      const error =
        this.validarArchivoClinico(
          archivo
        );


      if (error) {

        this.alertaService.warning(
          'Archivo no permitido',
          `${archivo.name}: ${error}`
        );

        continue;
      }


      const repetido =
        this.archivosPendientes
          .some(
            actual =>
              actual.name ===
                archivo.name
              &&
              actual.size ===
                archivo.size
          );


      if (!repetido) {

        this.archivosPendientes =
          [
            ...this.archivosPendientes,
            archivo
          ];
      }
    }
  }


  quitarArchivoPendiente(
    index: number
  ): void {

    this.archivosPendientes =
      this.archivosPendientes
        .filter(
          (
            _archivo,
            indice
          ) =>
            indice !==
            index
        );
  }


  formatearPesoArchivo(
    bytes: number
  ): string {

    if (
      bytes < 1024 * 1024
    ) {

      return `${Math.max(
        1,
        Math.round(
          bytes / 1024
        )
      )} KB`;
    }


    return `${
      (
        bytes /
        (
          1024 * 1024
        )
      )
        .toFixed(
          1
        )
    } MB`;
  }


  private finalizarNuevaEvolucion(
    nueva:
      ConsultaMedica
  ): void {

    this.consultas =
      [
        nueva,
        ...this.consultas
      ]
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              b.fecha
            )
              .getTime()
            -
            new Date(
              a.fecha
            )
              .getTime()
        );


    this.guardandoConsulta =
      false;


    this.cerrarFormularioConsulta();


    this.seccionActiva =
      'historia';


    this.alertaService.success(
      'Evolución guardada',
      'La nueva evolución ya forma parte de la historia clínica del paciente.'
    );
  }


  // =========================================================
  // DATOS CLÍNICOS PERSONALIZADOS
  // =========================================================

  agregarDatoClinico(): void {

    this.datosClinicosFormulario =
      [
        ...this.datosClinicosFormulario,
        {
          clave: '',
          valor: ''
        }
      ];
  }


  eliminarDatoClinico(
    index: number
  ): void {

    this.datosClinicosFormulario =
      this.datosClinicosFormulario
        .filter(
          (
            _dato,
            indice
          ) =>
            indice !==
            index
        );


    if (
      this.datosClinicosFormulario.length === 0
    ) {

      this.datosClinicosFormulario =
        [
          {
            clave: '',
            valor: ''
          }
        ];
    }
  }


  obtenerDatosClinicos(
    consulta: ConsultaMedica
  ): DatoClinicoFila[] {

    return this.convertirDatosConsultaAFilas(
      consulta.datosConsulta
    )
      .filter(
        dato =>
          dato.clave.trim()
          ||
          dato.valor.trim()
      );
  }


  private construirDatosConsulta():
    Record<string, string> | null {

    const resultado:
      Record<string, string> =
        {};


    for (
      const dato of
      this.datosClinicosFormulario
    ) {

      const clave =
        dato.clave
          .trim();


      const valor =
        dato.valor
          .trim();


      if (
        !clave
        &&
        !valor
      ) {
        continue;
      }


      if (!clave) {

        this.alertaService.warning(
          'Dato clínico incompleto',
          'Cada valor personalizado necesita un nombre, por ejemplo "Alergias", "Peso" o "Presión arterial".'
        );

        return null;
      }


      resultado[clave] =
        valor;
    }


    return Object.keys(
      resultado
    ).length > 0
      ? resultado
      : null;
  }


  private convertirDatosConsultaAFilas(
    datos:
      Record<string, any> | null | undefined
  ): DatoClinicoFila[] {

    if (!datos) {
      return [];
    }


    return Object.entries(
      datos
    )
      .map(
        (
          [
            clave,
            valor
          ]
        ) => ({
          clave:
            String(
              clave
            ),

          valor:
            typeof valor ===
            'string'
              ? valor
              : JSON.stringify(
                  valor
                )
        })
      );
  }


  private irAlFormularioClinico(): void {

    setTimeout(
      () => {

        document
          .getElementById(
            'formulario-clinico-inline'
          )
          ?.scrollIntoView({
            behavior:
              'smooth',

            block:
              'start'
          });
      },
      0
    );
  }


  // =========================================================
  // EDITAR PACIENTE
  // =========================================================

  editarPaciente(): void {

    if (
      !this.paciente
      ||
      this.guardandoPaciente
    ) {
      return;
    }


    this.seccionActiva =
      'datos';


    this.formularioPaciente = {

      nombre:
        this.paciente.nombre
        ??
        '',

      apellido:
        this.paciente.apellido
        ??
        '',

      dni:
        this.paciente.dni
        ??
        '',

      email:
        this.paciente.email
        ??
        '',

      telefono:
        this.paciente.telefono
        ??
        '',

      fecha_nacimiento:
        this.paciente.fecha_nacimiento
        ??
        '',

      direccion:
        this.paciente.direccion
        ??
        '',

      sexo:
        this.paciente.sexo
        ??
        '',

      numero_afiliado:
        this.paciente.numero_afiliado
        ??
        ''
    };


    this.editandoPaciente =
      true;


    setTimeout(
      () => {

        document
          .getElementById(
            'formulario-edicion-paciente'
          )
          ?.scrollIntoView({
            behavior:
              'smooth',

            block:
              'start'
          });
      },
      0
    );
  }


  cancelarEdicionPaciente(): void {

    if (
      this.guardandoPaciente
    ) {
      return;
    }


    this.editandoPaciente =
      false;


    this.formularioPaciente =
      this.crearFormularioPacienteVacio();
  }


  guardarPaciente(): void {

    if (
      !this.paciente
      ||
      this.guardandoPaciente
    ) {
      return;
    }


    const nombre =
      this.formularioPaciente
        .nombre
        .trim();


    const apellido =
      this.formularioPaciente
        .apellido
        .trim();


    const dni =
      this.formularioPaciente
        .dni
        .trim();


    if (
      !nombre
      ||
      !apellido
      ||
      !dni
    ) {

      this.alertaService.warning(
        'Faltan datos obligatorios',
        'Nombre, apellido y DNI son obligatorios.'
      );

      return;
    }


    const payload:
      UpdatePaciente =
    {
      nombre:
        nombre,

      apellido:
        apellido,

      dni:
        dni,

      email:
        this.normalizarTexto(
          this.formularioPaciente
            .email
        ),

      telefono:
        this.normalizarTexto(
          this.formularioPaciente
            .telefono
        ),

      fecha_nacimiento:
        this.formularioPaciente
          .fecha_nacimiento
          .trim()
        ||
        null,

      direccion:
        this.normalizarTexto(
          this.formularioPaciente
            .direccion
        ),

      sexo:
        this.normalizarTexto(
          this.formularioPaciente
            .sexo
        ),

      obra_social_id:
        this.paciente
          .obra_social_id
        ??
        null,

      numero_afiliado:
        this.normalizarTexto(
          this.formularioPaciente
            .numero_afiliado
        ),

      activo:
        this.paciente.activo
    };


    this.guardandoPaciente =
      true;


    this.pacientesService
      .actualizarPaciente(
        this.paciente.id,
        payload
      )
      .subscribe({

        next: (
          pacienteActualizado
        ) => {

          this.paciente =
            pacienteActualizado;


          this.guardandoPaciente =
            false;


          this.editandoPaciente =
            false;


          this.formularioPaciente =
            this.crearFormularioPacienteVacio();


          this.alertaService.success(
            'Paciente actualizado',
            'Los datos personales se guardaron correctamente.'
          );
        },


        error: (
          error: any
        ) => {

          console.error(
            'Error actualizando paciente:',
            error
          );


          this.guardandoPaciente =
            false;


          this.alertaService.error(
            'No se pudo actualizar el paciente',
            this.obtenerMensajeError(
              error,
              'Revisá los datos e intentá nuevamente.'
            )
          );
        }
      });
  }


  // =========================================================
  // EDITAR CONSULTA
  // =========================================================

  editarConsulta(
    consulta:
      ConsultaMedica
  ): void {

    this.modoFormularioConsulta =
      'editar';


    this.contextoManual =
      null;


    this.especialidadManualId =
      consulta.profesionalEspecialidadId;


    this.archivosPendientes =
      [];


    this.consultaEditando =
      consulta;


    this.formularioConsulta = {

      motivoConsulta:
        consulta
          .motivoConsulta
        ??
        '',

      diagnostico:
        consulta
          .diagnostico
        ??
        '',

      tratamiento:
        consulta
          .tratamiento
        ??
        '',

      indicaciones:
        consulta
          .indicaciones
        ??
        '',

      proximoControl:
        consulta
          .proximoControl
        ??
        ''
    };


    this.datosClinicosFormulario =
      this.convertirDatosConsultaAFilas(
        consulta.datosConsulta
      );


    this.mostrarFormularioConsulta =
      true;


    this.seccionActiva =
      'historia';


    this.irAlFormularioClinico();
  }


  cerrarFormularioConsulta(): void {

    if (
      this.guardandoConsulta
    ) {
      return;
    }


    this.mostrarFormularioConsulta =
      false;


    this.consultaEditando =
      null;


    this.contextoManual =
      null;


    this.especialidadManualId =
      '';


    this.archivosPendientes =
      [];


    this.datosClinicosFormulario =
      [];


    this.modoFormularioConsulta =
      'crear';


    this.formularioConsulta =
      this.crearFormularioVacio();
  }


  guardarEdicionConsulta(): void {

    const consulta =
      this.consultaEditando;


    if (
      !consulta
      ||
      this.guardandoConsulta
    ) {
      return;
    }


    const datosConsulta =
      this.construirDatosConsulta();


    const tieneDatoSinClave =
      this.datosClinicosFormulario
        .some(
          dato =>
            !dato.clave.trim()
            &&
            Boolean(
              dato.valor.trim()
            )
        );


    if (
      tieneDatoSinClave
    ) {
      return;
    }


    this.guardandoConsulta =
      true;


    const payload:
      GuardarConsultaMedica =
    {
      motivoConsulta:
        this.normalizarTexto(
          this.formularioConsulta
            .motivoConsulta
        ),

      diagnostico:
        this.normalizarTexto(
          this.formularioConsulta
            .diagnostico
        ),

      tratamiento:
        this.normalizarTexto(
          this.formularioConsulta
            .tratamiento
        ),

      indicaciones:
        this.normalizarTexto(
          this.formularioConsulta
            .indicaciones
        ),

      proximoControl:
        this.formularioConsulta
          .proximoControl
          ?.trim()
        ||
        null,

      datosConsulta:
        datosConsulta
    };


    this.consultasMedicasService
      .actualizar(
        consulta.id,
        payload
      )
      .subscribe({

        next: (
          actualizada
        ) => {

          this.consultas =
            this.consultas
              .map(
                item =>
                  item.id ===
                  actualizada.id

                    ? actualizada

                    : item
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  new Date(
                    b.fecha
                  )
                    .getTime()
                  -
                  new Date(
                    a.fecha
                  )
                    .getTime()
              );


          this.guardandoConsulta =
            false;


          this.cerrarFormularioConsulta();


          this.alertaService.success(
            'Consulta actualizada',
            'Los cambios de la historia clínica se guardaron correctamente.'
          );
        },


        error: (
          error: any
        ) => {

          console.error(
            'Error actualizando consulta:',
            error
          );


          this.guardandoConsulta =
            false;


          this.alertaService.error(
            'No se pudo actualizar la consulta',
            this.obtenerMensajeError(
              error,
              'Revisá los datos e intentá nuevamente.'
            )
          );
        }
      });
  }


  // =========================================================
  // ELIMINAR CONSULTA
  // =========================================================

  async eliminarConsulta(
    consulta:
      ConsultaMedica
  ): Promise<void> {

    const confirmar =
      await this.dialogoService
        .confirmar({
          titulo:
            'Eliminar consulta',

          mensaje:
            'La consulta dejará de mostrarse en la historia clínica. Esta acción realiza una baja lógica.',

          textoConfirmar:
            'Eliminar',

          textoCancelar:
            'Cancelar',

          variante:
            'danger'
        });


    if (!confirmar) {
      return;
    }


    this.consultasMedicasService
      .eliminar(
        consulta.id
      )
      .subscribe({

        next: () => {

          this.consultas =
            this.consultas
              .filter(
                item =>
                  item.id !==
                  consulta.id
              );


          this.alertaService.success(
            'Consulta eliminada',
            'La consulta fue dada de baja de la historia clínica.'
          );
        },


        error: (
          error: any
        ) => {

          console.error(
            'Error eliminando consulta:',
            error
          );


          this.alertaService.error(
            'No se pudo eliminar la consulta',
            this.obtenerMensajeError(
              error,
              'Intentá nuevamente.'
            )
          );
        }
      });
  }


  // =========================================================
  // ARCHIVOS
  // =========================================================

 subirArchivo(
  event: Event,
  consulta: ConsultaMedica
): void {

  const input =
    event.target;

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  const archivo =
    input.files?.[0];

  if (!archivo) {
    return;
  }

  // Permite volver a elegir el mismo archivo
  // después de terminar la operación.
  input.value = '';

  if (
    archivo.size >
    15 * 1024 * 1024
  ) {

    this.alertaService.warning(
      'Archivo demasiado grande',
      'El archivo no puede superar los 15 MB.'
    );

    return;
  }

  const tiposPermitidos = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (
    !tiposPermitidos.includes(
      archivo.type
    )
  ) {

    this.alertaService.warning(
      'Formato no permitido',
      'Podés subir PDF, JPG, PNG o WEBP.'
    );

    return;
  }

  this.subiendoArchivoConsultaId =
    consulta.id;

  this.consultasMedicasService
    .subirArchivo(
      consulta.id,
      archivo
    )
    .subscribe({

      next: (
        archivoGuardado
      ) => {

        this.subiendoArchivoConsultaId =
          null;

        consulta.archivos = [
          archivoGuardado,
          ...(consulta.archivos ?? [])
        ];

        this.alertaService.success(
          'Archivo agregado',
          `${archivo.name} se guardó en la historia clínica.`
        );
      },

      error: (
        error: any
      ) => {

        console.error(
          'Error subiendo archivo clínico:',
          error
        );

        this.subiendoArchivoConsultaId =
          null;

        this.alertaService.error(
          'No se pudo subir el archivo',
          this.obtenerMensajeError(
            error,
            'Intentá nuevamente.'
          )
        );
      }
    });
}

  subirArchivoDirecto(
    event: Event
  ): void {

    const input =
      event.target;


    if (
      !(
        input instanceof
        HTMLInputElement
      )
    ) {
      return;
    }


    const archivo =
      input.files?.[0];


    input.value =
      '';


    if (!archivo) {
      return;
    }


    const errorArchivo =
      this.validarArchivoClinico(
        archivo
      );


    if (errorArchivo) {

      this.alertaService.warning(
        'Archivo no permitido',
        `${archivo.name}: ${errorArchivo}`
      );

      return;
    }


    if (
      !this.paciente
      ||
      this.subiendoArchivoDirecto
    ) {
      return;
    }


    this.subiendoArchivoDirecto =
      true;


    // Si ya tenemos contexto clínico, continuamos.
    if (
      this.contextoArchivoDirecto
      &&
      this.especialidadArchivoDirectoId
    ) {

      this.crearDocumentoClinicoYSubir(
        archivo
      );

      return;
    }


    this.consultasMedicasService
      .obtenerContextoManual()
      .subscribe({

        next: (
          contexto
        ) => {

          if (
            !contexto.especialidades
            ||
            contexto.especialidades.length === 0
          ) {

            this.subiendoArchivoDirecto =
              false;


            this.alertaService.warning(
              'Sin especialidades',
              'Tu perfil profesional no tiene especialidades activas para asociar el archivo.'
            );

            return;
          }


          this.contextoArchivoDirecto =
            contexto;


          this.especialidadArchivoDirectoId =
            contexto.especialidades[0]
              .profesionalEspecialidadId;


          this.crearDocumentoClinicoYSubir(
            archivo
          );
        },


        error: (
          error: any
        ) => {

          this.subiendoArchivoDirecto =
            false;


          this.alertaService.error(
            'No se pudo subir el archivo',
            this.obtenerMensajeError(
              error,
              'Tu usuario debe estar vinculado como profesional activo.'
            )
          );
        }
      });
  }


  private crearDocumentoClinicoYSubir(
    archivo: File
  ): void {

    if (
      !this.paciente
      ||
      !this.especialidadArchivoDirectoId
    ) {

      this.subiendoArchivoDirecto =
        false;

      return;
    }


    const payload:
      CrearConsultaManual =
    {
      pacienteId:
        this.paciente.id,

      profesionalEspecialidadId:
        this.especialidadArchivoDirectoId,

      motivoConsulta:
        'Documentación clínica',

      diagnostico:
        null,

      tratamiento:
        null,

      indicaciones:
        null,

      proximoControl:
        null,

      datosConsulta:
        {
          tipoRegistro:
            'archivo_directo'
        }
    };


    this.consultasMedicasService
      .crearManual(
        payload
      )
      .subscribe({

        next: (
          consulta
        ) => {

          this.consultasMedicasService
            .subirArchivo(
              consulta.id,
              archivo
            )
            .subscribe({

              next: (
                archivoGuardado
              ) => {

                consulta.archivos =
                  [
                    archivoGuardado
                  ];


                this.consultas =
                  [
                    consulta,
                    ...this.consultas
                  ]
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        new Date(
                          b.fecha
                        )
                          .getTime()
                        -
                        new Date(
                          a.fecha
                        )
                          .getTime()
                    );


                this.consultaArchivoSeleccionadaId =
                  consulta.id;


                this.subiendoArchivoDirecto =
                  false;


                this.alertaService.success(
                  'Archivo agregado',
                  'El archivo se guardó en la documentación clínica del paciente.'
                );
              },


              error: (
                error: any
              ) => {

                this.subiendoArchivoDirecto =
                  false;


                this.cargarHistoria();


                this.alertaService.error(
                  'No se pudo subir el archivo',
                  this.obtenerMensajeError(
                    error,
                    'La entrada clínica se creó, pero el archivo no pudo subirse.'
                  )
                );
              }
            });
        },


        error: (
          error: any
        ) => {

          this.subiendoArchivoDirecto =
            false;


          this.alertaService.error(
            'No se pudo crear la documentación',
            this.obtenerMensajeError(
              error,
              'Intentá nuevamente.'
            )
          );
        }
      });
  }


  seleccionarArchivosDesdePestana(
    event: Event
  ): void {

    const input =
      event.target;


    if (
      !(
        input instanceof
        HTMLInputElement
      )
    ) {
      return;
    }


    const archivos =
      Array.from(
        input.files
        ??
        []
      );


    input.value =
      '';


    if (
      archivos.length === 0
    ) {
      return;
    }


    if (
      !this.consultaArchivoSeleccionadaId
    ) {

      this.alertaService.warning(
        'Elegí una consulta',
        'Seleccioná a qué consulta querés asociar los archivos.'
      );

      return;
    }


    const consulta =
      this.consultas
        .find(
          item =>
            item.id ===
            this.consultaArchivoSeleccionadaId
        );


    if (!consulta) {

      this.alertaService.error(
        'Consulta no encontrada',
        'No pudimos encontrar la consulta seleccionada.'
      );

      return;
    }


    const archivosValidos:
      File[] =
        [];


    for (
      const archivo of
      archivos
    ) {

      const error =
        this.validarArchivoClinico(
          archivo
        );


      if (error) {

        this.alertaService.warning(
          'Archivo no permitido',
          `${archivo.name}: ${error}`
        );

        continue;
      }


      archivosValidos.push(
        archivo
      );
    }


    if (
      archivosValidos.length ===
      0
    ) {
      return;
    }


    this.subiendoArchivosPestana =
      true;


    forkJoin(
      archivosValidos.map(
        archivo =>
          this.consultasMedicasService
            .subirArchivo(
              consulta.id,
              archivo
            )
      )
    )
      .subscribe({

        next: (
          archivosGuardados
        ) => {

          this.subiendoArchivosPestana =
            false;


          consulta.archivos =
            [
              ...archivosGuardados,
              ...(
                consulta.archivos
                ??
                []
              )
            ];


          this.alertaService.success(
            archivosGuardados.length === 1
              ? 'Archivo agregado'
              : 'Archivos agregados',
            archivosGuardados.length === 1
              ? 'El archivo se guardó correctamente.'
              : `Se guardaron ${archivosGuardados.length} archivos correctamente.`
          );
        },


        error: (
          error: any
        ) => {

          this.subiendoArchivosPestana =
            false;


          console.error(
            'Error subiendo archivos desde la pestaña:',
            error
          );


          this.cargarHistoria();


          this.alertaService.error(
            'No se pudieron subir todos los archivos',
            this.obtenerMensajeError(
              error,
              'Revisá los archivos e intentá nuevamente.'
            )
          );
        }
      });
  }


  iniciarEdicionNombreArchivo(
    archivo:
      ConsultaMedicaArchivo
  ): void {

    this.archivoEditandoNombreId =
      archivo.id;


    this.nombreArchivoEditado =
      archivo.nombreArchivo;
  }


  cancelarEdicionNombreArchivo(): void {

    this.archivoEditandoNombreId =
      null;


    this.nombreArchivoEditado =
      '';
  }


  guardarNombreArchivo(
    archivo:
      ConsultaMedicaArchivo
  ): void {

    const nombre =
      this.nombreArchivoEditado
        .trim();


    if (!nombre) {

      this.alertaService.warning(
        'Nombre obligatorio',
        'Ingresá un nombre para el archivo.'
      );

      return;
    }


    if (
      nombre.length >
      255
    ) {

      this.alertaService.warning(
        'Nombre demasiado largo',
        'El nombre del archivo no puede superar los 255 caracteres.'
      );

      return;
    }


    this.guardandoNombreArchivoId =
      archivo.id;


    this.consultasMedicasService
      .renombrarArchivo(
        archivo.id,
        nombre
      )
      .subscribe({

        next: (
          actualizado
        ) => {

          this.guardandoNombreArchivoId =
            null;


          archivo.nombreArchivo =
            actualizado.nombreArchivo;


          if (
            actualizado.url
          ) {

            archivo.url =
              actualizado.url;
          }


          this.cancelarEdicionNombreArchivo();


          this.alertaService.success(
            'Archivo actualizado',
            'El nombre del archivo se guardó correctamente.'
          );
        },


        error: (
          error: any
        ) => {

          this.guardandoNombreArchivoId =
            null;


          console.error(
            'Error renombrando archivo:',
            error
          );


          this.alertaService.error(
            'No se pudo editar el archivo',
            this.obtenerMensajeError(
              error,
              'Intentá nuevamente.'
            )
          );
        }
      });
  }


  abrirArchivo(
    archivo:
      ConsultaMedicaArchivo
  ): void {

    // Las URLs clínicas son temporales.
    // Antes de abrir regeneramos una URL firmada
    // para no depender de una que haya vencido.
    this.consultasMedicasService
      .obtenerArchivos(
        archivo.consultaMedicaId
      )
      .subscribe({

        next: (
          archivos
        ) => {

          const actualizado =
            archivos.find(
              item =>
                item.id ===
                archivo.id
            );


          if (
            !actualizado?.url
          ) {

            this.alertaService.error(
              'No se pudo abrir el archivo',
              'No encontramos una URL de acceso válida.'
            );

            return;
          }


          window.open(
            actualizado.url,
            '_blank',
            'noopener,noreferrer'
          );
        },


        error: (
          error: any
        ) => {

          this.alertaService.error(
            'No se pudo abrir el archivo',
            this.obtenerMensajeError(
              error,
              'Intentá nuevamente.'
            )
          );
        }
      });
  }


  async eliminarArchivo(
    consulta:
      ConsultaMedica,
    archivo:
      ConsultaMedicaArchivo
  ): Promise<void> {

    const confirmar =
      await this.dialogoService
        .confirmar({
          titulo:
            'Eliminar archivo',

          mensaje:
            `¿Querés eliminar "${archivo.nombreArchivo}" de esta consulta?`,

          textoConfirmar:
            'Eliminar',

          textoCancelar:
            'Cancelar',

          variante:
            'danger'
        });


    if (!confirmar) {
      return;
    }


    this.eliminandoArchivoId =
      archivo.id;


    this.consultasMedicasService
      .eliminarArchivo(
        archivo.id
      )
      .subscribe({

        next: () => {

          this.eliminandoArchivoId =
            null;


          consulta.archivos =
            (
              consulta.archivos
              ??
              []
            )
              .filter(
                item =>
                  item.id !==
                  archivo.id
              );


          this.alertaService.success(
            'Archivo eliminado',
            'El archivo fue eliminado correctamente.'
          );
        },


        error: (
          error: any
        ) => {

          this.eliminandoArchivoId =
            null;


          this.alertaService.error(
            'No se pudo eliminar el archivo',
            this.obtenerMensajeError(
              error,
              'Intentá nuevamente.'
            )
          );
        }
      });
  }


  // =========================================================
  // HELPERS DE HISTORIA
  // =========================================================

  obtenerUltimaConsulta():
    ConsultaMedica | null {

    return this.consultas[0]
      ??
      null;
  }


  obtenerTodosLosArchivos():
    ArchivoConConsulta[] {

    return this.consultas
      .flatMap(
        consulta =>
          (
            consulta.archivos
            ??
            []
          )
            .map(
              archivo => ({
                archivo,
                consulta
              })
            )
      )
      .sort(
        (
          a,
          b
        ) =>
          new Date(
            b.archivo
              .createdAt
          )
            .getTime()
          -
          new Date(
            a.archivo
              .createdAt
          )
            .getTime()
      );
  }


  totalArchivos(): number {

    return this.consultas
      .reduce(
        (
          total,
          consulta
        ) =>
          total
          +
          (
            consulta.archivos
              ?.length
            ??
            0
          ),
        0
      );
  }


  tieneContenidoClinico(
    consulta:
      ConsultaMedica
  ): boolean {

    return Boolean(
      consulta.motivoConsulta
      ||
      consulta.diagnostico
      ||
      consulta.tratamiento
      ||
      consulta.indicaciones
      ||
      consulta.proximoControl
      ||
      this.obtenerDatosClinicos(
        consulta
      ).length > 0
    );
  }


  trackByConsulta(
    _index: number,
    consulta:
      ConsultaMedica
  ): string {

    return consulta.id;
  }


  trackByArchivo(
    _index: number,
    archivo:
      ConsultaMedicaArchivo
  ): string {

    return archivo.id;
  }


  iconoArchivo(
    archivo:
      ConsultaMedicaArchivo
  ): string {

    const tipo =
      (
        archivo.tipoArchivo
        ??
        ''
      )
        .toLowerCase();


    if (
      tipo ===
      'application/pdf'
    ) {
      return 'PDF';
    }


    if (
      tipo.startsWith(
        'image/'
      )
    ) {
      return 'IMG';
    }


    return 'DOC';
  }


  obtenerDiaConsulta(
    fecha?: string | null
  ): string {

    if (!fecha) {
      return '--';
    }


    const valor =
      new Date(
        fecha
      );


    if (
      Number.isNaN(
        valor.getTime()
      )
    ) {
      return '--';
    }


    return valor
      .getDate()
      .toString()
      .padStart(
        2,
        '0'
      );
  }


  obtenerMesConsulta(
    fecha?: string | null
  ): string {

    if (!fecha) {
      return '---';
    }


    const valor =
      new Date(
        fecha
      );


    if (
      Number.isNaN(
        valor.getTime()
      )
    ) {
      return '---';
    }


    const meses =
      [
        'ENE',
        'FEB',
        'MAR',
        'ABR',
        'MAY',
        'JUN',
        'JUL',
        'AGO',
        'SEP',
        'OCT',
        'NOV',
        'DIC'
      ];


    return meses[
      valor.getMonth()
    ];
  }


  formatearFechaHora(
    fecha?: string | null
  ): string {

    if (!fecha) {
      return '-';
    }


    const valor =
      new Date(
        fecha
      );


    if (
      Number.isNaN(
        valor.getTime()
      )
    ) {
      return fecha;
    }


    return valor
      .toLocaleString(
        'es-AR',
        {
          day:
            '2-digit',

          month:
            'short',

          year:
            'numeric',

          hour:
            '2-digit',

          minute:
            '2-digit'
        }
      );
  }


  // =========================================================
  // HELPERS PACIENTE
  // =========================================================

  obtenerNombreCompleto(): string {

    if (!this.paciente) {
      return '';
    }


    return `${this.paciente.nombre} ${this.paciente.apellido}`
      .trim();
  }


  obtenerIniciales(): string {

    if (!this.paciente) {
      return '';
    }


    const nombre =
      this.paciente.nombre
        ?.charAt(
          0
        )
      ??
      '';


    const apellido =
      this.paciente.apellido
        ?.charAt(
          0
        )
      ??
      '';


    return `${nombre}${apellido}`
      .toUpperCase();
  }


  obtenerEdad():
    number | null {

    const fecha =
      this.paciente
        ?.fecha_nacimiento;


    if (!fecha) {
      return null;
    }


    const partes =
      fecha
        .split(
          '-'
        )
        .map(
          Number
        );


    if (
      partes.length !==
      3
    ) {
      return null;
    }


    const nacimiento =
      new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
      );


    const hoy =
      new Date();


    let edad =
      hoy.getFullYear()
      -
      nacimiento
        .getFullYear();


    const diferenciaMes =
      hoy.getMonth()
      -
      nacimiento
        .getMonth();


    if (
      diferenciaMes < 0
      ||
      (
        diferenciaMes ===
        0
        &&
        hoy.getDate()
        <
        nacimiento.getDate()
      )
    ) {
      edad--;
    }


    return edad;
  }


  formatearFecha(
    fecha?: string | null
  ): string {

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


    if (
      !year
      ||
      !month
      ||
      !day
    ) {
      return fecha;
    }


    return new Date(
      year,
      month - 1,
      day
    )
      .toLocaleDateString(
        'es-AR'
      );
  }


  private validarArchivoClinico(
    archivo: File
  ): string | null {

    if (
      archivo.size >
      15 * 1024 * 1024
    ) {

      return 'supera el máximo de 15 MB.';
    }


    const tiposPermitidos =
      [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
      ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      return 'solo se permiten PDF, JPG, PNG o WEBP.';
    }


    return null;
  }


  // =========================================================
  // HELPERS INTERNOS
  // =========================================================

  private crearFormularioPacienteVacio():
    FormularioPaciente {

    return {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      direccion: '',
      sexo: '',
      numero_afiliado: ''
    };
  }


  private crearFormularioVacio():
    FormularioConsulta {

    return {
      motivoConsulta:
        '',

      diagnostico:
        '',

      tratamiento:
        '',

      indicaciones:
        '',

      proximoControl:
        ''
    };
  }


  private normalizarTexto(
    valor:
      string | null | undefined
  ): string | null {

    const limpio =
      String(
        valor
        ??
        ''
      )
        .trim();


    return limpio
      ? limpio
      : null;
  }


  private obtenerMensajeError(
    error: any,
    fallback: string
  ): string {

    return (
      error?.error?.message
      ??
      error?.error?.title
      ??
      error?.message
      ??
      fallback
    );
  }
}
