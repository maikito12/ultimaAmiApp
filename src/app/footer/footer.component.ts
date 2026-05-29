import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
constructor(private router: Router) {}

  getSlugActual() {
    const url = this.router.url; // Ejemplo: "/nutricion"
    
    // Si la URL es solo "/" o "/terminos", no hay slug
    if (url === '/' || url.includes('/privacidad')) {
      return null;
    }

    // Esto toma el primer segmento después de la barra
    // Si la URL es "/nutricion", esto devuelve "nutricion"
    return url.replace('/', '');
  }
}
