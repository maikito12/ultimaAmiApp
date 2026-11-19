import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Subject, interval } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import * as QRCode from 'qrcode';
import {
  NotificacionInterna,
  NotificacionesInternasService
} from '../../services/notificaciones-internas.service';

@Component({
  selector: 'app-notificaciones-campanita',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones-campanita.component.html',
  styleUrl: './notificaciones-campanita.component.css'
})
export class NotificacionesCampanitaComponent implements OnInit, OnDestroy {
  abierto = false;
  cargando = false;
  errorCarga = false;
  items: NotificacionInterna[] = [];
  sinLeer = 0;
  eliminandoIds = new Set<string>();
  errorEliminacion = false;

  // Configuración móvil: el QR contiene solo una URL pública.
  modalNotificacionesAbierto = false;
  qrNotificaciones: string | null = null;
  qrNotificacionesError = '';
  readonly enlaceNotificaciones = 'https://coriasalud.com/activar-notificaciones';

  private readonly destruir$ = new Subject<void>();

  constructor(
    private readonly notificaciones: NotificacionesInternasService,
    private readonly router: Router,
    private readonly elemento: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.actualizar();
    // La campanita actualiza el contador cada 15 s mientras la web está abierta.
    interval(15000).pipe(takeUntil(this.destruir$)).subscribe(() => this.actualizar());
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    if (this.modalNotificacionesAbierto) {
      this.cerrarModalNotificaciones();
    } else {
      this.abierto = false;
    }
  }

  @HostListener('document:click', ['$event'])
  cerrarAlHacerClickAfuera(evento: MouseEvent): void {
    if (this.modalNotificacionesAbierto) return;
    if (this.abierto && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.abierto = false;
    }
  }

  alternar(): void {
    this.abierto = !this.abierto;
    if (this.abierto) {
      this.errorEliminacion = false;
      this.actualizar();
    }
  }

  actualizar(): void {
    this.notificaciones.contarSinLeer()
      .pipe(takeUntil(this.destruir$), catchError(() => EMPTY))
      .subscribe(r => this.sinLeer = r.cantidad);

    if (!this.abierto) return;
    this.cargando = true;
    this.errorCarga = false;
    this.notificaciones.listar()
      .pipe(takeUntil(this.destruir$), catchError(() => {
        this.cargando = false;
        this.errorCarga = true;
        return EMPTY;
      }))
      .subscribe(items => {
        this.items = items;
        this.cargando = false;
      });
  }

  abrirTurno(item: NotificacionInterna): void {
    if (!item.leidaAt) {
      this.notificaciones.marcarLeida(item.id)
        .pipe(takeUntil(this.destruir$), catchError(() => EMPTY))
        .subscribe(() => {
          item.leidaAt = new Date().toISOString();
          this.sinLeer = Math.max(0, this.sinLeer - 1);
        });
    }
    this.abierto = false;
    this.router.navigate(['/dashboard/turnos', item.turnoId]);
  }

  eliminarNotificacion(item: NotificacionInterna, evento: MouseEvent): void {
    // Nunca abrir el turno al pulsar la X.
    evento.stopPropagation();
    if (this.eliminandoIds.has(item.id)) return;

    this.errorEliminacion = false;
    this.eliminandoIds.add(item.id);
    this.notificaciones.eliminar(item.id)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: () => {
          this.eliminandoIds.delete(item.id);
          this.items = this.items.filter(x => x.id !== item.id);
          if (!item.leidaAt) {
            this.sinLeer = Math.max(0, this.sinLeer - 1);
          }
        },
        error: error => {
          console.error('Error eliminando notificación:', error);
          this.eliminandoIds.delete(item.id);
          this.errorEliminacion = true;
        }
      });
  }

  marcarTodas(): void {
    this.notificaciones.leerTodas()
      .pipe(takeUntil(this.destruir$), catchError(() => EMPTY))
      .subscribe(() => this.actualizar());
  }

  claseTipo(tipo: string): string {
    return tipo === 'Cancelado' ? 'cancelado' :
      tipo === 'Confirmado' ? 'confirmado' : 'creado';
  }

  async abrirModalNotificaciones(): Promise<void> {
    this.abierto = false;
    this.modalNotificacionesAbierto = true;
    if (this.qrNotificaciones) return;

    this.qrNotificacionesError = '';
    try {
      this.qrNotificaciones = await QRCode.toDataURL(this.enlaceNotificaciones, {
        errorCorrectionLevel: 'M',
        width: 280,
        margin: 2,
        color: { dark: '#173F35', light: '#FFFFFF' }
      });
    } catch {
      this.qrNotificacionesError =
        'No pudimos generar el QR. Podés utilizar el enlace de activación.';
    }
  }

  cerrarModalNotificaciones(): void {
    this.modalNotificacionesAbierto = false;
  }
}
