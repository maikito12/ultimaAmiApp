
import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-eliminacion-datos',
  standalone: true,
  imports: [],
  templateUrl: './eliminacion-datos.component.html',
  styleUrl: './eliminacion-datos.component.css'
})
export class EliminacionDatosComponent {

  constructor(
    private location: Location
  ) {}

  irAtras(): void {
    this.location.back();
  }
}
