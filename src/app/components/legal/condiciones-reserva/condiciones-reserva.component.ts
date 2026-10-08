import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-condiciones-reserva',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './condiciones-reserva.component.html',
  styleUrl: './condiciones-reserva.component.css'
})
export class CondicionesReservaComponent {

  readonly ultimaActualizacion = '7 de octubre de 2026';


  // ==========================================
  // VOLVER
  // ==========================================

  volver(): void {

    // Si se abrió como una pestaña nueva,
    // cerramos esta pestaña.
    if (window.history.length <= 1) {
      window.close();
      return;
    }

    // Si se llegó navegando normalmente,
    // volvemos a la página anterior.
    window.history.back();
  }


  // ==========================================
  // MENÚ LATERAL
  // ==========================================

  irASeccion(
    event: Event
  ): void {

    const elemento =
      event.target as HTMLElement;

    const enlace =
      elemento.closest('a');

    if (!enlace) {
      return;
    }

    const href =
      enlace.getAttribute('href');

    if (
      !href ||
      !href.startsWith('#')
    ) {
      return;
    }

    event.preventDefault();

    const id =
      href.substring(1);

    const seccion =
      document.getElementById(id);

    if (!seccion) {
      return;
    }

    seccion.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

}