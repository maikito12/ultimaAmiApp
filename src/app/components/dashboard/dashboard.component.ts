import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterModule
} from '@angular/router';

import {
  SidebarComponent
} from '../../sidebar-component/sidebar-component.component';

import {
  AuthService
} from '../../services/auth-service.service';

import {
  SuscripcionService,

} from '../../services/suscripcion.service';
import { Suscripcion } from '../../interfaces/suscripcion';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  menuOpen = false;

  profesional: any = null;

  suscripcion: Suscripcion | null = null;

  cargandoSuscripcion = true;

  constructor(
    private authService: AuthService,
    private suscripcionService: SuscripcionService
  ) {}

  ngOnInit(): void {

    this.profesional =
      this.authService.getUsuario();

    this.obtenerSuscripcion();
  }

  private obtenerSuscripcion(): void {

    this.suscripcionService
      .obtenerActual()
      .subscribe({

        next: (suscripcion) => {

          this.suscripcion = suscripcion;

          this.cargandoSuscripcion = false;

          console.log(
            'Suscripción actual:',
            suscripcion
          );
        },

        error: (error) => {

          this.cargandoSuscripcion = false;

          // 404 significa que todavía
          // no existe una suscripción.
          if (error.status === 404) {
            this.suscripcion = null;
            return;
          }

          console.error(
            'Error obteniendo suscripción:',
            error
          );
        }

      });
  }

  tieneSuscripcionPendiente(): boolean {

    return this.suscripcion?.estado === 'Pendiente';
  }

  tieneSuscripcionActiva(): boolean {

    return this.suscripcion?.estado === 'Activa';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}