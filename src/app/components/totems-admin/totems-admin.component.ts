import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  ConfiguracionOrganizacionService,
  OrganizacionGeneral,
  Sucursal
} from '../../services/configuracion-organizacion.service';
import { AlcanceTotem, CodigoTotemRespuesta, CrearTotemPayload, OrientacionTotem, Totem, TotemsAdminService } from '../../services/totemsadmin.service';


@Component({
  selector: 'app-totems-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './totems-admin.component.html',
  styleUrl: './totems-admin.component.css'
})
export class TotemsAdminComponent implements OnInit, OnDestroy {
  totems: Totem[] = [];
  sucursales: Sucursal[] = [];
  organizacion: OrganizacionGeneral | null = null;
  cargando = true;
  guardando = false;
  procesandoId: string | null = null;
  formularioAbierto = false;
  error = '';
  exito = '';

  // Nunca guardamos el código temporal en localStorage ni lo agregamos a la URL.
  codigoVisible: { codigo: string; venceAt: string; totemNombre: string } | null = null;
  segundosRestantes = 0;
  private intervaloCodigo: ReturnType<typeof setInterval> | null = null;

  formulario: CrearTotemPayload = this.nuevoFormulario();
  // Los pisos todavía no tienen catálogo específico: el admin puede escribir los nombres reales.
  pisosTexto = '';

  constructor(
    private readonly totemsService: TotemsAdminService,
    private readonly configuracionService: ConfiguracionOrganizacionService
  ) {}

  ngOnInit(): void { this.cargarDatos(); }

  ngOnDestroy(): void { this.detenerTemporizador(); this.cerrarCodigo(); }

  get vinculados(): number { return this.totems.filter(t => t.vinculado).length; }
  get sinVincular(): number { return this.totems.filter(t => !t.vinculado).length; }

  get pisosProcesados(): string[] {
    return this.pisosTexto.split(/[,;\n]+/g)
      .map(p => p.trim())
      .filter(p => p.length > 0 && p.length <= 50)
      .filter((p, i, arr) => arr.findIndex(q => q.toLowerCase() === p.toLowerCase()) === i)
      .slice(0, 30);
  }

  private nuevoFormulario(): CrearTotemPayload {
    return {
      nombre: '', sucursalFisicaId: '', alcanceReservas: 'SUCURSAL',
      pisos: [], slogan: null, colorPrincipal: '#17483D',
      colorSecundario: '#8B5CF6', orientacion: 'AUTO'
    };
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    forkJoin({
      totems: this.totemsService.listar(),
      sucursales: this.configuracionService.obtenerSucursales(),
      organizacion: this.configuracionService.obtenerOrganizacionActual()
    }).subscribe({
      next: ({ totems, sucursales, organizacion }) => {
        this.totems = totems;
        this.sucursales = sucursales;
        this.organizacion = organizacion;
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        this.error = this.mensajeError(err, 'No pudimos cargar los tótems y sucursales.');
      }
    });
  }

  abrirCrear(): void {
    this.error = '';
    this.exito = '';
    this.formulario = this.nuevoFormulario();
    this.formulario.sucursalFisicaId = this.sucursales[0]?.id || '';
    this.formulario.colorPrincipal = this.organizacion?.colorPrincipal || '#17483D';
    this.formulario.colorSecundario = this.organizacion?.colorSecundario || '#8B5CF6';
    this.pisosTexto = '';
    this.formularioAbierto = true;
  }

  guardar(): void {
    if (this.guardando) return;
    this.error = '';
    const nombre = this.formulario.nombre.trim();
    if (!nombre || nombre.length > 120) {
      this.error = 'Ingresá un nombre de hasta 120 caracteres.';
      return;
    }
    if (!this.sucursales.some(s => s.id === this.formulario.sucursalFisicaId)) {
      this.error = 'Seleccioná una sucursal válida.';
      return;
    }
    if (this.formulario.alcanceReservas === 'PISOS' && this.pisosProcesados.length === 0) {
      this.error = 'Ingresá al menos un piso (separados por comas).';
      return;
    }
    const payload: CrearTotemPayload = {
      ...this.formulario,
      nombre,
      slogan: this.formulario.slogan?.trim() || null,
      pisos: this.formulario.alcanceReservas === 'PISOS' ? this.pisosProcesados : []
    };
    this.guardando = true;
    this.totemsService.crear(payload).subscribe({
      next: r => {
        this.guardando = false;
        this.formularioAbierto = false;
        this.totems = [...this.totems, r.totem].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.exito = 'Tótem creado. Ingresá este código en la tablet para vincularlo.';
        this.mostrarCodigo(r, r.totem.nombre);
      },
      error: err => {
        this.guardando = false;
        this.error = this.mensajeError(err, 'No se pudo crear el tótem.');
      }
    });
  }

  regenerar(t: Totem): void {
    if (this.procesandoId || t.vinculado) return;
    this.error = '';
    this.exito = '';
    this.procesandoId = t.id;
    this.totemsService.regenerarCodigo(t.id).subscribe({
      next: r => {
        this.procesandoId = null;
        t.codigo_vence_at = r.venceAt;
        this.mostrarCodigo(r, t.nombre);
      },
      error: err => {
        this.procesandoId = null;
        this.error = this.mensajeError(err, 'No se pudo generar otro código.');
      }
    });
  }

  desvincular(t: Totem): void {
    if (this.procesandoId || !t.vinculado) return;
    if (!window.confirm(`¿Desvincular «${t.nombre}»? La tablet perderá el acceso.`)) return;
    this.error = '';
    this.exito = '';
    this.procesandoId = t.id;
    this.totemsService.desvincular(t.id).subscribe({
      next: () => {
        this.procesandoId = null;
        t.vinculado = false;
        t.codigo_vence_at = null;
        this.cerrarCodigo();
        this.exito = 'Dispositivo desvinculado. Ahora podés generar otro código.';
      },
      error: err => {
        this.procesandoId = null;
        this.error = this.mensajeError(err, 'No se pudo desvincular el dispositivo.');
      }
    });
  }

  nombreSucursal(id: string): string {
    return this.sucursales.find(s => s.id === id)?.nombre || 'Sucursal no disponible';
  }

  descripcionAlcance(alcance: AlcanceTotem): string {
    switch (alcance) {
      case 'TODAS': return 'Todas las sucursales (reservas)';
      case 'PISOS': return 'Pisos seleccionados';
      default: return 'Sucursal seleccionada';
    }
  }

  descripcionOrientacion(valor: OrientacionTotem): string {
    switch (valor) {
      case 'VERTICAL': return 'Vertical';
      case 'HORIZONTAL': return 'Horizontal';
      default: return 'Automática';
    }
  }

  private mostrarCodigo(r: CodigoTotemRespuesta, nombre: string): void {
    this.detenerTemporizador();
    this.codigoVisible = { codigo: r.codigo, venceAt: r.venceAt, totemNombre: nombre };
    this.actualizarSegundos();
    this.intervaloCodigo = setInterval(() => this.actualizarSegundos(), 1000);
  }

  private actualizarSegundos(): void {
    if (!this.codigoVisible) return;
    const vence = Date.parse(this.codigoVisible.venceAt);
    this.segundosRestantes = Number.isFinite(vence)
      ? Math.max(0, Math.ceil((vence - Date.now()) / 1000)) : 0;
    if (this.segundosRestantes === 0) this.detenerTemporizador();
  }

  get reloj(): string {
    return `${Math.floor(this.segundosRestantes / 60).toString().padStart(2, '0')}:${(this.segundosRestantes % 60).toString().padStart(2, '0')}`;
  }

  cerrarCodigo(): void {
    this.detenerTemporizador();
    this.codigoVisible = null;
    this.segundosRestantes = 0;
  }

  private detenerTemporizador(): void {
    if (this.intervaloCodigo !== null) clearInterval(this.intervaloCodigo);
    this.intervaloCodigo = null;
  }

  private mensajeError(err: any, fallback: string): string {
    return typeof err?.error?.message === 'string' ? err.error.message : fallback;
  }


readonly urlTotem = 'https://coriasalud.com/totem';

enlaceCopiado = false;

async copiarEnlaceTotem(): Promise<void> {
  try {
    await navigator.clipboard.writeText(this.urlTotem);

    this.enlaceCopiado = true;

    setTimeout(() => {
      this.enlaceCopiado = false;
    }, 2500);
  } catch {
    this.error = 'No se pudo copiar el enlace automáticamente.';
  }
}

}
