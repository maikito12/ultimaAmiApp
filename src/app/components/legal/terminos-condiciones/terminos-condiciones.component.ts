import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terminos-condiciones.component.html',
  styleUrl: './terminos-condiciones.component.css'
})
export class TerminosCondicionesComponent {
  readonly ultimaActualizacion = '19 de octubre de 2026';

  volver(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign('/');
    }
  }

  irASeccion(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')?.slice(1);
    if (!id) return;
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
