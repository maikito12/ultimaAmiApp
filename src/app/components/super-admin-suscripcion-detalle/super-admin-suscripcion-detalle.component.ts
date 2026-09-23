import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  ActualizarPrecioSuscripcionRequest,
  MetodoPagoManual,
  PagoSuscripcion,
  RegistrarPagoManualRequest,
  SuperAdminOrganizacionDetalle,
  SuperAdminService
} from '../../services/super-admin.service';

import { AlertaService } from '../../services/alerta.service';
import { DialogoService } from '../../services/dialogo.service';


interface PagoManualForm {
  metodoPago: MetodoPagoManual;
  importe: number | null;
  referencia: string;
  observaciones: string;
}


interface PrecioSuscripcionForm {
  importeTotal: number | null;
  precioPorProfesional: number | null;
}


@Component({
  selector: 'app-super-admin-suscripcion-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './super-admin-suscripcion-detalle.component.html',
  styleUrl: './super-admin-suscripcion-detalle.component.css'
})
export class SuperAdminSuscripcionDetalleComponent
  implements OnInit {

  organizacionId = '';

  detalle:
    SuperAdminOrganizacionDetalle | null =
      null;

  pagos:
    PagoSuscripcion[] =
      [];

  cargando = true;
  errorCarga = false;
  guardandoPago = false;
  guardandoPrecio = false;

  pagoForm:
    PagoManualForm =
      this.crearPagoForm();

  precioForm:
    PrecioSuscripcionForm =
      this.crearPrecioForm();


  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly superAdminService: SuperAdminService,
    private readonly alertaService: AlertaService,
    private readonly dialogoService: DialogoService
  ) {}


  ngOnInit(): void {

    this.organizacionId =
      this.route.snapshot
        .paramMap
        .get('id')
      ?? '';


    if (!this.organizacionId) {
      this.errorCarga = true;
      this.cargando = false;
      return;
    }


    this.cargarTodo();
  }


  cargarTodo(): void {

    this.cargando = true;
    this.errorCarga = false;


    forkJoin({
      detalle:
        this.superAdminService
          .obtenerOrganizacion(
            this.organizacionId
          ),

      pagos:
        this.superAdminService
          .obtenerPagos(
            this.organizacionId
          )
    })
      .subscribe({

        next: (respuesta) => {

          this.detalle =
            respuesta.detalle;

          this.pagos =
            respuesta.pagos.items
            ?? [];

          this.precioForm =
            this.crearPrecioForm();

          this.cargando =
            false;
        },

        error: (error) => {

          console.error(
            'Error cargando la suscripción:',
            error
          );

          this.cargando =
            false;

          this.errorCarga =
            true;
        }

      });
  }


  volver(): void {
    this.router.navigate(
      ['/super-admin']
    );
  }


  async registrarPagoManual():
    Promise<void> {

    if (
      !this.detalle?.suscripcion
      ||
      this.guardandoPago
    ) {
      return;
    }


    const importe =
      this.normalizarImporte(
        this.pagoForm.importe
      );


    if (
      importe !== null
      &&
      importe <= 0
    ) {

      this.alertaService.warning(
        'Importe inválido',
        'El importe debe ser mayor a cero o quedar vacío para usar el precio habitual.'
      );

      return;
    }


    const importeMostrar =
      importe
      ??
      this.detalle
        .suscripcion
        .importeTotal;


    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            'Confirmar pago',

          mensaje:
            `Vas a registrar ${this.formatearDinero(importeMostrar)} para ${this.detalle.organizacion.nombre}. Método: ${this.pagoForm.metodoPago}.`,

          textoConfirmar:
            'Registrar pago',

          textoCancelar:
            'Volver'
        });


    if (!confirmado) {
      return;
    }


    const request:
      RegistrarPagoManualRequest = {

        importe,

        metodoPago:
          this.pagoForm.metodoPago,

        referencia:
          this.normalizarTexto(
            this.pagoForm.referencia
          ),

        observaciones:
          this.normalizarTexto(
            this.pagoForm.observaciones
          )
      };


    this.guardandoPago =
      true;


    this.superAdminService
      .registrarPagoManual(
        this.organizacionId,
        request
      )
      .subscribe({

        next: (respuesta) => {

          this.guardandoPago =
            false;

          this.pagoForm =
            this.crearPagoForm();

          this.alertaService.success(
            'Pago registrado',
            respuesta.message
            || 'El pago quedó registrado.'
          );

          this.cargarTodo();
        },

        error: (error) => {

          this.guardandoPago =
            false;

          this.alertaService.error(
            'No se pudo registrar el pago',
            this.obtenerMensajeError(
              error,
              'Revisá los datos e intentá nuevamente.'
            )
          );
        }

      });
  }


  async actualizarPrecio():
    Promise<void> {

    if (
      !this.detalle?.suscripcion
      ||
      this.guardandoPrecio
    ) {
      return;
    }


    const importeTotal =
      this.normalizarImporte(
        this.precioForm.importeTotal
      );

    const precioPorProfesional =
      this.normalizarImporte(
        this.precioForm.precioPorProfesional
      );


    if (
      importeTotal === null
      ||
      importeTotal <= 0
    ) {

      this.alertaService.warning(
        'Precio inválido',
        'Ingresá un precio habitual mayor a cero.'
      );

      return;
    }


    if (
      precioPorProfesional !== null
      &&
      precioPorProfesional <= 0
    ) {

      this.alertaService.warning(
        'Precio inválido',
        'El precio por profesional debe ser mayor a cero.'
      );

      return;
    }


    const confirmado =
      await this.dialogoService
        .confirmar({
          titulo:
            'Actualizar precio habitual',

          mensaje:
            `El precio habitual de ${this.detalle.organizacion.nombre} quedará en ${this.formatearDinero(importeTotal)}.`,

          textoConfirmar:
            'Guardar precio',

          textoCancelar:
            'Volver'
        });


    if (!confirmado) {
      return;
    }


    const request:
      ActualizarPrecioSuscripcionRequest = {
        importeTotal,
        precioPorProfesional
      };


    this.guardandoPrecio =
      true;


    this.superAdminService
      .actualizarPrecioSuscripcion(
        this.organizacionId,
        request
      )
      .subscribe({

        next: (respuesta) => {

          this.guardandoPrecio =
            false;

          this.alertaService.success(
            'Precio actualizado',
            respuesta.message
            || 'El precio habitual quedó actualizado.'
          );

          this.cargarTodo();
        },

        error: (error) => {

          this.guardandoPrecio =
            false;

          this.alertaService.error(
            'No se pudo actualizar el precio',
            this.obtenerMensajeError(
              error,
              'Revisá el importe e intentá nuevamente.'
            )
          );
        }

      });
  }


  get ultimoPago():
    PagoSuscripcion | null {

    return this.pagos[0] ?? null;
  }


  get diasParaVencer():
    number | null {

    const fechaFin =
      this.detalle
        ?.suscripcion
        ?.fechaFin;


    if (!fechaFin) {
      return null;
    }


    const vencimiento =
      new Date(fechaFin);


    if (
      Number.isNaN(
        vencimiento.getTime()
      )
    ) {
      return null;
    }


    return Math.ceil(
      (
        vencimiento.getTime()
        -
        Date.now()
      )
      /
      86_400_000
    );
  }


  textoVencimiento(): string {

    const dias =
      this.diasParaVencer;


    if (dias === null) {
      return 'Sin vencimiento';
    }


    if (dias < 0) {

      const cantidad =
        Math.abs(dias);

      return cantidad === 1
        ? 'Vencida hace 1 día'
        : `Vencida hace ${cantidad} días`;
    }


    if (dias === 0) {
      return 'Vence hoy';
    }


    if (dias === 1) {
      return 'Vence mañana';
    }


    return `Vence en ${dias} días`;
  }


  claseVencimiento(): string {

    const dias =
      this.diasParaVencer;


    if (dias === null) {
      return 'expiry-gray';
    }


    if (dias < 0) {
      return 'expiry-red';
    }


    if (dias <= 5) {
      return 'expiry-yellow';
    }


    return 'expiry-green';
  }


  claseEstado(
    estado:
      string | null | undefined
  ): string {

    const valor =
      String(
        estado ?? ''
      )
        .toLowerCase();


    if (valor === 'activa') {
      return 'estado-verde';
    }


    if (
      valor === 'pendiente'
      ||
      valor === 'enprueba'
    ) {
      return 'estado-amarillo';
    }


    if (
      valor === 'vencida'
      ||
      valor === 'cancelada'
    ) {
      return 'estado-rojo';
    }


    return 'estado-gris';
  }


  formatearDinero(
    valor:
      number | null | undefined
  ): string {

    return new Intl.NumberFormat(
      'es-AR',
      {
        style:
          'currency',

        currency:
          'ARS',

        maximumFractionDigits:
          0
      }
    )
      .format(
        valor ?? 0
      );
  }


  formatearFecha(
    fecha:
      string | null | undefined
  ): string {

    if (!fecha) {
      return '-';
    }


    const date =
      new Date(fecha);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '-';
    }


    return new Intl.DateTimeFormat(
      'es-AR',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric'
      }
    )
      .format(date);
  }


  private crearPagoForm():
    PagoManualForm {

    return {
      metodoPago:
        'Transferencia',

      importe:
        null,

      referencia:
        '',

      observaciones:
        ''
    };
  }


  private crearPrecioForm():
    PrecioSuscripcionForm {

    return {
      importeTotal:
        this.detalle
          ?.suscripcion
          ?.importeTotal
        ?? null,

      precioPorProfesional:
        this.detalle
          ?.suscripcion
          ?.precioPorProfesional
        ?? null
    };
  }


  private normalizarImporte(
    valor:
      number | null | undefined
  ):
    number | null {

    if (
      valor === null
      ||
      valor === undefined
      ||
      String(valor).trim() === ''
    ) {
      return null;
    }


    const numero =
      Number(valor);


    return Number.isFinite(numero)
      ? numero
      : null;
  }


  private normalizarTexto(
    valor:
      string | null | undefined
  ):
    string | null {

    const texto =
      String(
        valor ?? ''
      )
        .trim();


    return texto || null;
  }


  private obtenerMensajeError(
    error:
      any,

    fallback:
      string
  ): string {

    return (
      error?.error?.message
      ||
      error?.error?.mensaje
      ||
      error?.message
      ||
      fallback
    );
  }

}
