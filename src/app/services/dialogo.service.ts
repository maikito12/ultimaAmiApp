import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export type VarianteDialogo =
  | 'default'
  | 'danger';


export interface DialogoConfirmacionConfig {
  titulo: string;
  mensaje?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: VarianteDialogo;
}


export interface DialogoEntradaConfig {
  titulo: string;
  mensaje?: string;
  label?: string;
  placeholder?: string;
  valorInicial?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  requerido?: boolean;
  minLength?: number;
  soloNumeros?: boolean;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  variante?: VarianteDialogo;
}


export interface DialogoActual {
  tipo: 'confirmacion' | 'entrada';

  titulo: string;

  mensaje: string | null;

  textoConfirmar: string;

  textoCancelar: string;

  variante: VarianteDialogo;

  label: string | null;

  placeholder: string | null;

  valorInicial: string;

  requerido: boolean;

  minLength: number;

  soloNumeros: boolean;

  inputMode:
    | 'text'
    | 'numeric'
    | 'tel'
    | 'email';
}


@Injectable({
  providedIn: 'root'
})
export class DialogoService {

  private readonly dialogoSubject =
    new BehaviorSubject<DialogoActual | null>(
      null
    );


  readonly dialogo$ =
    this.dialogoSubject.asObservable();


  private resolverConfirmacion:
    ((resultado: boolean) => void)
    | null =
      null;


  private resolverEntrada:
    ((resultado: string | null) => void)
    | null =
      null;


  confirmar(
    config: DialogoConfirmacionConfig
  ): Promise<boolean> {

    this.cancelarPendiente();


    const dialogo: DialogoActual = {
      tipo:
        'confirmacion',

      titulo:
        String(
          config.titulo ?? ''
        ).trim(),

      mensaje:
        String(
          config.mensaje ?? ''
        ).trim()
          ||
          null,

      textoConfirmar:
        String(
          config.textoConfirmar
          ??
          'Confirmar'
        ).trim(),

      textoCancelar:
        String(
          config.textoCancelar
          ??
          'Cancelar'
        ).trim(),

      variante:
        config.variante
        ??
        'default',

      label:
        null,

      placeholder:
        null,

      valorInicial:
        '',

      requerido:
        false,

      minLength:
        0,

      soloNumeros:
        false,

      inputMode:
        'text'
    };


    return new Promise<boolean>(
      resolve => {

        this.resolverConfirmacion =
          resolve;


        this.dialogoSubject.next(
          dialogo
        );
      }
    );
  }


  entrada(
    config: DialogoEntradaConfig
  ): Promise<string | null> {

    this.cancelarPendiente();


    const dialogo: DialogoActual = {
      tipo:
        'entrada',

      titulo:
        String(
          config.titulo ?? ''
        ).trim(),

      mensaje:
        String(
          config.mensaje ?? ''
        ).trim()
          ||
          null,

      textoConfirmar:
        String(
          config.textoConfirmar
          ??
          'Aceptar'
        ).trim(),

      textoCancelar:
        String(
          config.textoCancelar
          ??
          'Cancelar'
        ).trim(),

      variante:
        config.variante
        ??
        'default',

      label:
        String(
          config.label ?? ''
        ).trim()
          ||
          null,

      placeholder:
        String(
          config.placeholder ?? ''
        ).trim()
          ||
          null,

      valorInicial:
        String(
          config.valorInicial
          ??
          ''
        ),

      requerido:
        config.requerido
        ??
        false,

      minLength:
        Math.max(
          0,
          config.minLength
          ??
          0
        ),

      soloNumeros:
        config.soloNumeros
        ??
        false,

      inputMode:
        config.inputMode
        ??
        'text'
    };


    return new Promise<string | null>(
      resolve => {

        this.resolverEntrada =
          resolve;


        this.dialogoSubject.next(
          dialogo
        );
      }
    );
  }


  resolver(
    valor?: string
  ): void {

    const actual =
      this.dialogoSubject.value;


    if (!actual) {
      return;
    }


    this.dialogoSubject.next(
      null
    );


    if (
      actual.tipo ===
      'confirmacion'
    ) {

      const resolver =
        this.resolverConfirmacion;


      this.limpiarResolvers();


      resolver?.(
        true
      );

      return;
    }


    const resolver =
      this.resolverEntrada;


    this.limpiarResolvers();


    resolver?.(
      valor ?? ''
    );
  }


  cancelar(): void {

    const actual =
      this.dialogoSubject.value;


    if (!actual) {
      return;
    }


    this.dialogoSubject.next(
      null
    );


    if (
      actual.tipo ===
      'confirmacion'
    ) {

      const resolver =
        this.resolverConfirmacion;


      this.limpiarResolvers();


      resolver?.(
        false
      );

      return;
    }


    const resolver =
      this.resolverEntrada;


    this.limpiarResolvers();


    resolver?.(
      null
    );
  }


  private cancelarPendiente(): void {

    if (
      !this.dialogoSubject.value
    ) {
      return;
    }


    this.cancelar();
  }


  private limpiarResolvers(): void {

    this.resolverConfirmacion =
      null;

    this.resolverEntrada =
      null;
  }
}
