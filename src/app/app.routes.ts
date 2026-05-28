import { Routes } from '@angular/router';
import { FormularioComponent } from './components/formulario/formulario.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
// Importá los nuevos componentes que creaste
// Importaciones corregidas según tu estructura de carpetas real
import { InicioComponent } from './components/inicio/inicio.component';
import { TurnosComponent } from './components/turnos-tabla/turnos-tabla.component'; 
import { PacientesListaComponent } from './components/clientes-tabla/clientes-tabla.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { InactividadComponent } from './inactividad/inactividad.component';
import { GestionEquipoComponent } from './components/gestion-equipo/gestion-equipo.component';
import { PrivacidadComponent } from './components/privacidad/privacidad.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // 1. Ponemos las rutas específicas ANTES del slug
  { path: 'privacidad', component: PrivacidadComponent },
  
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'turnos', component: TurnosComponent },
      { path: 'clientes', component: PacientesListaComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'gestion-equipo', component: GestionEquipoComponent },
      { path: 'inactividad', component: InactividadComponent },
    ]
  },

  // 2. El slug va al final para que no "robe" las rutas fijas
  { path: ':slug', component: FormularioComponent },
  
  // 3. El comodín va último de todo
  { path: '**', redirectTo: 'login' }
];