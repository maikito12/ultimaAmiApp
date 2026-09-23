import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogoActual, DialogoService } from '../../../../services/dialogo.service';




@Component({
  selector: 'app-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dialogo.component.html',
  styleUrl: './dialogo.component.css'
})
export class DialogoComponent {

  valorEntrada =
    '';

  errorEntrada =
    '';


  constructor(
    private readonly dialogoService:
      DialogoService
  ) {}


  get dialogo$() {
    return this.dialogoService.dialogo$;
  }


  preparar(
    dialogo: DialogoActual
  ): void {

    if (
      dialogo.tipo !==
      'entrada'
    ) {
      return;
    }


    if (
      this.valorEntrada ===
      ''
    ) {

      this.valorEntrada =
        dialogo.valorInicial;
    }
  }


  onInput(
    dialogo: DialogoActual
  ): void {

    this.errorEntrada =
      '';


    if (
      dialogo.soloNumeros
    ) {

      this.valorEntrada =
        String(
          this.valorEntrada ?? ''
        )
          .replace(
            /\D/g,
            ''
          );
    }
  }


  confirmar(
    dialogo: DialogoActual
  ): void {

    if (
      dialogo.tipo ===
      'confirmacion'
    ) {

      this.dialogoService.resolver();

      this.resetEntrada();

      return;
    }


    const valor =
      String(
        this.valorEntrada ?? ''
      )
        .trim();


    if (
      dialogo.requerido
      &&
      !valor
    ) {

      this.errorEntrada =
        'Completá este campo.';

      return;
    }


    if (
      dialogo.minLength >
      0
      &&
      valor.length <
      dialogo.minLength
    ) {

      this.errorEntrada =
        `Ingresá al menos ${dialogo.minLength} caracteres.`;

      return;
    }


    this.dialogoService.resolver(
      valor
    );


    this.resetEntrada();
  }


  cancelar(): void {

    this.dialogoService.cancelar();

    this.resetEntrada();
  }


  backdrop(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.cancelar();
    }
  }


  tecla(
    event: KeyboardEvent,
    dialogo: DialogoActual
  ): void {

    if (
      event.key ===
      'Escape'
    ) {

      event.preventDefault();

      this.cancelar();

      return;
    }


    if (
      event.key ===
      'Enter'
    ) {

      event.preventDefault();

      this.confirmar(
        dialogo
      );
    }
  }


  private resetEntrada(): void {

    this.valorEntrada =
      '';

    this.errorEntrada =
      '';
  }
}
