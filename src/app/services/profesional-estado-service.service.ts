import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalEstadoServiceService {

private profesionalSource = new BehaviorSubject<any>(null);

  // Esto es lo que los componentes (Dashboard) van a escuchar
  profesionalActual$ = this.profesionalSource.asObservable();

  constructor() { }

  // Esta función la llamará el Sidebar cuando la secretaria cambie de médico
  cambiarProfesional(profesional: any) {
    this.profesionalSource.next(profesional);
  }

  // Esta función sirve para obtener el valor actual en cualquier momento
  getProfesionalActual() {
    return this.profesionalSource.getValue();
  }
}
