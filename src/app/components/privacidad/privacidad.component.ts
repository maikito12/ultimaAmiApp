import { Component } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-privacidad',
  imports: [],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.css'
})
export class PrivacidadComponent {

  constructor(private location: Location) {}


  irAtras() {
  console.log("El botón fue presionado");
  this.location.back();
}
}
