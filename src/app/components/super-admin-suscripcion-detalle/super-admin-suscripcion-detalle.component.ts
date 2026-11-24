import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';


import {
  ActualizarPrecioSuscripcionRequest,
  MetodoPagoManual,
  PagoSuscripcion,
  CambioSuscripcionRevision,
  RegistrarPagoManualRequest,
  SuperAdminOrganizacionDetalle,
  SuperAdminService
} from '../../services/super-admin.service';

import { AlertaService } from '../../services/alerta.service';
import { DialogoService } from '../../services/dialogo.service';
import { environmentProduccion } from '../../../environments/environment';


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

interface PlanDisponibleSuperAdmin {
  id: string;
  nombre: string;
  permitePlanPersonalizado: boolean;
}

interface NuevaSuscripcionSuperAdminForm {
  planId: string;
  cantidadProfesionales: number | null;
  cantidadSecretarias: number | null;
  importeTotal: number | null;
  modalidad: 'Mensual' | 'Anual';
}

interface CrearSuscripcionSuperAdminResponse {
  success: boolean;
  suscripcionId: string;
  initPoint: string | null;
  message?: string;
}

interface GenerarCheckoutSuperAdminResponse {
  initPoint: string | null;
  requierePagoManual?: boolean;
  message?: string;
}

// Cupos administrados por el Super Admin (no es el número de usuarios registrados).
interface CuposProfesionalesForm {
  cantidadProfesionales: number | null;
  importeTotal: number | null;
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

  facturaRecuperar = '';
  recuperandoPago = false;
  cambiosRevision: CambioSuscripcionRevision[] = [];
  cargandoCambiosRevision = false;
  private cambiosRevisionRequestId = 0;
  errorCambiosRevision = false;
  conciliandoCambioId: string | null = null;

  get operacionFacturacionEnCurso(): boolean {
    return this.recuperandoPago || !!this.conciliandoCambioId ||
      this.guardandoPago || this.guardandoPrecio || this.guardandoCupos ||
      this.guardandoNuevaSuscripcion || this.generandoCheckout;
  }

  cargando = true;
  errorCarga = false;
  guardandoPago = false;
  guardandoPrecio = false;
  guardandoCupos = false;
  guardandoNuevaSuscripcion = false;
  generandoCheckout = false;
  cargandoPlanes = false;
  errorPlanes = false;
  planesDisponibles: PlanDisponibleSuperAdmin[] = [];
  enlaceCheckout: string | null = null;

  nuevaSuscripcionForm: NuevaSuscripcionSuperAdminForm = {
    planId: '',
    cantidadProfesionales: 1,
    cantidadSecretarias: 0,
    importeTotal: null,
    modalidad: 'Mensual'
  };

  pagoForm:
    PagoManualForm =
      this.crearPagoForm();

  precioForm:
    PrecioSuscripcionForm =
      this.crearPrecioForm();

  cuposForm: CuposProfesionalesForm = this.crearCuposForm();


  constructor(
    private readonly http: HttpClient,
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
    this.cargarPlanesDisponibles();
  }


  cargarTodo(): void {
    this.cargarCambiosRevision();

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

          this.cuposForm =
            this.crearCuposForm();

          // Mostrar el checkout pendiente también después de recargar la página.
          if (this.detalle?.suscripcion?.estado === 'Pendiente') {
            const pendiente = this.detalle.suscripcion as { initPoint?: string | null };
            this.enlaceCheckout = pendiente.initPoint || this.enlaceCheckout;
          } else {
            this.enlaceCheckout = null;
          }

          const planActual = this.detalle?.plan as { id?: string } | null | undefined;
          if (!this.nuevaSuscripcionForm.planId && planActual?.id) {
            this.nuevaSuscripcionForm.planId = planActual.id;
          }
          const minimoProfesionales = Math.max(1, this.profesionalesActivos);
          if ((this.nuevaSuscripcionForm.cantidadProfesionales ?? 0) < minimoProfesionales) {
            this.nuevaSuscripcionForm.cantidadProfesionales = minimoProfesionales;
          }

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


  // ==========================================
  // SUSCRIPCIONES PERSONALIZADAS DESDE SUPER ADMIN
  // ==========================================

  get puedeCrearSuscripcion(): boolean {
    if (!this.detalle) return false;
    const estado = this.detalle.suscripcion?.estado?.trim().toLowerCase();
    return !estado || estado === 'cancelada';
  }

  get nuevaSuscripcionValida(): boolean {
    const form = this.nuevaSuscripcionForm;
    const plan = this.planesDisponibles.find(p => p.id === form.planId);
    const profesionales = Number(form.cantidadProfesionales);
    const secretarias = Number(form.cantidadSecretarias);
    const importe = Number(form.importeTotal);
    return this.puedeCrearSuscripcion && !!plan &&
      Number.isSafeInteger(profesionales) &&
      profesionales >= Math.max(1, this.profesionalesActivos) &&
      (profesionales <= 15 || plan.permitePlanPersonalizado) &&
      Number.isSafeInteger(secretarias) && secretarias >= 0 &&
      form.importeTotal !== null && Number.isFinite(importe) &&
      importe > 0 && importe <= 2_000_000 &&
      (form.modalidad === 'Mensual' || form.modalidad === 'Anual');
  }

  cargarPlanesDisponibles(): void {
    this.cargandoPlanes = true;
    this.errorPlanes = false;
    this.http.get<PlanDisponibleSuperAdmin[]>(
      `${environmentProduccion.apiUrl}/super-admin/planes-suscripcion`
    ).subscribe({
      next: (planes) => {
        this.planesDisponibles = planes;
        this.cargandoPlanes = false;
      },
      error: (error) => {
        console.error('Error al obtener planes para Super Admin:', error);
        this.errorPlanes = true;
        this.cargandoPlanes = false;
      }
    });
  }

  async crearSuscripcion(): Promise<void> {
    if (!this.nuevaSuscripcionValida || this.guardandoNuevaSuscripcion) {
      this.alertaService.warning('Datos incompletos',
        'Elegí un plan y revisá los cupos y el importe.');
      return;
    }
    const form = this.nuevaSuscripcionForm;
    const confirmado = await this.dialogoService.confirmar({
      titulo: 'Crear suscripción',
      mensaje: `Vas a crear una suscripción ${form.modalidad.toLowerCase()} para ` +
        `${this.detalle!.organizacion.nombre} por ${this.formatearDinero(form.importeTotal)}. ` +
        'Quedará pendiente hasta que la clínica autorice el cobro en Mercado Pago.',
      textoConfirmar: 'Crear suscripción',
      textoCancelar: 'Volver'
    });
    if (!confirmado) return;

    this.guardandoNuevaSuscripcion = true;
    this.http.post<CrearSuscripcionSuperAdminResponse>(
      `${environmentProduccion.apiUrl}/super-admin/organizaciones/${this.organizacionId}/suscripciones`,
      {
        planId: form.planId,
        cantidadProfesionales: Number(form.cantidadProfesionales),
        cantidadSecretarias: Number(form.cantidadSecretarias),
        importeTotal: Number(form.importeTotal),
        modalidad: form.modalidad
      }
    ).subscribe({
      next: (respuesta) => {
        this.guardandoNuevaSuscripcion = false;
        this.enlaceCheckout = respuesta.initPoint || null;
        this.alertaService.success('Suscripción creada',
          respuesta.message || 'Se generó el enlace para autorizar el cobro.');
        this.cargarTodo();
      },
      error: (error) => {
        this.guardandoNuevaSuscripcion = false;
        this.alertaService.error('No se pudo crear la suscripción',
          this.obtenerMensajeError(error,
            'Revisá el estado antes de volver a intentar: podría haberse creado una suscripción pendiente.'));
        // Si MP falló después de crear la fila, el detalle permite recuperar el checkout.
        this.cargarTodo();
      }
    });
  }

  generarCheckoutPendiente(): void {
    const suscripcion = this.detalle?.suscripcion;
    if (!suscripcion || suscripcion.estado !== 'Pendiente' || this.generandoCheckout) return;

    this.generandoCheckout = true;
    this.http.post<GenerarCheckoutSuperAdminResponse>(
      `${environmentProduccion.apiUrl}/super-admin/suscripciones/${suscripcion.id}/generar-checkout`,
      {}
    ).subscribe({
      next: (respuesta) => {
        this.generandoCheckout = false;
        this.enlaceCheckout = respuesta.initPoint || null;
        if (this.enlaceCheckout) {
          this.alertaService.success('Enlace disponible',
            'Ya podés copiar el enlace y enviárselo a la clínica.');
        } else {
          this.alertaService.warning('Sin enlace',
            respuesta.message || 'Mercado Pago no devolvió un enlace.');
        }
      },
      error: (error) => {
        this.generandoCheckout = false;
        this.alertaService.error('No se pudo obtener el checkout',
          this.obtenerMensajeError(error, 'Revisá el estado en Mercado Pago.'));
      }
    });
  }

  async copiarEnlaceCheckout(): Promise<void> {
    if (!this.enlaceCheckout) return;
    try {
      await navigator.clipboard.writeText(this.enlaceCheckout);
      this.alertaService.success('Enlace copiado',
        'Compartilo con la persona que autorizará la suscripción.');
    } catch {
      this.alertaService.warning('No se pudo copiar automáticamente',
        'Seleccioná el enlace y copialo manualmente.');
    }
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
      this.operacionFacturacionEnCurso
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
      this.operacionFacturacionEnCurso
    ) {
      return;
    }


    const importeTotal =
      this.normalizarImporte(
        this.precioForm.importeTotal
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
        precioPorProfesional: null
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

          this.cargarCambiosRevision();
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


  // ==========================================
  // SUPER ADMIN - MODIFICAR CUPOS DE PROFESIONALES
  // ==========================================

  get cuposActuales(): number {
    return Number(this.detalle?.suscripcion?.cantidadProfesionales ?? 0);
  }

  get profesionalesActivos(): number {
    return Number(this.detalle?.uso?.profesionales ?? 0);
  }

  get cuposValidos(): boolean {
    const valor = this.cuposForm.cantidadProfesionales;
    const esMp = !!this.detalle?.suscripcion?.tieneCobroMercadoPago;
    const importe = this.cuposForm.importeTotal;
    const importeValido = !esMp || (
      importe !== null && Number.isFinite(Number(importe)) &&
      Number(importe) > 0 && Number(importe) <= 2_000_000
    );
    const cambianCupos = Number(valor) !== this.cuposActuales;
    const cambiaPrecio = importe !== null && Number(importe) !==
      Number(this.detalle?.suscripcion?.importeTotal ?? 0);
    const importeManualValido = esMp || importe === null || (
      Number.isFinite(Number(importe)) && Number(importe) > 0
    );
    return valor !== null &&
      Number.isSafeInteger(Number(valor)) &&
      Number(valor) >= Math.max(1, this.profesionalesActivos) &&
      (cambianCupos || cambiaPrecio) && importeValido && importeManualValido;
  }

  aumentarCupos(): void {
    if (this.guardandoCupos) return;
    const actual = Number(this.cuposForm.cantidadProfesionales ?? this.cuposActuales);
    if (Number.isSafeInteger(actual) && actual < Number.MAX_SAFE_INTEGER) {
      this.cuposForm.cantidadProfesionales = actual + 1;
    }
  }

  disminuirCupos(): void {
    if (this.guardandoCupos) return;
    const minimo = Math.max(1, this.profesionalesActivos);
    const actual = Number(this.cuposForm.cantidadProfesionales ?? this.cuposActuales);
    if (Number.isSafeInteger(actual)) {
      this.cuposForm.cantidadProfesionales = Math.max(minimo, actual - 1);
    }
  }

  async actualizarCupos(): Promise<void> {
    if (!this.detalle?.suscripcion || this.operacionFacturacionEnCurso) return;

    if (!this.cuposValidos) {
      this.alertaService.warning(
        'Cantidad inválida',
        `Ingresá un número entero distinto al actual y no menor a los ${this.profesionalesActivos} profesionales activos.`
      );
      return;
    }

    const cantidad = Number(this.cuposForm.cantidadProfesionales);
    const esMp = !!this.detalle.suscripcion.tieneCobroMercadoPago;
    const importeTotal = this.cuposForm.importeTotal;
    const mensajeImporte = esMp
      ? ` El nuevo importe recurrente acordado es ${this.formatearDinero(importeTotal)}. ` +
        'Este cambio también se realizará en Mercado Pago.'
      : ' El precio habitual permanece igual si no cargaste un nuevo importe.';
    const confirmado = await this.dialogoService.confirmar({
      titulo: 'Confirmar cambio de suscripción',
      mensaje:
        `Vas a cambiar el límite de ${this.detalle.organizacion.nombre} ` +
        `de ${this.cuposActuales} a ${cantidad} profesionales. ` +
        mensajeImporte,
      textoConfirmar: 'Confirmar cupos',
      textoCancelar: 'Volver'
    });

    if (!confirmado) return;

    this.guardandoCupos = true;

    // Endpoint protegido por política SuperAdmin en .NET.
    this.superAdminService.actualizarCantidadProfesionales(
      this.organizacionId,
      {
        cantidadProfesionales: cantidad,
        ...(esMp ? { importeTotal: Number(importeTotal) } :
          (importeTotal != null ? { importeTotal: Number(importeTotal) } : {}))
      }
    ).subscribe({
      next: (respuesta) => {
        this.guardandoCupos = false;
        this.alertaService.success(
          'Cupos actualizados',
          respuesta.message || 'Se actualizó el límite de profesionales.'
        );
        this.cargarTodo();
      },
      error: (error) => {
        this.guardandoCupos = false;
        this.cargarCambiosRevision();
        this.alertaService.error(
          'No se pudieron cambiar los cupos',
          this.obtenerMensajeError(error, 'No se aplicó el cambio. Intentá nuevamente.')
        );
      }
    });
  }

  cargarCambiosRevision(): void {
    if (!this.organizacionId) return;
    const requestId = ++this.cambiosRevisionRequestId;
    this.cargandoCambiosRevision = true;
    this.errorCambiosRevision = false;
    this.cambiosRevision = [];
    this.superAdminService.obtenerCambiosRevision(this.organizacionId).subscribe({
      next: respuesta => {
        if (requestId !== this.cambiosRevisionRequestId) return;
        this.cargandoCambiosRevision = false;
        if (!Array.isArray(respuesta?.items)) {
          this.errorCambiosRevision = true;
          return;
        }
        this.cambiosRevision = respuesta.items;
      },
      error: () => {
        if (requestId !== this.cambiosRevisionRequestId) return;
        this.cargandoCambiosRevision = false;
        this.errorCambiosRevision = true;
      }
    });
  }

  async recuperarPago(): Promise<void> {
    const facturaId = this.facturaRecuperar.trim();
    if (!/^\d+$/.test(facturaId) || this.operacionFacturacionEnCurso) return;
    const confirmado = await this.dialogoService.confirmar({
      titulo: 'Recuperar pago aprobado',
      mensaje: `Se verificará la factura recurrente ${facturaId} de esta organización. No se generará otro cobro.`,
      textoConfirmar: 'Recuperar pago', textoCancelar: 'Volver'
    });
    if (!confirmado || this.operacionFacturacionEnCurso) return;
    this.recuperandoPago = true;
    this.superAdminService.recuperarPagoSuscripcion(this.organizacionId, facturaId).subscribe({
      next: respuesta => {
        this.recuperandoPago = false;
        this.facturaRecuperar = '';
        this.alertaService.success('Pago recuperado', respuesta.message || 'Pago registrado.');
        this.cargarTodo();
      },
      error: error => {
        this.recuperandoPago = false;
        this.alertaService.error('No se pudo recuperar el pago', this.obtenerMensajeError(error, 'Revisá la factura y volvé a intentar.'));
      }
    });
  }

  async conciliarCambio(cambio: CambioSuscripcionRevision): Promise<void> {
    if (this.operacionFacturacionEnCurso) return;
    const confirmado = await this.dialogoService.confirmar({
      titulo: 'Conciliar cambio pendiente',
      mensaje: `Se verificará en Mercado Pago el cambio de ${this.formatearDinero(cambio.importeAnterior)} a ${this.formatearDinero(cambio.importeNuevo)}. No se modificará el importe remoto.`,
      textoConfirmar: 'Conciliar', textoCancelar: 'Volver'
    });
    if (!confirmado || this.operacionFacturacionEnCurso) return;
    this.conciliandoCambioId = cambio.id;
    this.superAdminService.conciliarCambioSuscripcion(this.organizacionId, cambio.id).subscribe({
      next: respuesta => {
        this.conciliandoCambioId = null;
        this.alertaService.success('Cambio conciliado', respuesta.message || 'Cambio aplicado.');
        this.cargarTodo();
      },
      error: error => {
        this.conciliandoCambioId = null;
        this.alertaService.error('No se pudo conciliar', this.obtenerMensajeError(error, 'El cambio sigue pendiente de revisión.'));
        this.cargarCambiosRevision();
      }
    });
  }

  get ultimoPago():
    PagoSuscripcion | null {

    return this.pagos.find(p => p.estado.toLowerCase() === 'aprobado') ?? null;
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


    if (valor === 'activa' || valor === 'aprobado') {
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
          2
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


  private crearCuposForm(): CuposProfesionalesForm {
    return {
      cantidadProfesionales:
        this.detalle?.suscripcion?.cantidadProfesionales ?? null,
      importeTotal: null
    };
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
