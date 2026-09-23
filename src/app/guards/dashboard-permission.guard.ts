import {
  Routes
} from '@angular/router';

import {
  FormularioComponent
} from './components/formulario/formulario.component';

import {
  DashboardComponent
} from './components/dashboard/dashboard.component';

import {
  LoginComponent
} from './components/login/login.component';

import {
  InicioComponent
} from './components/inicio/inicio.component';

import {
  TurnosComponent
} from './components/turnos-tabla/turnos-tabla.component';

import {
  PacientesListaComponent
} from './components/clientes-tabla/clientes-tabla.component';

import {
  EstadisticasComponent
} from './components/estadisticas/estadisticas.component';

import {
  InactividadComponent
} from './inactividad/inactividad.component';

import {
  GestionEquipoComponent
} from './components/gestion-equipo/gestion-equipo.component';

import {
  PrivacidadComponent
} from './components/privacidad/privacidad.component';

import {
  RegistroComponent
} from './components/registro/registro.component';

import {
  SuscripcionComponent
} from './components/suscripcion/suscripcion.component';

import {
  MiPerfilComponent
} from './components/perfil-profesional/perfil-profesional.component';

import {
  PacienteDetalleComponent
} from './components/paciente-detalle/paciente-detalle.component';

import {
  NuevoTurnoComponent
} from './components/nuevo-turno/nuevo-turno.component';

import {
  ReservaOnlineComponent
} from './components/reserva-online/reserva-online.component';

import {
  BloqueosAgendaComponent
} from './components/bloqueos-agenda/bloqueos-agenda.component';

import {
  AutomatizacionesComponent
} from './components/automatizaciones/automatizaciones.component';

import {
  SuperAdminComponent
} from './components/super-admin/super-admin.component';


import {
  authGuard
} from './guards/auth.guard';

import {
  superAdminGuard
} from './guards/super-admin.guard';

import {
  dashboardPermissionGuard
} from './guards/dashboard-permission.guard';


export const routes:
  Routes = [


  // =====================================================
  // PÚBLICO
  // =====================================================

  {
    path: '',

    redirectTo: 'login',

    pathMatch: 'full'
  },


  {
    path: 'login',

    component:
      LoginComponent
  },


  {
    path: 'privacidad',

    component:
      PrivacidadComponent
  },


  {
    path: 'registro',

    component:
      RegistroComponent
  },


  // =====================================================
  // DASHBOARD
  // =====================================================

  {
    path:
      'dashboard',

    component:
      DashboardComponent,

    canActivate: [
      authGuard
    ],

    children: [


      // =================================================
      // REDIRECCIÓN
      // =================================================

      {
        path: '',

        redirectTo:
          'inicio',

        pathMatch:
          'full'
      },


      // =================================================
      // INICIO
      // ADMIN / PROFESIONAL / SECRETARÍA
      // =================================================

      {
        path:
          'inicio',

        component:
          InicioComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2,
            3
          ]

        }
      },


      // =================================================
      // NUEVO TURNO
      // ADMIN / PROFESIONAL / SECRETARÍA
      // =================================================

      {
        path:
          'turnos/nuevo',

        component:
          NuevoTurnoComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2,
            3
          ]

        }
      },


      // =================================================
      // TURNOS
      // ADMIN / PROFESIONAL / SECRETARÍA
      // =================================================

      {
        path:
          'turnos',

        component:
          TurnosComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2,
            3
          ]

        }
      },


      // =================================================
      // DETALLE TURNO
      // ADMIN / PROFESIONAL / SECRETARÍA
      // =================================================

      {
        path:
          'turnos/:id',

        loadComponent:
          () =>
            import(
              './components/turno-detalle/turno-detalle.component'
            )
              .then(
                modulo =>
                  modulo.TurnoDetalleComponent
              ),

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2,
            3
          ]

        }
      },


      // =================================================
      // BLOQUEOS DE AGENDA
      // PROFESIONAL O ADMIN + PROFESIONAL
      // =================================================

      {
        path:
          'bloqueos-agenda',

        component:
          BloqueosAgendaComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          requiereProfesional:
            true

        }
      },


      // =================================================
      // PACIENTES
      // ADMIN / PROFESIONAL / SECRETARÍA
      // =================================================

      {
        path:
          'clientes',

        component:
          PacientesListaComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2,
            3
          ]

        }
      },


      // =================================================
      // DETALLE PACIENTE
      // ADMIN / PROFESIONAL / SECRETARÍA
      // =================================================

      {
        path:
          'clientes/:id',

        component:
          PacienteDetalleComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2,
            3
          ]

        }
      },


      // =================================================
      // ESTADÍSTICAS
      // ADMIN / PROFESIONAL
      // =================================================

      {
        path:
          'estadisticas',

        component:
          EstadisticasComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2
          ]

        }
      },


      // =================================================
      // AUTOMATIZACIONES
      // ADMIN / PROFESIONAL
      // =================================================

      {
        path:
          'automatizaciones',

        component:
          AutomatizacionesComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2
          ]

        }
      },


      // =================================================
      // GESTIÓN DE EQUIPO
      // SOLO ADMIN
      // =================================================

      {
        path:
          'gestion-equipo',

        component:
          GestionEquipoComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1
          ]

        }
      },


      // =================================================
      // INFORMACIÓN GENERAL
      // SOLO ADMIN
      // =================================================

      {
        path:
          'inactividad',

        component:
          InactividadComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1
          ]

        }
      },


      // =================================================
      // RESERVA ONLINE
      // SOLO ADMIN
      // =================================================

      {
        path:
          'reserva-online',

        component:
          ReservaOnlineComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1
          ]

        }
      },


      // =================================================
      // MI PERFIL
      // TODOS
      // =================================================

      {
        path:
          'mi-perfil',

        component:
          MiPerfilComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1,
            2,
            3
          ]

        }
      },


      // =================================================
      // SUSCRIPCIÓN
      // SOLO ADMIN
      // =================================================

      {
        path:
          'suscripcion',

        component:
          SuscripcionComponent,

        canActivate: [
          dashboardPermissionGuard
        ],

        data: {

          roles: [
            1
          ]

        }
      }

    ]

  },


  // =====================================================
  // SUPER ADMIN AMIAPP
  // =====================================================

  {
    path:
      'super-admin',

    component:
      SuperAdminComponent,

    canActivate: [
      superAdminGuard
    ]
  },


  // =====================================================
  // RESERVA PÚBLICA POR ORGANIZACIÓN
  // =====================================================

  {
    path:
      'reservar/:slug',

    component:
      FormularioComponent
  },


  // =====================================================
  // RUTA DESCONOCIDA
  // =====================================================

  {
    path:
      '**',

    redirectTo:
      'login'
  }

];