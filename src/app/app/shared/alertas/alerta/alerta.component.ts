import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlertaItem, AlertaService, TipoAlerta } from '../../../../services/alerta.service';



@Component({
  selector: 'app-alerta',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './alerta.component.html',
  styleUrl: './alerta.component.css'
})
export class AlertaComponent {


  constructor(
    private readonly alertaService:
      AlertaService
  ) {}
get alertas$() {
  return this.alertaService.alertas$;
}
  cerrar(
    id: string
  ): void {
    this.alertaService.cerrar(id);
  }

  icono(
    tipo: TipoAlerta
  ): string {

    switch (tipo) {

      case 'success':
        return '✓';

      case 'error':
        return '×';

      case 'warning':
        return '!';

      case 'info':
      default:
        return 'i';
    }
  }

  etiqueta(
    tipo: TipoAlerta
  ): string {

    switch (tipo) {

      case 'success':
        return 'Éxito';

      case 'error':
        return 'Error';

      case 'warning':
        return 'Advertencia';

      case 'info':
      default:
        return 'Información';
    }
  }

  trackById(
    _index: number,
    alerta: AlertaItem
  ): string {
    return alerta.id;
  }
}
