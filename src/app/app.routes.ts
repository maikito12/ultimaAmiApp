import { Routes } from '@angular/router';

import { FormularioComponent } from './components/formulario/formulario.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { TurnosComponent } from './components/turnos-tabla/turnos-tabla.component';
import { PacientesListaComponent } from './components/clientes-tabla/clientes-tabla.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { InactividadComponent } from './inactividad/inactividad.component';
import { GestionEquipoComponent } from './components/gestion-equipo/gestion-equipo.component';
import { PrivacidadComponent } from './components/privacidad/privacidad.component';

import { authGuard } from './guards/auth.guard';
import { superAdminGuard } from './guards/super-admin.guard';

import { RegistroComponent } from './components/registro/registro.component';
import { SuscripcionComponent } from './components/suscripcion/suscripcion.component';
import { MiPerfilComponent } from './components/perfil-profesional/perfil-profesional.component';
import { PacienteDetalleComponent } from './components/paciente-detalle/paciente-detalle.component';
import { NuevoTurnoComponent } from './components/nuevo-turno/nuevo-turno.component';
import { ReservaOnlineComponent } from './components/reserva-online/reserva-online.component';
import { BloqueosAgendaComponent } from './components/bloqueos-agenda/bloqueos-agenda.component';
import { AutomatizacionesComponent } from './components/automatizaciones/automatizaciones.component';
import { SuperAdminComponent } from './components/super-admin/super-admin.component';


export const routes: Routes = [


  // ==========================================
  // PÚBLICO
  // ==========================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'privacidad',
    component: PrivacidadComponent
  },


  // ==========================================
  // PANEL ADMINISTRATIVO
  // ==========================================

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [
      authGuard
    ],

    children: [

      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },

      {
        path: 'inicio',
        component: InicioComponent
      },

      {
        path: 'turnos/nuevo',
        component: NuevoTurnoComponent
      },

      {
        path: 'turnos',
        component: TurnosComponent
      },

      {
        path: 'bloqueos-agenda',
        component: BloqueosAgendaComponent
      },

      {
        path: 'turnos/:id',

        loadComponent: () =>
          import(
            './components/turno-detalle/turno-detalle.component'
          )
            .then(
              m =>
                m.TurnoDetalleComponent
            )
      },

      {
        path: 'clientes',
        component: PacientesListaComponent
      },

      {
        path: 'clientes/:id',
        component: PacienteDetalleComponent
      },

      {
        path: 'estadisticas',
        component: EstadisticasComponent
      },

      {
        path: 'gestion-equipo',
        component: GestionEquipoComponent
      },

      {
        path: 'inactividad',
        component: InactividadComponent
      },

      {
        path: 'mi-perfil',
        component: MiPerfilComponent
      },

      {
        path: 'suscripcion',
        component: SuscripcionComponent
      },

      {
        path: 'reserva-online',
        component: ReservaOnlineComponent
      },

      {
        path: 'automatizaciones',
        component: AutomatizacionesComponent
      }

    ]
  },


  // ==========================================
  // REGISTRO
  // ==========================================

  {
    path: 'registro',
    component: RegistroComponent
  },


  // ==========================================
  // SUPER ADMIN
  // DETALLE / GESTIÓN DE ORGANIZACIÓN
  // ==========================================

  {
    path: 'super-admin/organizaciones/:id',

    loadComponent: () =>
      import(
        './components/super-admin-suscripcion-detalle/super-admin-suscripcion-detalle.component'
      )
        .then(
          m =>
            m.SuperAdminSuscripcionDetalleComponent
        ),

    canActivate: [
      superAdminGuard
    ]
  },


  // ==========================================
  // SUPER ADMIN
  // PANEL PRINCIPAL
  // ==========================================

  {
    path: 'super-admin',

    component:
      SuperAdminComponent,

    canActivate: [
      superAdminGuard
    ]
  },


  // ==========================================
  // RESERVA PÚBLICA POR ORGANIZACIÓN
  // ==========================================

  {
    path: 'reservar/:slug',
    component: FormularioComponent
  },


  // ==========================================
  // CUALQUIER RUTA DESCONOCIDA
  // ==========================================

  {
    path: '**',
    redirectTo: 'login'
  }

];