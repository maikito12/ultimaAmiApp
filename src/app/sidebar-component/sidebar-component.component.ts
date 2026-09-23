import {
  Component,
  Input,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterModule
} from '@angular/router';

import {
  AuthService
} from '../services/auth-service.service';

import {
  ContextoService,
  OrganizacionContexto
} from '../services/contexto.service';

import {
  AlertaService
} from '../services/alerta.service';

import {
  DialogoService
} from '../services/dialogo.service';


@Component({

  selector: 'app-sidebar',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl:
    './sidebar-component.component.html',

  styleUrl:
    './sidebar-component.component.css'

})
export class SidebarComponent
  implements OnInit {


  // =====================================================
  // USUARIO ACTUAL
  // =====================================================

  usuarioActual:
    any =
      null;


  // =====================================================
  // INPUTS
  // =====================================================

  @Input()
  seccion:
    string =
      'inicio';


  @Input()
  menuOpen:
    boolean =
      false;


  // =====================================================
  // CONTEXTO / ORGANIZACIÓN ACTIVA
  // =====================================================

  organizacionesContexto:
    OrganizacionContexto[] =
      [];


  organizacionActual:
    OrganizacionContexto | null =
      null;


  cargandoOrganizaciones =
    false;


  cambiandoOrganizacion =
    false;


  selectorOrganizacionesAbierto =
    false;


  // =====================================================
  // SECCIONES ABIERTAS
  // =====================================================

  seccionesAbiertas = {

    general:
      true,

    agenda:
      true,

    gestion:
      true,

    organizacion:
      false,

    automatizacion:
      false,

    cuenta:
      true

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly router:
      Router,

    private readonly authService:
      AuthService,

    private readonly contextoService:
      ContextoService,

    private readonly alertaService:
      AlertaService,

    private readonly dialogoService:
      DialogoService

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit():
    void {

    this.usuarioActual =
      this.authService
        .getUsuario();


    this.cargarOrganizaciones();

  }


  // =====================================================
  // ROL ACTUAL
  // =====================================================

  get rol():
    number {

    if (
      this.organizacionActual
    ) {

      return Number(
        this.organizacionActual
          .rol
      );

    }


    return Number(
      this.usuarioActual
        ?.rol
      ??
      0
    );

  }


  // =====================================================
  // ADMIN
  // =====================================================

  get esAdmin():
    boolean {

    return (
      this.rol === 1
    );

  }


  // =====================================================
  // PROFESIONAL COMO ROL PRINCIPAL
  // =====================================================

  get esProfesional():
    boolean {

    return (
      this.rol === 2
    );

  }


  // =====================================================
  // SECRETARÍA
  // =====================================================

  get esSecretaria():
    boolean {

    return (
      this.rol === 3
    );

  }


  // =====================================================
  // CAPACIDAD PROFESIONAL
  // =====================================================

  /*
   *
   * Acá diferenciamos:
   *
   * rol = Profesional
   *
   * de
   *
   * Admin + Profesional
   *
   * Ejemplo:
   *
   * rol = 1
   * esProfesional = true
   *
   */

  get tieneCapacidadProfesional():
    boolean {

    if (
      this.organizacionActual
    ) {

      return (
        this.organizacionActual
          .esProfesional
        ||
        this.esProfesional
      );

    }


    return (
      this.contextoService
        .esProfesionalActual()
      ||
      this.esProfesional
    );

  }


  // =====================================================
  // PERMISOS
  // =====================================================

  tienePermiso(
    nombreSeccion:
      string
  ):
    boolean {

    if (
      !this.usuarioActual
    ) {

      return false;

    }


    const permiso =
      nombreSeccion
        .trim()
        .toLowerCase();


    // ===================================================
    // ADMIN
    // ===================================================

    /*
     * El administrador controla
     * toda la organización.
     */

    if (
      this.esAdmin
    ) {

      return true;

    }


    // ===================================================
    // PROFESIONAL
    // ===================================================

    /*
     * El profesional accede solamente
     * a sus herramientas operativas.
     */

    if (
      this.esProfesional
    ) {

      const permisosProfesional =
        new Set<string>([

          'inicio',

          'turnos',

          'clientes',

          'estadísticas',

          'automatizaciones'

        ]);


      return (
        permisosProfesional
          .has(
            permiso
          )
      );

    }


    // ===================================================
    // SECRETARÍA
    // ===================================================

    /*
     * Permisos base de Secretaría.
     *
     * Después podemos reemplazar esto
     * por permisos individuales que
     * vengan desde backend.
     */

    if (
      this.esSecretaria
    ) {

      const permisosSecretaria =
        new Set<string>([

          'inicio',

          'turnos',

          'clientes'

        ]);


      return (
        permisosSecretaria
          .has(
            permiso
          )
      );

    }


    return false;

  }


  // =====================================================
  // MOSTRAR ORGANIZACIÓN
  // =====================================================

  get puedeAdministrarOrganizacion():
    boolean {

    return this.esAdmin;

  }


  // =====================================================
  // TOGGLE SECCIÓN
  // =====================================================

  toggleSeccion(
    seccion:
      keyof typeof this.seccionesAbiertas
  ):
    void {

    this.seccionesAbiertas[
      seccion
    ] =
      !this.seccionesAbiertas[
        seccion
      ];

  }


  // =====================================================
  // CARGAR ORGANIZACIONES
  // =====================================================

  cargarOrganizaciones():
    void {

    if (
      this.cargandoOrganizaciones
    ) {

      return;

    }


    this.cargandoOrganizaciones =
      true;


    this.contextoService
      .obtenerOrganizaciones()
      .subscribe({

        next:
          (
            organizaciones
          ) => {

            this.organizacionesContexto =
              organizaciones;


            this.organizacionActual =
              organizaciones.find(
                organizacion =>
                  organizacion.esActual
              )
              ??
              organizaciones[0]
              ??
              null;


            this.cargandoOrganizaciones =
              false;

          },


        error:
          (
            error
          ) => {

            this.cargandoOrganizaciones =
              false;


            console.error(
              'Error cargando organizaciones:',
              error
            );


            this.alertaService.error(

              'No pudimos cargar tus organizaciones',

              error?.error?.message
              ??
              'Intentá nuevamente.'

            );

          }

      });

  }


  // =====================================================
  // ABRIR / CERRAR SELECTOR
  // =====================================================

  toggleSelectorOrganizaciones():
    void {

    if (
      this.organizacionesContexto
        .length <= 1
    ) {

      return;

    }


    this.selectorOrganizacionesAbierto =
      !this.selectorOrganizacionesAbierto;

  }


  // =====================================================
  // CAMBIAR ORGANIZACIÓN
  // =====================================================

  cambiarOrganizacion(
    organizacion:
      OrganizacionContexto
  ):
    void {

    if (
      this.cambiandoOrganizacion
    ) {

      return;

    }


    if (
      organizacion.organizacionId
      ===
      this.organizacionActual
        ?.organizacionId
    ) {

      this.selectorOrganizacionesAbierto =
        false;


      return;

    }


    this.cambiandoOrganizacion =
      true;


    this.contextoService
      .cambiarOrganizacion(
        organizacion
          .organizacionId
      )
      .subscribe({

        next:
          () => {

            this.cambiandoOrganizacion =
              false;


            this.selectorOrganizacionesAbierto =
              false;


            /*
             * ContextoService ya guardó:
             *
             * JWT
             * organización
             * rol
             * capacidad profesional
             */

            window.location.href =
              '/dashboard/inicio';

          },


        error:
          (
            error
          ) => {

            this.cambiandoOrganizacion =
              false;


            console.error(
              'Error cambiando organización:',
              error
            );


            this.alertaService.error(

              'No pudimos cambiar de organización',

              error?.error?.message
              ??
              'Intentá nuevamente.'

            );

          }

      });

  }


  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  async cerrarSesion():
    Promise<void> {

    const confirmar =
      await this.dialogoService
        .confirmar({

          titulo:
            'Cerrar sesión',

          mensaje:
            'Vas a salir de tu cuenta.',

          textoConfirmar:
            'Sí, salir',

          textoCancelar:
            'Cancelar',

          variante:
            'danger'

        });


    if (
      !confirmar
    ) {

      return;

    }


    this.authService
      .logout();


    this.router
      .navigate([
        '/login'
      ]);

  }


  // =====================================================
  // NOMBRE DEL ROL
  // =====================================================

  nombreRol(
    rol:
      number
  ):
    string {

    switch (
      Number(
        rol
      )
    ) {

      case 1:

        return 'Administrador';


      case 2:

        return 'Profesional';


      case 3:

        return 'Secretaría';


      default:

        return 'Miembro';

    }

  }

}