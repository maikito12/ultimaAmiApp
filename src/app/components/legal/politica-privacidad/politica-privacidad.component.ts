import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './politica-privacidad.component.html',
  styleUrl: './politica-privacidad.component.css'
})
export class PoliticaPrivacidadComponent {
  readonly ultimaActualizacion = '19 de octubre de 2026';

  volver(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign('/');
    }
  }

  irASeccion(event: Event): void {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    const href = anchor?.getAttribute('href');
    if (!href?.startsWith('#')) return;
    const section = document.getElementById(href.slice(1));
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
