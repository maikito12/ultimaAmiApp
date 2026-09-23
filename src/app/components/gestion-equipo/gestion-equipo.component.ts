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
  DialogoService
} from '../../services/dialogo.service';

import {
  InvitacionService
} from '../../services/invitacion.service';

import {
  EquipoLimites,
  EquipoService,
  IntegranteEquipo
} from '../../services/equipo.service';

import {
  Invitacion,
  CreateInvitacion,
  EstadoInvitacion
} from '../../interfaces/invitacion';

import {
  RolOrganizacion
} from '../../interfaces/rol-organizacion';
import { AlertaService } from '../../services/alerta.service';


// ==========================================
// INTEGRANTE PARA LA VISTA
// ==========================================

interface Integrante {

  id: string;

  usuarioId: string;

  nombre: string;

  email: string;

  rol:
    'Profesional'
    | 'Secretaria';

  estado:
    'Activo'
    | 'Inactivo';

  profesionalOrganizacionId:
    string | null;

}


// ==========================================
// COMPONENTE
// ==========================================

@Component({

  selector:
    'app-gestion-equipo',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './gestion-equipo.component.html',

  styleUrl:
    './gestion-equipo.component.css'

})
export class GestionEquipoComponent
  implements OnInit {


  // ==========================================
  // ENUMS PARA HTML
  // ==========================================

  readonly EstadoInvitacion =
    EstadoInvitacion;


  // ==========================================
  // LÍMITES REALES DEL BACKEND
  // ==========================================

  limites:
    EquipoLimites =
      {
        maxProfesionales:
          0,

        maxSecretarias:
          0,

        maxUsuarios:
          0,

        profesionalesActuales:
          0,

        secretariasActuales:
          0,

        usuariosActuales:
          0
      };

  limitesCargados =
    false;


  // ==========================================
  // INTEGRANTES
  // ==========================================

  integrantes:
    Integrante[] =
      [];

  cargandoEquipo =
    false;


  // ==========================================
  // INVITACIONES
  // ==========================================

  invitaciones:
    Invitacion[] =
      [];

  invitacionGenerada:
    Invitacion | null =
      null;

  cargandoInvitaciones =
    false;

  generandoInvitacion =
    false;


  // ==========================================
  // BUSCADOR
  // ==========================================

  busqueda =
    '';


  // ==========================================
  // MODAL
  // ==========================================

  mostrarModalAgregar =
    false;

  tipoNuevoIntegrante:
    'Profesional'
    | 'Secretaria' =
      'Profesional';


  // ==========================================
  // CONFIGURACIÓN INVITACIÓN
  // ==========================================

  nuevaInvitacion: {

    rol:
      'Profesional'
      | 'Secretaria';

    diasValidez:
      number;

    usosMaximos:
      number;

  } = {

    rol:
      'Profesional',

    diasValidez:
      7,

    usosMaximos:
      10

  };


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private readonly invitacionService:
      InvitacionService,

    private readonly equipoService:
      EquipoService,

    private readonly alertaService:
      AlertaService,

    private readonly dialogoService:
      DialogoService
  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit():
    void {

    this.cargarEquipo();

    this.cargarInvitaciones();

  }


  // ==========================================
  // CARGAR EQUIPO REAL
  // ==========================================

  cargarEquipo():
    void {

    this.cargandoEquipo =
      true;


    this.equipoService
      .obtenerEquipo()
      .subscribe({

        next: (
          respuesta
        ) => {

          this.limites =
            respuesta.limites;


          this.limitesCargados =
            true;


          this.integrantes =
            (
              respuesta.integrantes
              ??
              []
            )
            .map(
              item =>
                this.mapearIntegrante(
                  item
                )
            );


          this.cargandoEquipo =
            false;

        },


        error: (
          err
        ) => {

          console.error(
            'Error al obtener equipo:',
            err
          );


          this.cargandoEquipo =
            false;


          this.alertaService.error(
            'No se pudo cargar el equipo',
            this.obtenerMensajeError(
              err,
              'Ocurrió un problema al obtener los integrantes.'
            )
          );

        }

      });

  }


  // ==========================================
  // MAPEAR INTEGRANTE
  // ==========================================

  private mapearIntegrante(
    item:
      IntegranteEquipo
  ): Integrante {

    return {

      id:
        item.id,

      usuarioId:
        item.usuarioId,

      nombre:
        item.nombre,

      email:
        item.email,

      rol:
        this.mapearRolEquipo(
          item.rol
        ),

      estado:
        item.activo
          ? 'Activo'
          : 'Inactivo',

      profesionalOrganizacionId:
        item.profesionalOrganizacionId

    };

  }


  private mapearRolEquipo(
    rol:
      IntegranteEquipo['rol']
  ):
    'Profesional'
    | 'Secretaria' {

    const texto =
      String(
        rol
      )
      .trim()
      .toLowerCase();


    if (
      rol === 3
      ||
      texto === '3'
      ||
      texto === 'secretaria'
    ) {

      return 'Secretaria';

    }


    return 'Profesional';

  }


  // ==========================================
  // CARGAR INVITACIONES
  // ==========================================

  cargarInvitaciones():
    void {

    this.cargandoInvitaciones =
      true;


    this.invitacionService
      .obtenerTodas()
      .subscribe({

        next: (
          respuesta
        ) => {

          this.invitaciones =
            respuesta;


          this.cargandoInvitaciones =
            false;

        },


        error: (
          err
        ) => {

          console.error(
            'Error al obtener invitaciones:',
            err
          );


          this.cargandoInvitaciones =
            false;


          this.alertaService.error(
            'No se pudieron cargar las invitaciones',
            this.obtenerMensajeError(
              err,
              'Intentá nuevamente.'
            )
          );

        }

      });

  }


  // ==========================================
  // GETTERS DE LÍMITES
  // ==========================================

  get maxProfesionales():
    number {

    return this.limites
      .maxProfesionales;

  }


  get maxSecretarias():
    number {

    return this.limites
      .maxSecretarias;

  }


  get maxUsuarios():
    number {

    return this.limites
      .maxUsuarios;

  }


  get profesionalesActuales():
    number {

    return this.limites
      .profesionalesActuales;

  }


  get secretariasActuales():
    number {

    return this.limites
      .secretariasActuales;

  }


  get usuariosActuales():
    number {

    return this.limites
      .usuariosActuales;

  }


  get porcentajeProfesionales():
    number {

    if (
      this.maxProfesionales <=
        0
    ) {

      return 0;

    }


    return Math.min(
      100,
      (
        this.profesionalesActuales
        /
        this.maxProfesionales
      )
      *
      100
    );

  }


  get porcentajeSecretarias():
    number {

    if (
      this.maxSecretarias <=
        0
    ) {

      return 0;

    }


    return Math.min(
      100,
      (
        this.secretariasActuales
        /
        this.maxSecretarias
      )
      *
      100
    );

  }


  get limiteProfesionalesAlcanzado():
    boolean {

    return (
      this.limitesCargados
      &&
      this.maxProfesionales >
        0
      &&
      this.profesionalesActuales >=
        this.maxProfesionales
    );

  }


  get limiteSecretariasAlcanzado():
    boolean {

    return (
      this.limitesCargados
      &&
      this.maxSecretarias >
        0
      &&
      this.secretariasActuales >=
        this.maxSecretarias
    );

  }


  get limiteUsuariosAlcanzado():
    boolean {

    return (
      this.limitesCargados
      &&
      this.maxUsuarios >
        0
      &&
      this.usuariosActuales >=
        this.maxUsuarios
    );

  }


  get mostrarAlertaLimite():
    boolean {

    return (
      this.limiteProfesionalesAlcanzado
      ||
      this.limiteSecretariasAlcanzado
      ||
      this.limiteUsuariosAlcanzado
    );

  }


  // ==========================================
  // INTEGRANTES FILTRADOS
  // ==========================================

  get integrantesFiltrados():
    Integrante[] {

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();


    if (!texto) {

      return this.integrantes;

    }


    return this.integrantes
      .filter(
        integrante =>

          integrante.nombre
            .toLowerCase()
            .includes(
              texto
            )

          ||

          integrante.email
            .toLowerCase()
            .includes(
              texto
            )

          ||

          integrante.rol
            .toLowerCase()
            .includes(
              texto
            )
      );

  }


  // ==========================================
  // ABRIR MODAL
  // ==========================================

  abrirAgregar(
    tipo:
      'Profesional'
      | 'Secretaria'
  ):
    void {

    if (
      this.limiteUsuariosAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'usuarios'
      );

      return;

    }


    if (
      tipo ===
        'Profesional'
      &&
      this.limiteProfesionalesAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'profesionales'
      );

      return;

    }


    if (
      tipo ===
        'Secretaria'
      &&
      this.limiteSecretariasAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'secretarias'
      );

      return;

    }


    this.seleccionarTipoIntegrante(
      tipo
    );


    this.nuevaInvitacion = {

      rol:
        tipo,

      diasValidez:
        7,

      usosMaximos:
        10

    };


    this.invitacionGenerada =
      null;


    this.mostrarModalAgregar =
      true;

  }


  // ==========================================
  // CAMBIAR ROL DE LA INVITACIÓN
  // ==========================================

  seleccionarTipoIntegrante(
    tipo:
      'Profesional'
      | 'Secretaria'
  ):
    void {

    if (
      tipo ===
        'Profesional'
      &&
      this.limiteProfesionalesAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'profesionales'
      );

      return;

    }


    if (
      tipo ===
        'Secretaria'
      &&
      this.limiteSecretariasAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'secretarias'
      );

      return;

    }


    this.tipoNuevoIntegrante =
      tipo;


    this.nuevaInvitacion.rol =
      tipo;

  }


  // ==========================================
  // CERRAR MODAL
  // ==========================================

  cerrarModalAgregar():
    void {

    this.mostrarModalAgregar =
      false;


    this.invitacionGenerada =
      null;

  }


  // ==========================================
  // CONTROLES INVITACIÓN
  // ==========================================

  aumentarDias():
    void {

    if (
      this.nuevaInvitacion
        .diasValidez >=
        30
    ) {

      return;

    }


    this.nuevaInvitacion
      .diasValidez++;

  }


  disminuirDias():
    void {

    if (
      this.nuevaInvitacion
        .diasValidez <=
        1
    ) {

      return;

    }


    this.nuevaInvitacion
      .diasValidez--;

  }


  aumentarUsos():
    void {

    if (
      this.nuevaInvitacion
        .usosMaximos >=
        10
    ) {

      return;

    }


    this.nuevaInvitacion
      .usosMaximos++;

  }


  disminuirUsos():
    void {

    if (
      this.nuevaInvitacion
        .usosMaximos <=
        1
    ) {

      return;

    }


    this.nuevaInvitacion
      .usosMaximos--;

  }


  // ==========================================
  // GENERAR INVITACIÓN
  // ==========================================

  generarInvitacion():
    void {

    if (
      this.limiteUsuariosAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'usuarios'
      );

      return;

    }


    if (
      this.nuevaInvitacion.rol ===
        'Profesional'
      &&
      this.limiteProfesionalesAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'profesionales'
      );

      return;

    }


    if (
      this.nuevaInvitacion.rol ===
        'Secretaria'
      &&
      this.limiteSecretariasAlcanzado
    ) {

      this.mostrarMensajeLimite(
        'secretarias'
      );

      return;

    }


    if (
      this.nuevaInvitacion
        .diasValidez <
        1
      ||
      this.nuevaInvitacion
        .diasValidez >
        30
    ) {

      this.alertaService.warning(
        'Validez incorrecta',
        'La invitación debe tener entre 1 y 30 días de validez.'
      );

      return;

    }


    if (
      this.nuevaInvitacion
        .usosMaximos <
        1
      ||
      this.nuevaInvitacion
        .usosMaximos >
        10
    ) {

      this.alertaService.warning(
        'Cantidad incorrecta',
        'La invitación debe permitir entre 1 y 10 usos.'
      );

      return;

    }


    const rolBackend =
      this.nuevaInvitacion.rol ===
        'Profesional'

        ? RolOrganizacion.Profesional

        : RolOrganizacion.Secretaria;


    const datos:
      CreateInvitacion =
      {

        rol:
          rolBackend,

        diasValidez:
          this.nuevaInvitacion
            .diasValidez,

        usosMaximos:
          this.nuevaInvitacion
            .usosMaximos

      };


    this.generandoInvitacion =
      true;


    this.invitacionService
      .generar(
        datos
      )
      .subscribe({

        next: (
          respuesta
        ) => {

          this.invitacionGenerada =
            respuesta;


          this.invitaciones
            .unshift(
              respuesta
            );


          this.generandoInvitacion =
            false;


          this.mostrarModalAgregar =
            false;


          this.alertaService.success(
            'Código generado',
            `El código ${respuesta.codigo} fue creado correctamente.`,
            2500
          );

        },


        error: (
          err
        ) => {

          console.error(
            'Error al generar invitación:',
            err
          );


          this.generandoInvitacion =
            false;


          this.alertaService.error(
            'No se pudo generar el código',
            this.obtenerMensajeError(
              err,
              'Ocurrió un problema al crear la invitación.'
            )
          );

        }

      });

  }


  // ==========================================
  // COPIAR CÓDIGO
  // ==========================================

  copiarCodigo(
    codigo:
      string
  ):
    void {

    navigator.clipboard
      .writeText(
        codigo
      )
      .then(
        () => {

          this.alertaService.success(
            'Código copiado',
            'Ya podés compartirlo.',
            1800
          );

        }
      )
      .catch(
        err => {

          console.error(
            'No se pudo copiar:',
            err
          );


          this.alertaService.error(
            'No se pudo copiar',
            'Copiá el código manualmente.'
          );

        }
      );

  }


  // ==========================================
  // TEXTO DEL ROL DE INVITACIÓN
  // ==========================================

  obtenerRolTexto(
    rol:
      RolOrganizacion
      | number
  ):
    string {

    switch (
      rol
    ) {

      case RolOrganizacion.Profesional:
        return 'Profesional';

      case RolOrganizacion.Secretaria:
        return 'Secretaria';

      default:
        return 'Desconocido';

    }

  }


  // ==========================================
  // TEXTO DEL ESTADO
  // ==========================================

  obtenerEstadoTexto(
    estado:
      EstadoInvitacion
  ):
    string {

    switch (
      estado
    ) {

      case EstadoInvitacion.Activa:
        return 'Activa';

      case EstadoInvitacion.Utilizada:
        return 'Utilizada';

      case EstadoInvitacion.Expirada:
        return 'Expirada';

      case EstadoInvitacion.Cancelada:
        return 'Cancelada';

      default:
        return 'Desconocido';

    }

  }


  // ==========================================
  // INVITACIÓN ACTIVA
  // ==========================================

  esInvitacionActiva(
    invitacion:
      Invitacion
  ):
    boolean {

    return (
      invitacion.estado ===
        EstadoInvitacion.Activa
    );

  }


  // ==========================================
  // CANCELAR INVITACIÓN
  // ==========================================

  async cancelarInvitacion(
    invitacion:
      Invitacion
  ):
    Promise<void> {

    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            '¿Revocar código?',

          mensaje:
            `El código ${invitacion.codigo} dejará de funcionar. Las personas que ya lo utilizaron seguirán dentro de la organización.`,

          textoConfirmar:
            'Sí, revocar',

          textoCancelar:
            'Cancelar',

          variante:
            'danger'
        });


    if (
      !confirmado
    ) {

      return;

    }


    this.invitacionService
      .cancelar(
        invitacion.id
      )
      .subscribe({

        next: () => {

          const index =
            this.invitaciones
              .findIndex(
                item =>
                  item.id ===
                    invitacion.id
              );


          if (
            index !==
              -1
          ) {

            this.invitaciones[
              index
            ] =
              {

                ...this.invitaciones[
                  index
                ],

                estado:
                  EstadoInvitacion.Cancelada

              };

          }


          this.alertaService.success(
            'Código revocado',
            'Este código ya no puede utilizarse.',
            2200
          );

        },


        error: (
          err
        ) => {

          console.error(
            'Error al cancelar invitación:',
            err
          );


          this.alertaService.error(
            'No se pudo revocar',
            this.obtenerMensajeError(
              err,
              'No se pudo revocar el código.'
            )
          );

        }

      });

  }


  // ==========================================
  // DESACTIVAR INTEGRANTE REAL
  // ==========================================

  async eliminarIntegrante(
    integrante:
      Integrante
  ):
    Promise<void> {

    if (
      integrante.estado ===
        'Inactivo'
    ) {

      return;

    }


    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            '¿Quitar acceso?',

          mensaje:
            `Se quitará el acceso de ${integrante.nombre} a esta organización.`,

          textoConfirmar:
            'Quitar acceso',

          textoCancelar:
            'Cancelar',

          variante:
            'danger'
        });


    if (
      !confirmado
    ) {

      return;

    }


    this.equipoService
      .desactivarIntegrante(
        integrante.id
      )
      .subscribe({

        next: (
          respuesta
        ) => {

          this.alertaService.success(
            'Acceso desactivado',
            respuesta.message,
            2200
          );


          this.cargarEquipo();

        },


        error: (
          err
        ) => {

          console.error(
            'Error al desactivar integrante:',
            err
          );


          this.alertaService.error(
            'No se pudo quitar el acceso',
            this.obtenerMensajeError(
              err,
              'Intentá nuevamente.'
            )
          );

        }

      });

  }


  // ==========================================
  // INICIAL
  // ==========================================

  obtenerInicial(
    nombre:
      string
  ):
    string {

    return (
      nombre
        ?.trim()
        .charAt(0)
        .toUpperCase()
      ||
      '?'
    );

  }


  // ==========================================
  // MENSAJE LÍMITE
  // ==========================================

  private mostrarMensajeLimite(
    tipo:
      string
  ):
    void {

    this.alertaService.info(
      'Límite alcanzado',
      `Tu plan actual no permite agregar más ${tipo}.`
    );

  }


  // ==========================================
  // MENSAJES DE ERROR
  // ==========================================

  private obtenerMensajeError(
    error:
      any,

    fallback:
      string
  ):
    string {

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
