import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TipoAlerta =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface AlertaItem {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  mensaje: string | null;
  duracionMs: number;
  cerrable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  private readonly alertasSubject =
    new BehaviorSubject<AlertaItem[]>([]);

  readonly alertas$ =
    this.alertasSubject.asObservable();

  private readonly temporizadores =
    new Map<string, ReturnType<typeof setTimeout>>();

  success(
    titulo: string,
    mensaje?: string,
    duracionMs = 3000
  ): string {
    return this.mostrar(
      'success',
      titulo,
      mensaje,
      duracionMs
    );
  }

  error(
    titulo: string,
    mensaje?: string,
    duracionMs = 6000
  ): string {
    return this.mostrar(
      'error',
      titulo,
      mensaje,
      duracionMs
    );
  }

  warning(
    titulo: string,
    mensaje?: string,
    duracionMs = 5000
  ): string {
    return this.mostrar(
      'warning',
      titulo,
      mensaje,
      duracionMs
    );
  }

  info(
    titulo: string,
    mensaje?: string,
    duracionMs = 4000
  ): string {
    return this.mostrar(
      'info',
      titulo,
      mensaje,
      duracionMs
    );
  }

  mostrar(
    tipo: TipoAlerta,
    titulo: string,
    mensaje?: string,
    duracionMs = 4000,
    cerrable = true
  ): string {

    const tituloLimpio =
      String(titulo ?? '').trim();

    const mensajeLimpio =
      String(mensaje ?? '').trim();

    if (!tituloLimpio) {
      throw new Error(
        'La alerta necesita un título.'
      );
    }

    const id =
      this.crearId();

    const alerta: AlertaItem = {
      id,
      tipo,
      titulo: tituloLimpio,
      mensaje:
        mensajeLimpio
          ? mensajeLimpio
          : null,
      duracionMs:
        Math.max(0, duracionMs),
      cerrable
    };

    this.alertasSubject.next([
      ...this.alertasSubject.value,
      alerta
    ]);

    if (alerta.duracionMs > 0) {

      const temporizador =
        setTimeout(
          () => this.cerrar(alerta.id),
          alerta.duracionMs
        );

      this.temporizadores.set(
        alerta.id,
        temporizador
      );
    }

    return id;
  }

  cerrar(
    id: string
  ): void {

    const temporizador =
      this.temporizadores.get(id);

    if (temporizador) {
      clearTimeout(temporizador);
      this.temporizadores.delete(id);
    }

    this.alertasSubject.next(
      this.alertasSubject.value.filter(
        alerta =>
          alerta.id !== id
      )
    );
  }

  cerrarTodas(): void {

    for (
      const temporizador
      of this.temporizadores.values()
    ) {
      clearTimeout(temporizador);
    }

    this.temporizadores.clear();
    this.alertasSubject.next([]);
  }

  private crearId(): string {

    return (
      Date.now().toString(36)
      +
      '-'
      +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );
  }
}
