import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { DisponibilidadDiaPublica, ReservaPublicaService } from '../../services/reserva-publica.service';
import { ContextoReagendamiento, ReagendamientoPublicoService, ResultadoReagendamiento } from '../../services/reagendamiento-publcio.service';


interface DiaCalendario {
  fecha: string;
  numero: number;
  actual: boolean;
  habilitado: boolean;
  cantidad: number;
}

@Component({
  selector: 'app-reagendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reagendar.component.html',
  styleUrls: ['./reagendar.component.css']
})
export class ReagendarComponent implements OnInit {
  token = '';
  contexto: ContextoReagendamiento | null = null;
  resultado: ResultadoReagendamiento | null = null;
  cargando = true;
  cargandoDisponibilidad = false;
  guardando = false;
  error = '';
  errorDisponibilidad = '';
  fechaSeleccionada = '';
  horaSeleccionada = '';
  mes = new Date().getMonth();
  anio = new Date().getFullYear();
  dias: DiaCalendario[] = [];
  disponibilidad: Record<string, DisponibilidadDiaPublica> = {};
  readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  readonly hoyMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly reagendamiento: ReagendamientoPublicoService,
    private readonly reservas: ReservaPublicaService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.cargando = false;
      this.error = 'El enlace de reagendamiento no es válido.';
      return;
    }

    this.reagendamiento.contexto(this.token).subscribe({
      next: contexto => {
        this.contexto = contexto;
        this.cargando = false;
        this.cargarDisponibilidad();
      },
      error: error => {
        this.cargando = false;
        this.error = this.mensajeError(error, 'El enlace venció o el turno ya no puede reagendarse.');
      }
    });
  }

  get nombreMes(): string { return `${this.meses[this.mes]} de ${this.anio}`; }
  get horarios(): string[] {
    if (!this.fechaSeleccionada) return [];
    const horarios = this.disponibilidad[this.fechaSeleccionada]?.horarios || [];
    const ahora = new Date();
    const localHoy = this.formatearFecha(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    if (this.fechaSeleccionada !== localHoy) return horarios;
    return horarios.filter(h => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm > ahora.getHours() * 60 + ahora.getMinutes();
    });
  }
  get puedeVolver(): boolean {
    return new Date(this.anio, this.mes, 1).getTime() > this.hoyMes.getTime();
  }

  cambiarMes(diferencia: number): void {
    if (this.cargandoDisponibilidad || (diferencia < 0 && !this.puedeVolver)) return;
    const nuevo = new Date(this.anio, this.mes + diferencia, 1);
    this.anio = nuevo.getFullYear();
    this.mes = nuevo.getMonth();
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.cargarDisponibilidad();
  }

  elegirDia(dia: DiaCalendario): void {
    if (!dia.actual || !dia.habilitado) return;
    this.fechaSeleccionada = dia.fecha;
    this.horaSeleccionada = '';
  }

  elegirHora(hora: string): void { this.horaSeleccionada = hora; }

  confirmar(): void {
    if (!this.contexto || !this.fechaSeleccionada || !this.horaSeleccionada || this.guardando) return;
    this.guardando = true;
    this.error = '';
    this.reagendamiento.confirmar(this.token, this.fechaSeleccionada, this.horaSeleccionada)
      .pipe(finalize(() => this.guardando = false))
      .subscribe({
        next: res => {
          this.resultado = res;
          // El mismo turno se actualizó; no se crea una segunda reserva.
        },
        error: err => {
          this.error = this.mensajeError(err, 'No pudimos cambiar el turno. Tu reserva original sigue vigente si el cambio no fue confirmado.');
          // Puede haberse ocupado el horario: actualizamos disponibilidad.
          this.cargarDisponibilidad();
        }
      });
  }

  cargarDisponibilidad(): void {
    const c = this.contexto;
    if (!c) return;
    this.errorDisponibilidad = '';
    this.cargandoDisponibilidad = true;
    this.reservas.obtenerDisponibilidad(
      c.organizacionSlug,
      c.profesionalOrganizacionId,
      c.profesionalEspecialidadId,
      c.sucursalId,
      this.anio,
      this.mes + 1
    ).pipe(finalize(() => this.cargandoDisponibilidad = false)).subscribe({
      next: mes => {
        this.disponibilidad = Object.fromEntries(mes.dias.map(d => [d.fecha, d]));
        this.construirCalendario();
        if (this.fechaSeleccionada && !this.horarios.includes(this.horaSeleccionada)) {
          this.horaSeleccionada = '';
        }
      },
      error: () => {
        this.errorDisponibilidad = 'No pudimos cargar los horarios disponibles. Intentá nuevamente.';
        this.disponibilidad = {};
        this.construirCalendario();
      }
    });
  }

  private construirCalendario(): void {
    const primero = new Date(this.anio, this.mes, 1);
    const cantidad = new Date(this.anio, this.mes + 1, 0).getDate();
    const inicio = (primero.getDay() + 6) % 7;
    const celdas: DiaCalendario[] = [];
    for (let i = 0; i < inicio; i++) celdas.push({fecha: '', numero: 0, actual: false, habilitado: false, cantidad: 0});
    for (let dia = 1; dia <= cantidad; dia++) {
      const fecha = this.formatearFecha(this.anio, this.mes, dia);
      const info = this.disponibilidad[fecha];
      const hoy = new Date();
      const fechaHoy = this.formatearFecha(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const horas = info?.horarios || [];
      const horasValidas = fecha === fechaHoy ? horas.filter(h => {
        const [hh, mm] = h.split(':').map(Number);
        return hh * 60 + mm > hoy.getHours() * 60 + hoy.getMinutes();
      }) : horas;
      celdas.push({
        fecha, numero: dia, actual: true,
        habilitado: fecha >= fechaHoy && !info?.fueraDeRango && horasValidas.length > 0,
        cantidad: horasValidas.length
      });
    }
    this.dias = celdas;
  }

  private formatearFecha(anio: number, mesDesdeCero: number, dia: number): string {
    return `${anio}-${String(mesDesdeCero + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  private mensajeError(error: any, fallback: string): string {
    const cuerpo = error?.error;
    if (typeof cuerpo?.message === 'string') return cuerpo.message;
    if (typeof cuerpo?.mensaje === 'string') return cuerpo.mensaje;
    return fallback;
  }
}
