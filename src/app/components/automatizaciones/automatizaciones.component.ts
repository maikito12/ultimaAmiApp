import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { forkJoin } from 'rxjs';

import {
  Automatizacion,
  AutomatizacionesService,
  GuardarAutomatizacionPayload,
  GuardarWhatsAppConfiguracionPayload,
  WhatsAppConfiguracion
} from '../../services/automatizaciones.service';

import {
  AlertaService
} from '../../services/alerta.service';

import {
  DialogoService
} from '../../services/dialogo.service';

import {
  ProfesionalService
} from '../../services/profesional.service';

import {
  ContextoService
} from '../../services/contexto.service';


interface OpcionAutomatizacionCatalogo {
  evento: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  icono: string;
  disponible: boolean;
  estado: string;
}


interface ProfesionalAlcance {
  profesionalOrganizacionId: string;
  profesionalId: string;
  profesional: string;
  activo: boolean;
}


@Component({
  selector: 'app-automatizaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './automatizaciones.component.html',
  styleUrl: './automatizaciones.component.css'
})
export class AutomatizacionesComponent implements OnInit {

  automatizaciones: Automatizacion[] = [];

  profesionales: ProfesionalAlcance[] = [];

  cargandoProfesionales = false;

  esAdminActual = false;

  esProfesionalActual = false;

  profesionalOrganizacionIdActual:
    string | null = null;

  profesionalIdActual:
    string | null = null;

  profesionalSeleccionadoId:
    string | null = null;

  alcanceAutomatizacion:
    'organizacion' | 'profesionales' =
      'organizacion';

  profesionalesSeleccionadosIds:
    string[] = [];

  alcanceEdicionOriginal:
    'organizacion' | 'profesionales' | null =
      null;

  profesionalEdicionOriginalId:
    string | null = null;

  whatsAppConfiguracion:
    WhatsAppConfiguracion | null = null;

  cargandoWhatsApp = false;

  guardandoWhatsApp = false;

  desconectandoWhatsApp = false;

  mostrarConfiguracionWhatsApp = false;

  mostrarAyudaWhatsApp = false;

  whatsappForm = {
    numero: '',
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: ''
  };

  cargando = false;
  guardando = false;

  subiendoVideo = false;

  videoNombreArchivo = '';

  modoEditor = false;

  modoCatalogo = false;

  editandoId: string | null = null;


  readonly catalogoAutomatizaciones:
    OpcionAutomatizacionCatalogo[] = [

    {
      evento: 'TurnoCreado',
      categoria: 'RESERVA',
      titulo: 'Al reservar un turno',
      descripcion:
        'Envía una confirmación inmediatamente después de que el paciente reserva.',
      icono: '↗',
      disponible: true,
      estado: 'Disponible'
    },

    {
      evento: 'RecordatorioTurno',
      categoria: 'ANTES DEL TURNO',
      titulo: 'Recordatorio del turno',
      descripcion:
        'Recordá el turno con anticipación y permití confirmar, cancelar o reagendar.',
      icono: '◷',
     disponible: true,
      estado: 'Disponible'
    },

    {
      evento: 'TurnoConfirmado',
      categoria: 'CONFIRMACIÓN',
      titulo: 'Cuando confirma',
      descripcion:
        'Envía un mensaje automático cuando el paciente confirma su asistencia.',
      icono: '✓',
      disponible: true,
      estado: 'Disponible'
    },

    {
      evento: 'TurnoCancelado',
      categoria: 'CANCELACIÓN',
      titulo: 'Cuando cancela',
      descripcion:
        'Confirma la cancelación y deja el turno liberado en la agenda.',
      icono: '×',
      disponible: true,
      estado: 'Disponible'
    },

    {
      evento: 'PostConsulta',
      categoria: 'DESPUÉS DEL TURNO',
      titulo: 'Post consulta',
      descripcion:
        'Envía seguimiento o contenido después de que la consulta finaliza.',
      icono: '→',
      disponible: true,
      estado: 'Disponible'
    },

    {
      evento: 'Cumpleanos',
      categoria: 'PACIENTES',
      titulo: 'Cumpleaños',
      descripcion:
        'Envía un saludo automático el día del cumpleaños del paciente.',
      icono: '✦',
      disponible: true,
      estado: 'Disponible'
    }
  ];


  formulario = this.formularioInicial();


  constructor(
    private automatizacionesService: AutomatizacionesService,
    private profesionalService: ProfesionalService,
    private contextoService: ContextoService,
    private alertaService: AlertaService,
    private dialogoService: DialogoService
  ) {}


  ngOnInit(): void {
    this.cargarContexto();
    this.cargarProfesionales();
    this.inicializarWhatsApp();
    this.cargar();
  }


  // =====================================================
  // ALCANCE: ORGANIZACIÓN / PROFESIONAL
  // =====================================================

  cargarProfesionales(): void {

    if (this.cargandoProfesionales) {
      return;
    }

    this.cargandoProfesionales =
      true;


    this.profesionalService
      .obtenerProfesionalesOrganizacion()
      .subscribe({

        next: (respuesta) => {

          this.profesionales =
            (respuesta ?? [])
              .map((item: any) => ({
                profesionalOrganizacionId:
                  (
                    item?.id
                    ??
                    ''
                  )
                    .toString(),

                profesionalId:
                  (
                    item?.profesionalId
                    ??
                    ''
                  )
                    .toString(),

                profesional:
                  (
                    item?.profesional
                    ??
                    ''
                  )
                    .toString()
                    .trim(),

                activo:
                  item?.activo !== false
              }))
              .filter(
                profesional =>
                  profesional.activo
                  &&
                  !!profesional.profesionalId
                  &&
                  !!profesional.profesional
              )
              .sort(
                (a, b) =>
                  a.profesional.localeCompare(
                    b.profesional,
                    'es'
                  )
              );

          this.cargandoProfesionales =
            false;
        },

        error: (error) => {

          this.cargandoProfesionales =
            false;

          this.profesionales =
            [];

          console.error(
            'Error cargando profesionales:',
            error
          );

          this.alertaService.error(
            'No pudimos cargar los profesionales',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
        }

      });
  }


  // =====================================================
  // CONTEXTO DEL USUARIO PARA WHATSAPP
  //
  // Admin normal:
  // -> administra WhatsApp general.
  //
  // Profesional normal:
  // -> administra solamente su propio WhatsApp.
  //
  // Admin + profesional:
  // -> puede alternar entre el general y el suyo.
  //
  // Nunca se permite administrar el WhatsApp
  // personal de otro profesional desde esta pantalla.
  // =====================================================

  private cargarContexto(): void {

    this.esAdminActual =
      this.contextoService
        .esAdmin();

    this.esProfesionalActual =
      this.contextoService
        .esProfesionalActual();

    this.profesionalOrganizacionIdActual =
      this.contextoService
        .getProfesionalOrganizacionId();
  }


  private inicializarWhatsApp(): void {

    // Si no es profesional, su único alcance posible
    // por ahora es el WhatsApp general de la organización.
    if (!this.esProfesionalActual) {

      this.profesionalIdActual =
        null;

      this.profesionalSeleccionadoId =
        null;

      this.cargarWhatsApp();

      return;
    }


    // Obtenemos el ID real de profesionales.id.
    // No usamos profesional_organizacion.id para WhatsApp.
    this.profesionalService
      .obtenerMiPerfil()
      .subscribe({

        next: (perfil) => {

          this.profesionalIdActual =
            perfil?.id
              ? perfil.id.toString()
              : null;


          // Profesional puro:
          // entra directamente a SU WhatsApp.
          if (
            !this.esAdminActual
            &&
            this.profesionalIdActual
          ) {

            this.profesionalSeleccionadoId =
              this.profesionalIdActual;
          }
          else {

            // Admin + profesional:
            // empieza administrando el general.
            this.profesionalSeleccionadoId =
              null;
          }


          this.cargarWhatsApp();
        },

        error: (error) => {

          console.error(
            'Error obteniendo el perfil profesional para WhatsApp:',
            error
          );

          this.profesionalIdActual =
            null;


          // Si además es admin, todavía puede trabajar
          // con el WhatsApp general de la organización.
          if (this.esAdminActual) {

            this.profesionalSeleccionadoId =
              null;

            this.cargarWhatsApp();

            return;
          }


          // Profesional sin ID resuelto:
          // no caemos silenciosamente al WhatsApp general,
          // porque ese número no le pertenece.
          this.whatsAppConfiguracion =
            null;

          this.alertaService.error(
            'No pudimos identificar tu perfil profesional',
            'No vamos a mostrarte el WhatsApp de la organización como si fuera tuyo. Recargá la pantalla e intentá nuevamente.'
          );
        }

      });
  }


  get puedeCambiarAlcanceWhatsApp():
    boolean {

    return !!(
      this.esAdminActual
      &&
      this.esProfesionalActual
      &&
      this.profesionalIdActual
    );
  }


  cambiarAlcance(
    valor: string | null
  ): void {

    // Solo un admin que también es profesional
    // tiene dos configuraciones posibles.
    if (!this.puedeCambiarAlcanceWhatsApp) {
      return;
    }


    const nuevoProfesionalId =
      valor?.trim()
        ? valor.trim()
        : null;


    // El único profesional permitido es el usuario actual.
    // Nunca aceptamos por UI el ID de otro médico.
    if (
      nuevoProfesionalId
      &&
      nuevoProfesionalId !==
        this.profesionalIdActual
    ) {

      return;
    }


    if (
      nuevoProfesionalId ===
      this.profesionalSeleccionadoId
    ) {
      return;
    }


    this.profesionalSeleccionadoId =
      nuevoProfesionalId;

    this.mostrarConfiguracionWhatsApp =
      false;

    this.whatsAppConfiguracion =
      null;

    this.whatsappForm = {
      numero: '',
      phoneNumberId: '',
      businessAccountId: '',
      accessToken: ''
    };


    this.cargarWhatsApp();
  }


  get nombreAlcanceActual(): string {

    return this.esAlcanceProfesional
      ? 'Mi WhatsApp profesional'
      : 'WhatsApp de la organización';
  }


  get esAlcanceProfesional(): boolean {

    return !!this.profesionalSeleccionadoId;
  }


  esOpcionDisponible(
    opcion: OpcionAutomatizacionCatalogo
  ): boolean {

    return opcion.disponible;
  }


  estadoOpcion(
    opcion: OpcionAutomatizacionCatalogo
  ): string {

    return opcion.estado;
  }


  esEventoCumpleanos(
    evento: string
  ): boolean {

    return (
      evento === 'Cumpleanos'
      ||
      evento === 'Cumpleaños'
    );
  }


  // =====================================================
  // ALCANCE DE LA AUTOMATIZACIÓN
  // =====================================================

  seleccionarAlcanceAutomatizacion(
    alcance:
      'organizacion' | 'profesionales'
  ): void {

    if (
      this.esEventoCumpleanos(
        this.formulario.evento
      )
      &&
      alcance === 'profesionales'
    ) {

      this.alertaService.info(
        'Cumpleaños queda a nivel organización',
        'En esta versión, el saludo de cumpleaños se configura como una regla general.'
      );

      return;
    }


    if (
      this.editandoId
      &&
      this.alcanceEdicionOriginal
      &&
      alcance !==
        this.alcanceEdicionOriginal
    ) {

      this.alertaService.info(
        'El alcance base no cambia al editar',
        this.alcanceEdicionOriginal ===
          'organizacion'
          ? 'Esta regla es general. Para crear una versión para profesionales específicos, creá una nueva automatización.'
          : 'Esta regla pertenece a profesionales específicos. Podés sumar más profesionales desde esta misma pantalla.'
      );

      return;
    }


    this.alcanceAutomatizacion =
      alcance;


    if (
      alcance ===
      'organizacion'
    ) {

      this.profesionalesSeleccionadosIds =
        [];
    }
  }


  get usaProfesionalesEspecificos():
    boolean {

    return (
      this.alcanceAutomatizacion ===
      'profesionales'
      &&
      !this.esEventoCumpleanos(
        this.formulario.evento
      )
    );
  }


  estaProfesionalSeleccionado(
    profesionalId: string
  ): boolean {

    return this.profesionalesSeleccionadosIds
      .includes(
        profesionalId
      );
  }


  toggleProfesionalAutomatizacion(
    profesionalId: string
  ): void {

    if (this.guardando) {
      return;
    }


    const estaSeleccionado =
      this.estaProfesionalSeleccionado(
        profesionalId
      );


    if (
      estaSeleccionado
      &&
      this.editandoId
      &&
      this.profesionalEdicionOriginalId ===
        profesionalId
    ) {

      this.alertaService.info(
        'Este profesional forma parte de la regla que estás editando',
        'Podés sumar otros profesionales, pero para quitar esta regla usá “Desactivar” desde el listado.'
      );

      return;
    }


    if (estaSeleccionado) {

      this.profesionalesSeleccionadosIds =
        this.profesionalesSeleccionadosIds
          .filter(
            id =>
              id !== profesionalId
          );

      return;
    }


    this.profesionalesSeleccionadosIds = [
      ...this.profesionalesSeleccionadosIds,
      profesionalId
    ];
  }


  seleccionarTodosProfesionales(): void {

    if (this.guardando) {
      return;
    }


    this.profesionalesSeleccionadosIds =
      this.profesionales
        .filter(
          profesional =>
            profesional.activo
        )
        .map(
          profesional =>
            profesional.profesionalId
        );
  }


  limpiarProfesionalesSeleccionados():
    void {

    if (this.guardando) {
      return;
    }


    if (
      this.editandoId
      &&
      this.profesionalEdicionOriginalId
    ) {

      this.profesionalesSeleccionadosIds = [
        this.profesionalEdicionOriginalId
      ];

      return;
    }


    this.profesionalesSeleccionadosIds =
      [];
  }


  get cantidadProfesionalesSeleccionados():
    number {

    return this.profesionalesSeleccionadosIds
      .length;
  }


  nombreProfesionalPorId(
    profesionalId: string
  ): string {

    return (
      this.profesionales
        .find(
          profesional =>
            profesional.profesionalId ===
            profesionalId
        )
        ?.profesional
      ??
      'Profesional'
    );
  }


  nombreAlcanceAutomatizacion(
    automatizacion: Automatizacion
  ): string {

    if (!automatizacion.profesionalId) {
      return 'Toda la organización';
    }


    return this.nombreProfesionalPorId(
      automatizacion.profesionalId
    );
  }


  get resumenAlcanceFormulario():
    string {

    if (
      this.esEventoCumpleanos(
        this.formulario.evento
      )
      ||
      this.alcanceAutomatizacion ===
        'organizacion'
    ) {

      return 'Toda la organización';
    }


    const cantidad =
      this.cantidadProfesionalesSeleccionados;


    if (cantidad === 0) {
      return 'Elegí al menos un profesional';
    }


    if (cantidad === 1) {

      return this.nombreProfesionalPorId(
        this.profesionalesSeleccionadosIds[0]
      );
    }


    return `${cantidad} profesionales`;
  }


  private resetearAlcanceAutomatizacion():
    void {

    this.alcanceAutomatizacion =
      'organizacion';

    this.profesionalesSeleccionadosIds =
      [];

    this.alcanceEdicionOriginal =
      null;

    this.profesionalEdicionOriginalId =
      null;
  }


  private buscarAutomatizacionExistente(
    evento: string,
    profesionalId: string | null
  ): Automatizacion | null {

    if (this.editandoId) {

      const editando =
        this.automatizaciones
          .find(
            automatizacion =>
              automatizacion.id ===
                this.editandoId
              &&
              automatizacion.evento ===
                evento
              &&
              (
                automatizacion.profesionalId
                ??
                null
              ) ===
                profesionalId
          );


      if (editando) {
        return editando;
      }
    }


    return (
      [
        ...this.automatizaciones
      ]
        .filter(
          automatizacion =>
            automatizacion.evento ===
              evento
            &&
            (
              automatizacion.profesionalId
              ??
              null
            ) ===
              profesionalId
        )
        .sort(
          (a, b) => {

            if (a.activo !== b.activo) {
              return a.activo ? -1 : 1;
            }


            return (
              new Date(
                b.createdAt
              ).getTime()
              -
              new Date(
                a.createdAt
              ).getTime()
            );
          }
        )[0]
      ??
      null
    );
  }


  // =====================================================
  // CONFIGURACIÓN DE WHATSAPP
  // =====================================================

  cargarWhatsApp(): void {

    if (this.cargandoWhatsApp) {
      return;
    }

    this.cargandoWhatsApp = true;

    this.automatizacionesService
      .obtenerConfiguracionWhatsApp(
        this.profesionalSeleccionadoId
      )
      .subscribe({

        next: (respuesta) => {

          this.whatsAppConfiguracion =
            respuesta?.conectado
              ? respuesta.configuracion
              : null;

          if (this.whatsAppConfiguracion) {

            this.whatsappForm.numero =
              this.whatsAppConfiguracion.numero
              ??
              '';

            this.whatsappForm.phoneNumberId =
              this.whatsAppConfiguracion.phoneNumberId
              ??
              '';

            this.whatsappForm.businessAccountId =
              this.whatsAppConfiguracion.businessAccountId
              ??
              '';
          }
          else {

            this.whatsappForm.numero =
              '';

            this.whatsappForm.phoneNumberId =
              '';

            this.whatsappForm.businessAccountId =
              '';
          }

          // El token nunca vuelve desde el backend.
          this.whatsappForm.accessToken =
            '';

          this.cargandoWhatsApp =
            false;
        },

        error: (error) => {

          this.whatsAppConfiguracion =
            null;

          this.cargandoWhatsApp =
            false;

          console.error(
            'Error cargando configuración de WhatsApp:',
            error
          );
        }

      });
  }


  get whatsAppConectado(): boolean {

    return !!(
      this.whatsAppConfiguracion
      &&
      this.whatsAppConfiguracion.activo
      &&
      this.whatsAppConfiguracion.numero
      &&
      this.whatsAppConfiguracion.phoneNumberId
    );
  }


  get automatizacionesActivas():
    Automatizacion[] {

    const activas =
      this.automatizaciones
        .filter(
          automatizacion =>
            automatizacion.activo
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime()
            -
            new Date(
              a.createdAt
            ).getTime()
        );


    const porEventoYAlcance =
      new Map<
        string,
        Automatizacion
      >();


    for (
      const automatizacion
      of activas
    ) {

      const clave =
        `${automatizacion.evento}|${
          automatizacion.profesionalId
          ??
          'organizacion'
        }`;


      if (
        !porEventoYAlcance.has(
          clave
        )
      ) {

        porEventoYAlcance.set(
          clave,
          automatizacion
        );
      }
    }


    return Array.from(
      porEventoYAlcance.values()
    );
  }


  // =====================================================
  // CONFIGURAR WHATSAPP
  // =====================================================

  abrirConfiguracionWhatsApp(): void {

    if (this.whatsAppConfiguracion) {

      this.whatsappForm.numero =
        this.whatsAppConfiguracion.numero
        ??
        '';

      this.whatsappForm.phoneNumberId =
        this.whatsAppConfiguracion.phoneNumberId
        ??
        '';

      this.whatsappForm.businessAccountId =
        this.whatsAppConfiguracion.businessAccountId
        ??
        '';
    }

    this.whatsappForm.accessToken =
      '';

    this.mostrarConfiguracionWhatsApp =
      true;
  }


  cancelarConfiguracionWhatsApp(): void {

    if (this.guardandoWhatsApp) {
      return;
    }

    this.mostrarConfiguracionWhatsApp =
      false;

    this.whatsappForm.accessToken =
      '';
  }


  toggleAyudaWhatsApp(): void {

    this.mostrarAyudaWhatsApp =
      !this.mostrarAyudaWhatsApp;
  }


  guardarConfiguracionWhatsApp(): void {

    const numero =
      this.whatsappForm.numero.trim();

    const phoneNumberId =
      this.whatsappForm.phoneNumberId.trim();

    const businessAccountId =
      this.whatsappForm.businessAccountId.trim();

    const accessToken =
      this.whatsappForm.accessToken.trim();


    if (
      !numero
      ||
      !phoneNumberId
      ||
      !businessAccountId
      ||
      !accessToken
    ) {

      this.alertaService.warning(
        'Faltan datos de WhatsApp',
        'Completá número, Phone Number ID, Business Account ID y Access Token.'
      );

      return;
    }


   const payload:
  GuardarWhatsAppConfiguracionPayload = {

  profesionalId:
    this.profesionalSeleccionadoId,

  numero,
  phoneNumberId,
  businessAccountId,
  accessToken
};


    this.guardandoWhatsApp =
      true;


    this.automatizacionesService
      .guardarConfiguracionWhatsApp(
        payload
      )
      .subscribe({

        next: () => {

          this.guardandoWhatsApp =
            false;

          this.whatsappForm.accessToken =
            '';

          this.mostrarConfiguracionWhatsApp =
            false;

          this.alertaService.success(
            'WhatsApp conectado',
            this.esAlcanceProfesional
              ? 'Tu WhatsApp profesional se guardó correctamente.'
              : 'El WhatsApp general de la organización se guardó correctamente.'
          );

          this.cargarWhatsApp();
        },

        error: (error) => {

          this.guardandoWhatsApp =
            false;

          console.error(
            'Error guardando WhatsApp:',
            error
          );

          this.alertaService.error(
            'No pudimos guardar WhatsApp',
            error?.error?.message
            ??
            'Revisá los datos e intentá nuevamente.'
          );
        }

      });
  }


  async desconectarWhatsApp(): Promise<void> {

    if (!this.whatsAppConfiguracion) {
      return;
    }


    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            'Desconectar WhatsApp',

          mensaje:
            this.esAlcanceProfesional
              ? 'Se quitará tu WhatsApp profesional. Tus envíos volverán a usar el WhatsApp general de la organización cuando esté disponible.'
              : 'Se quitará el WhatsApp general de la organización. Los profesionales sin número propio no tendrán un número de respaldo hasta que vuelvas a conectarlo.',

          textoConfirmar:
            'Desconectar',

          textoCancelar:
            'Cancelar',

          variante:
            'danger'
        });


    if (!confirmado) {
      return;
    }


    this.desconectandoWhatsApp =
      true;


    this.automatizacionesService
      .desconectarWhatsApp(
        this.profesionalSeleccionadoId
      )
      .subscribe({

        next: () => {

          this.desconectandoWhatsApp =
            false;

          this.whatsAppConfiguracion =
            null;

          this.whatsappForm = {
            numero: '',
            phoneNumberId: '',
            businessAccountId: '',
            accessToken: ''
          };


          this.alertaService.success(
            'WhatsApp desconectado',
            this.esAlcanceProfesional
              ? 'Se eliminó tu WhatsApp profesional. AmiApp podrá usar el general de la organización como respaldo.'
              : 'La conexión general de WhatsApp se eliminó correctamente.'
          );
        },

        error: (error) => {

          this.desconectandoWhatsApp =
            false;


          this.alertaService.error(
            'No pudimos desconectarlo',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
        }

      });
  }

  // =====================================================
  // CARGA
  // =====================================================

  cargar(): void {

    if (this.cargando) {
      return;
    }

    this.cargando = true;

    this.automatizacionesService
      .listar()
      .subscribe({

        next: (respuesta) => {

          this.automatizaciones =
            respuesta ?? [];

          this.cargando = false;
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'Error cargando automatizaciones:',
            error
          );

          this.alertaService.error(
            'No pudimos cargar las automatizaciones',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
        }

      });
  }


  // =====================================================
  // NUEVA
  // =====================================================

  nueva(): void {

    this.editandoId =
      null;

    this.formulario =
      this.formularioInicial();

    this.resetearAlcanceAutomatizacion();

    this.videoNombreArchivo =
      '';

    this.modoEditor =
      false;

    this.modoCatalogo =
      true;


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  cerrarCatalogo(): void {

    this.modoCatalogo =
      false;

    this.editandoId =
      null;

    this.formulario =
      this.formularioInicial();

    this.resetearAlcanceAutomatizacion();
  }


  seleccionarAutomatizacion(
    opcion: OpcionAutomatizacionCatalogo
  ): void {

    if (!opcion.disponible) {
      return;
    }


    this.editandoId =
      null;

    this.formulario =
      this.formularioParaEvento(
        opcion.evento
      );

    this.resetearAlcanceAutomatizacion();


    if (
      this.esEventoCumpleanos(
        opcion.evento
      )
    ) {

      this.alcanceAutomatizacion =
        'organizacion';
    }


    this.videoNombreArchivo =
      '';

    this.modoCatalogo =
      false;

    this.modoEditor =
      true;


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  seleccionarAnticipacion(
    minutos: number
  ): void {

    this.formulario.anticipacionMinutos =
      minutos;
  }


  esAnticipacionSeleccionada(
    minutos: number
  ): boolean {

    return (
      this.formulario.anticipacionMinutos ===
      minutos
    );
  }


  // =====================================================
  // EDITAR
  // =====================================================

  editar(
    automatizacion: Automatizacion
  ): void {

    const accion =
      automatizacion.acciones?.find(
        x =>
          x.tipo === 'Video'
      )
      ??
      automatizacion.acciones?.find(
        x =>
          x.tipo === 'Mensaje'
      )
      ??
      automatizacion.acciones?.[0];


    const usarVideo =
      accion?.tipo === 'Video';


    this.editandoId =
      automatizacion.id;


    if (automatizacion.profesionalId) {

      this.alcanceAutomatizacion =
        'profesionales';

      this.profesionalesSeleccionadosIds = [
        automatizacion.profesionalId
      ];

      this.alcanceEdicionOriginal =
        'profesionales';

      this.profesionalEdicionOriginalId =
        automatizacion.profesionalId;
    }
    else {

      this.alcanceAutomatizacion =
        'organizacion';

      this.profesionalesSeleccionadosIds =
        [];

      this.alcanceEdicionOriginal =
        'organizacion';

      this.profesionalEdicionOriginalId =
        null;
    }


    this.formulario = {

      nombre:
        automatizacion.nombre,

      evento:
        automatizacion.evento,

      canal:
        automatizacion.canal,

      activo:
        automatizacion.activo,

      anticipacionMinutos:
        automatizacion.anticipacionMinutos
        ??
        (
          automatizacion.evento === 'RecordatorioTurno'
            ? 1440
            : null
        ),

      templateNombre:
        accion?.templateNombre
        ??
        'hello_world',

      templateIdioma:
        this.obtenerIdiomaEvento(
          automatizacion.evento
        ),

      usarVideo,

      archivoUrl:
        accion?.archivoUrl
        ??
        null
    };


    this.videoNombreArchivo =
      this.obtenerNombreArchivoDesdeUrl(
        this.formulario.archivoUrl
      );


    this.modoCatalogo =
      false;

    this.modoEditor =
      true;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =====================================================
  // VOLVER AL LISTADO
  // =====================================================

  volver(): void {

    if (this.guardando) {
      return;
    }

    this.modoEditor =
      false;

    this.modoCatalogo =
      false;

    this.editandoId =
      null;

    this.formulario =
      this.formularioInicial();

    this.resetearAlcanceAutomatizacion();

    this.videoNombreArchivo =
      '';
  }


  // =====================================================
  // VIDEO / R2
  // =====================================================

  cambiarTipoEnvio(
    usarVideo: boolean
  ): void {

    if (
      this.subiendoVideo
    ) {
      return;
    }


    if (
      usarVideo
      &&
      (
        this.formulario.evento ===
          'TurnoConfirmado'
        ||
        this.formulario.evento ===
          'TurnoCancelado'
      )
    ) {

      this.alertaService.info(
        'Esta automatización usa solo mensaje',
        'Para confirmaciones y cancelaciones no necesitamos video en esta primera versión.'
      );

      return;
    }


    this.formulario.usarVideo =
      usarVideo;


    this.formulario.templateNombre =
      this.obtenerTemplateEvento(
        this.formulario.evento,
        usarVideo
      );


    this.formulario.templateIdioma =
      this.obtenerIdiomaEvento(
        this.formulario.evento
      );


    if (!usarVideo) {

      this.formulario.archivoUrl =
        null;

      this.videoNombreArchivo =
        '';
    }
  }

  seleccionarVideo(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const archivo =
      input.files?.[0];


    if (!archivo) {
      return;
    }


    const nombreMinuscula =
      archivo.name.toLowerCase();


    const esMp4 =
      archivo.type === 'video/mp4'
      ||
      nombreMinuscula.endsWith('.mp4');


    if (!esMp4) {

      this.alertaService.warning(
        'Formato no permitido',
        'Por ahora AmiApp acepta videos MP4.'
      );

      input.value = '';

      return;
    }


    const maximo =
      16 * 1024 * 1024;


    if (
      archivo.size >
      maximo
    ) {

      this.alertaService.warning(
        'El video es demasiado grande',
        'El archivo no puede superar los 16 MB.'
      );

      input.value = '';

      return;
    }


    this.cambiarTipoEnvio(
      true
    );


    this.subiendoVideo =
      true;

    this.videoNombreArchivo =
      archivo.name;


    this.automatizacionesService
      .subirVideoAutomatizacion(
        archivo
      )
      .subscribe({

        next: (respuesta) => {

          this.subiendoVideo =
            false;

          this.formulario.archivoUrl =
            respuesta.url;

          this.alertaService.success(
            'Video subido',
            'El archivo quedó guardado en R2 y listo para usar.'
          );
        },

        error: (error) => {

          this.subiendoVideo =
            false;

          this.formulario.archivoUrl =
            null;

          this.videoNombreArchivo =
            '';

          input.value =
            '';

          this.alertaService.error(
            'No pudimos subir el video',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
        }

      });
  }


  quitarVideo(): void {

    if (
      this.subiendoVideo
    ) {
      return;
    }


    this.formulario.archivoUrl =
      null;

    this.videoNombreArchivo =
      '';
  }


  private obtenerNombreArchivoDesdeUrl(
    url: string | null
  ): string {

    if (!url) {
      return '';
    }


    try {

      const pathname =
        new URL(url).pathname;

      const nombre =
        pathname
          .split('/')
          .filter(Boolean)
          .pop();

      return nombre
        ? decodeURIComponent(nombre)
        : 'video.mp4';

    }
    catch {

      const nombre =
        url
          .split('/')
          .filter(Boolean)
          .pop();

      return nombre
        ? nombre
        : 'video.mp4';
    }
  }


  // =====================================================
  // GUARDAR
  // =====================================================

  guardar(): void {

    const nombre =
      this.formulario.nombre.trim();

    const templateNombre =
      this.formulario.templateNombre.trim();

    const evento =
      this.formulario.evento;


    if (!nombre) {

      this.alertaService.warning(
        'Falta el nombre',
        'Ingresá un nombre para la automatización.'
      );

      return;
    }


    if (!templateNombre) {

      this.alertaService.warning(
        'Falta el template',
        'Ingresá el nombre exacto del template de WhatsApp.'
      );

      return;
    }


    if (this.subiendoVideo) {

      this.alertaService.info(
        'El video todavía se está subiendo',
        'Esperá unos segundos antes de guardar la automatización.'
      );

      return;
    }


    if (
      this.formulario.usarVideo
      &&
      !this.formulario.archivoUrl
    ) {

      this.alertaService.warning(
        'Falta el video',
        'Seleccioná y subí un MP4 antes de guardar.'
      );

      return;
    }


    if (
      evento ===
        'RecordatorioTurno'
      &&
      (
        !this.formulario.anticipacionMinutos
        ||
        this.formulario.anticipacionMinutos <= 0
      )
    ) {

      this.alertaService.warning(
        'Elegí cuándo enviar el recordatorio',
        'Seleccioná con cuánta anticipación querés avisarle al paciente.'
      );

      return;
    }


    if (
      !this.esEventoCumpleanos(
        evento
      )
      &&
      this.alcanceAutomatizacion ===
        'profesionales'
      &&
      this.profesionalesSeleccionadosIds
        .length === 0
    ) {

      this.alertaService.warning(
        'Elegí al menos un profesional',
        'Seleccioná uno o más profesionales para aplicar esta automatización.'
      );

      return;
    }


    const destinatarios:
      Array<string | null> =
        this.esEventoCumpleanos(
          evento
        )
        ||
        this.alcanceAutomatizacion ===
          'organizacion'

          ? [null]

          : [
              ...this
                .profesionalesSeleccionadosIds
            ];


    const requests =
      destinatarios.map(
        profesionalId => {

          const payload:
            GuardarAutomatizacionPayload = {

            nombre,

            evento,

            anticipacionMinutos:
              evento ===
                'RecordatorioTurno'
                ? this.formulario
                    .anticipacionMinutos
                : null,

            demoraMinutos:
              null,

            horaEnvio:
              null,

            canal:
              this.formulario.canal,

            profesionalId,

            activo:
              this.formulario.activo,

            acciones: [
              {
                orden: 1,

                tipo:
                  this.formulario
                    .usarVideo
                    ? 'Video'
                    : 'Mensaje',

                contenido:
                  null,

                archivoUrl:
                  this.formulario
                    .usarVideo
                    ? this.formulario
                        .archivoUrl
                    : null,

                templateNombre,

                templateIdioma:
                  this.obtenerIdiomaEvento(
                    evento
                  ),

                delayMinutos:
                  0,

                activo:
                  true
              }
            ]
          };


          const existente =
            this.buscarAutomatizacionExistente(
              evento,
              profesionalId
            );


          return existente

            ? this
                .automatizacionesService
                .actualizar(
                  existente.id,
                  payload
                )

            : this
                .automatizacionesService
                .crear(
                  payload
                );
        }
      );


    this.guardando =
      true;


    forkJoin(
      requests
    )
      .subscribe({

        next: () => {

          this.guardando =
            false;


          const cantidad =
            destinatarios.length;


          this.alertaService.success(
            cantidad > 1
              ? 'Automatizaciones guardadas'
              : (
                  this.editandoId
                    ? 'Automatización actualizada'
                    : 'Automatización guardada'
                ),
            cantidad > 1
              ? `La misma configuración quedó aplicada a ${cantidad} profesionales.`
              : 'Los cambios se guardaron correctamente.'
          );


          this.modoEditor =
            false;

          this.editandoId =
            null;

          this.formulario =
            this.formularioInicial();

          this.resetearAlcanceAutomatizacion();

          this.videoNombreArchivo =
            '';

          this.cargar();
        },

        error: (error) => {

          this.guardando =
            false;


          console.error(
            'Error guardando automatizaciones:',
            error
          );


          this.alertaService.error(
            'No pudimos guardar todas las automatizaciones',
            error?.error?.message
            ??
            'Alguna regla pudo haberse guardado antes del error. Recargá el listado y revisá los destinatarios.'
          );
        }

      });
  }


  // =====================================================
  // DESACTIVAR
  // =====================================================

  async desactivar(
    automatizacion: Automatizacion
  ): Promise<void> {

    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            'Desactivar automatización',

          mensaje:
            'AmiApp dejará de ejecutarla automáticamente.',

          textoConfirmar:
            'Desactivar',

          textoCancelar:
            'Cancelar',

          variante:
            'danger'
        });


    if (!confirmado) {
      return;
    }


    this.automatizacionesService
      .desactivar(
        automatizacion.id
      )
      .subscribe({

        next: () => {

          this.cargar();


          this.alertaService.success(
            'Automatización desactivada',
            'AmiApp dejó de ejecutar esta automatización.'
          );
        },

        error: (error) => {

          this.alertaService.error(
            'No pudimos desactivarla',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
        }

      });
  }

  // =====================================================
  // PROBAR
  // =====================================================

  async probar(
    profesionalId?:
      string | null
  ): Promise<void> {

    const profesionalIdPrueba =
      profesionalId === undefined
        ? this.profesionalSeleccionadoId
        : profesionalId;


    if (
      profesionalIdPrueba === null
      &&
      this.profesionalSeleccionadoId ===
        null
      &&
      !this.whatsAppConectado
    ) {

      this.alertaService.warning(
        'WhatsApp no está conectado',
        'Primero configurá el número general de WhatsApp de esta organización.'
      );

      return;
    }


    const numero =
      await this.dialogoService
        .entrada({
          titulo:
            'Enviar WhatsApp de prueba',

          mensaje:
            'Ingresá el número de destino en formato internacional, sin + ni espacios. Ejemplo Argentina: 54223...',

          label:
            'Número de destino',

          placeholder:
            '542235824005',

          textoConfirmar:
            'Enviar prueba',

          textoCancelar:
            'Cancelar',

          requerido:
            true,

          minLength:
            10,

          soloNumeros:
            true,

          inputMode:
            'tel'
        });


    if (!numero) {
      return;
    }


    this.automatizacionesService
      .probarTurnoCreado(
        numero,
        profesionalIdPrueba
      )
      .subscribe({

        next: (respuesta) => {

          if (
            respuesta?.success
          ) {

            this.alertaService.success(
              'Prueba enviada',
              respuesta?.message
              ??
              'El mensaje de prueba se envió correctamente.'
            );

            return;
          }


          this.alertaService.warning(
            'No se pudo enviar',
            respuesta?.message
            ??
            'Revisá la configuración e intentá nuevamente.'
          );
        },

        error: (error) => {

          this.alertaService.error(
            'Falló la prueba',
            error?.error?.message
            ??
            'Revisá la configuración de WhatsApp.'
          );
        }

      });
  }

  // =====================================================
  // UI
  // =====================================================

  tituloEvento(
    evento: string
  ): string {

    switch (evento) {

      case 'TurnoCreado':
        return 'Al reservar un turno';

      case 'RecordatorioTurno':
      case 'Recordatorio':
        return 'Recordatorio del turno';

      case 'TurnoConfirmado':
        return 'Cuando el paciente confirma';

      case 'TurnoCancelado':
        return 'Cuando el paciente cancela';

      case 'PostConsulta':
      case 'TurnoAtendido':
      case 'DiasDespues':
        return 'Post consulta';

      case 'Cumpleanos':
      case 'Cumpleaños':
        return 'Cumpleaños';

      default:
        return evento;
    }
  }


  descripcionEvento(
    evento: string
  ): string {

    switch (evento) {

      case 'TurnoCreado':
        return 'Se ejecuta automáticamente cuando el paciente crea una reserva desde la página pública.';

      case 'RecordatorioTurno':
      case 'Recordatorio':
        return 'Envía un recordatorio antes del turno y permite gestionar la asistencia.';

      case 'TurnoConfirmado':
        return 'Se ejecuta cuando el paciente confirma que va a asistir.';

      case 'TurnoCancelado':
        return 'Se ejecuta cuando el turno queda cancelado.';

      case 'PostConsulta':
      case 'TurnoAtendido':
      case 'DiasDespues':
        return 'Permite enviar seguimiento después de la consulta.';

      case 'Cumpleanos':
      case 'Cumpleaños':
        return 'Envía un saludo automático el día del cumpleaños.';

      default:
        return 'Automatización de AmiApp.';
    }
  }


  categoriaEvento(
    evento: string
  ): string {

    switch (evento) {

      case 'TurnoCreado':
        return 'RESERVA';

      case 'RecordatorioTurno':
      case 'Recordatorio':
        return 'ANTES DEL TURNO';

      case 'TurnoConfirmado':
        return 'CONFIRMACIÓN';

      case 'TurnoCancelado':
        return 'CANCELACIÓN';

      case 'PostConsulta':
      case 'TurnoAtendido':
      case 'DiasDespues':
        return 'POST CONSULTA';

      case 'Cumpleanos':
      case 'Cumpleaños':
        return 'PACIENTES';

      default:
        return 'AUTOMATIZACIÓN';
    }
  }


  iconoEvento(
    evento: string
  ): string {

    switch (evento) {

      case 'TurnoCreado':
        return '↗';

      case 'RecordatorioTurno':
      case 'Recordatorio':
        return '◷';

      case 'TurnoConfirmado':
        return '✓';

      case 'TurnoCancelado':
        return '×';

      case 'PostConsulta':
      case 'TurnoAtendido':
      case 'DiasDespues':
        return '→';

      case 'Cumpleanos':
      case 'Cumpleaños':
        return '✦';

      default:
        return '✦';
    }
  }


  private obtenerTemplateEvento(
    evento: string,
    usarVideo: boolean
  ): string {

    switch (evento) {

      case 'RecordatorioTurno':
        return usarVideo
          ? 'recordatorio_turno_video_amiapp'
          : 'recordatorio_turno_amiapp';

      case 'TurnoConfirmado':
        return 'turno_confirmado_amiapp';

      case 'TurnoCancelado':
        return 'turno_cancelado_amiapp';

      case 'PostConsulta':
        return usarVideo
          ? 'post_consulta_video_amiapp'
          : 'post_consulta_amiapp';

      case 'Cumpleanos':
        return usarVideo
          ? 'cumpleanos_video_amiapp'
          : 'cumpleanos_amiapp';

      case 'TurnoCreado':
      default:
        return usarVideo
          ? 'turno_reservado_video_amiapp'
          : 'turno_reservado_amiapp';
    }
  }


  private obtenerIdiomaEvento(
    evento: string
  ): string {

    switch (evento) {

      case 'TurnoCreado':
        return 'es_EC';

      case 'RecordatorioTurno':
      case 'Recordatorio':
      case 'TurnoConfirmado':
      case 'TurnoCancelado':
      case 'PostConsulta':
      case 'TurnoAtendido':
      case 'DiasDespues':
      case 'Cumpleanos':
      case 'Cumpleaños':
      default:
        return 'es_AR';
    }
  }


  private formularioParaEvento(
    evento: string
  ) {

    let nombre =
      'Nueva automatización';


    switch (evento) {

      case 'TurnoCreado':
        nombre =
          'Mensaje al reservar turno';
        break;

      case 'RecordatorioTurno':
        nombre =
          'Recordatorio del turno';
        break;

      case 'TurnoConfirmado':
        nombre =
          'Mensaje de turno confirmado';
        break;

      case 'TurnoCancelado':
        nombre =
          'Mensaje de turno cancelado';
        break;

      case 'PostConsulta':
        nombre =
          'Mensaje post consulta';
        break;

      case 'Cumpleanos':
        nombre =
          'Saludo de cumpleaños';
        break;
    }


    return {
      nombre,

      evento,

      canal:
        'WhatsApp',

      activo:
        true,

      anticipacionMinutos:
        evento === 'RecordatorioTurno'
          ? 1440
          : null,

      templateNombre:
        this.obtenerTemplateEvento(
          evento,
          false
        ),

      templateIdioma:
        this.obtenerIdiomaEvento(
          evento
        ),

      usarVideo:
        false,

      archivoUrl:
        null as string | null
    };
  }

  private formularioInicial() {

    return this.formularioParaEvento(
      'TurnoCreado'
    );
  }

}
