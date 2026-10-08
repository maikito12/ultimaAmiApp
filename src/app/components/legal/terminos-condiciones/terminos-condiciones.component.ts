import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './terminos-condiciones.component.html',
  styleUrl: './terminos-condiciones.component.css'
})
export class TerminosCondicionesComponent {

  readonly ultimaActualizacion = '7 de octubre de 2026';

 volver(): void {

  // Si esta página se abrió como una pestaña nueva
  // desde Registro o Reserva, cerramos la pestaña.
  if (window.history.length <= 1) {
    window.close();
    return;
  }

  // Si se llegó navegando normalmente,
  // volvemos a la página anterior.
  window.history.back();
}

  irASeccion(event: Event): void {

    const elemento = event.target as HTMLElement;

    const enlace = elemento.closest('a');

    if (!enlace) {
      return;
    }

    const href = enlace.getAttribute('href');

    if (!href || !href.startsWith('#')) {
      return;
    }

    event.preventDefault();

    const id = href.substring(1);

    const seccion = document.getElementById(id);

    if (!seccion) {
      return;
    }

    seccion.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}