import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TotemConfiguracion, TotemService, LlegadaTotemRespuesta } from '../../services/totem.service';

type PantallaTotem = 'cargando' | 'vinculacion' | 'bienvenida' | 'menu' | 'llegada' | 'exito';

@Component({
  selector: 'app-totems',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './totems.component.html',
  styleUrl: './totems.component.css'
})
export class TotemsComponent implements OnInit, OnDestroy {
  pantalla: PantallaTotem = 'cargando';
  configuracion: TotemConfiguracion | null = null;
  codigo = '';
  dni = '';
  ultimos4Telefono = '';
  llegada: LlegadaTotemRespuesta | null = null;
  registrandoLlegada = false;
  faseLlegada: 'dni' | 'telefono' = 'dni';
  vinculando = false;
  error = '';
  private temporizadorExito: ReturnType<typeof setTimeout> | null = null;
  private temporizadorMenu: ReturnType<typeof setTimeout> | null = null;
  // El aviso solo aparece cuando haya un flujo de paciente real.
  private readonly inactividadMenuMs = 30000;

  private readonly alVolverALaPagina = () => {
    // Si vuelve de otra app o pestaña, descartamos la sesión de uso público.
    if (document.visibilityState === 'visible' && ['menu', 'llegada', 'exito'].includes(this.pantalla)) {
      this.irBienvenida();
    }
  };

  private readonly alCambiarPagina = () => {
    // Nunca borramos la credencial del dispositivo al cerrar la página.
    this.limpiarSesionPaciente();
  };

  constructor(private readonly totemService: TotemService) {}

  ngOnInit(): void {
    document.addEventListener('visibilitychange', this.alVolverALaPagina);
    window.addEventListener('pagehide', this.alCambiarPagina);
    if (this.totemService.tieneCredencial) this.cargarConfiguracion();
    else this.pantalla = 'vinculacion';
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
    document.removeEventListener('visibilitychange', this.alVolverALaPagina);
    window.removeEventListener('pagehide', this.alCambiarPagina);
    this.limpiarSesionPaciente();
  }

  get colorPrincipal(): string {
    return this.colorSeguro(this.configuracion?.colorPrincipal, '#17483D');
  }

  get colorSecundario(): string {
    return this.colorSeguro(this.configuracion?.colorSecundario, '#5B8871');
  }

  private colorSeguro(valor: string | null | undefined, fallback: string): string {
    return valor && /^#[0-9a-fA-F]{6}$/.test(valor) ? valor : fallback;
  }

  ingresarDigito(digito: string): void {
    if (this.vinculando || !/^\d$/.test(digito) || this.codigo.length >= 6) return;
    this.codigo += digito;
    this.error = '';
  }

  borrarDigito(): void { if (!this.vinculando) this.codigo = this.codigo.slice(0, -1); }
  limpiarCodigo(): void { if (!this.vinculando) this.codigo = ''; }

  vincular(): void {
    if (this.vinculando || !/^\d{6}$/.test(this.codigo)) return;
    this.vinculando = true;
    this.error = '';
    this.totemService.vincular(this.codigo).subscribe({
      next: () => {
        this.codigo = '';
        this.vinculando = false;
        this.cargarConfiguracion();
      },
      error: (e: HttpErrorResponse | Error) => {
        this.vinculando = false;
        this.codigo = '';
        this.error = e instanceof HttpErrorResponse && e.status === 429
          ? 'Demasiados intentos. Probá más tarde.'
          : 'El código no es válido o venció. Pedí uno nuevo en recepción.';
      }
    });
  }

  cargarConfiguracion(): void {
    this.pantalla = 'cargando';
    this.error = '';
    this.totemService.obtenerConfiguracion().subscribe({
      next: config => {
        this.configuracion = config;
        this.irBienvenida();
      },
      error: (e: HttpErrorResponse | Error) => {
        this.configuracion = null;
        if (e instanceof HttpErrorResponse && (e.status === 401 || e.status === 403)) {
          this.totemService.olvidarCredencialLocal();
          this.pantalla = 'vinculacion';
          this.error = 'Este dispositivo debe vincularse nuevamente.';
          return;
        }
        // Ante una caída de red, no borrar la credencial válida.
        this.error = 'No pudimos conectarnos. Comprobá la conexión e intentá otra vez.';
        this.pantalla = 'cargando';
      }
    });
  }

  comenzar(): void {
    if (this.pantalla !== 'bienvenida') return;
    this.pantalla = 'menu';
    this.reiniciarTemporizadorMenu();
  }

  abrirLlegada(): void {
    this.limpiarSesionPaciente();
    this.pantalla = 'llegada';
    this.faseLlegada = 'dni';
    this.reiniciarTemporizadorMenu();
  }

  ingresarDato(digito: string): void {
    if (this.registrandoLlegada || !/^\d$/.test(digito)) return;
    if (this.faseLlegada === 'dni' && this.dni.length < 9) this.dni += digito;
    if (this.faseLlegada === 'telefono' && this.ultimos4Telefono.length < 4) this.ultimos4Telefono += digito;
    this.error = '';
    this.reiniciarTemporizadorMenu();
  }

  borrarDato(): void {
    if (this.registrandoLlegada) return;
    if (this.faseLlegada === 'dni') this.dni = this.dni.slice(0, -1);
    else this.ultimos4Telefono = this.ultimos4Telefono.slice(0, -1);
    this.reiniciarTemporizadorMenu();
  }

  siguientePasoLlegada(): void {
    if (!/^\d{7,9}$/.test(this.dni)) return;
    this.faseLlegada = 'telefono';
    this.error = '';
    this.reiniciarTemporizadorMenu();
  }

  confirmarLlegada(): void {
    if (this.registrandoLlegada || !/^\d{7,9}$/.test(this.dni) ||
        !/^\d{4}$/.test(this.ultimos4Telefono)) return;
    this.registrandoLlegada = true;
    this.error = '';
    this.detenerTemporizador();
    this.totemService.registrarLlegada(this.dni, this.ultimos4Telefono).subscribe({
      next: respuesta => {
        this.registrandoLlegada = false;
        this.dni = '';
        this.ultimos4Telefono = '';
        this.llegada = respuesta;
        this.pantalla = 'exito';
        this.temporizadorExito = setTimeout(() => this.irBienvenida(), 15000);
      },
      error: (e: HttpErrorResponse | Error) => {
        this.registrandoLlegada = false;
        this.dni = '';
        this.ultimos4Telefono = '';
        this.faseLlegada = 'dni';
        if (e instanceof HttpErrorResponse && (e.status === 401 || e.status === 403)) {
          this.totemService.olvidarCredencialLocal();
          this.configuracion = null;
          this.pantalla = 'vinculacion';
          this.error = 'Este dispositivo debe vincularse nuevamente.';
          return;
        }
        this.error = e instanceof HttpErrorResponse && e.status === 429
          ? 'Demasiados intentos. Consultá en recepción.'
          : 'No pudimos registrar la llegada. Verificá los datos o consultá en recepción.';
        this.reiniciarTemporizadorMenu();
      }
    });
  }

  reiniciarTemporizadorMenu(): void {
    if (!['menu', 'llegada'].includes(this.pantalla)) return;
    this.detenerTemporizador();
    this.temporizadorMenu = setTimeout(() => this.irBienvenida(), this.inactividadMenuMs);
  }

  irBienvenida(): void {
    this.detenerTemporizador();
    this.limpiarSesionPaciente();
    this.pantalla = this.configuracion ? 'bienvenida' : 'vinculacion';
  }

  private limpiarSesionPaciente(): void {
    // Al agregar reserva/check-in, vaciar aquí DNI, turnos seleccionados y respuestas temporales.
    // NO borrar la credencial del dispositivo: identifica al tótem y a su organización.
    this.codigo = '';
    this.dni = '';
    this.ultimos4Telefono = '';
    this.llegada = null;
    this.error = '';
    this.faseLlegada = 'dni';
  }

  private detenerTemporizador(): void {
    if (this.temporizadorMenu) clearTimeout(this.temporizadorMenu);
    this.temporizadorMenu = null;
    if (this.temporizadorExito) clearTimeout(this.temporizadorExito);
    this.temporizadorExito = null;
  }
}
