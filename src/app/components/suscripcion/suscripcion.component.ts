import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  SuscripcionService,
  WhatsAppCompraMensajes,
  WhatsAppEstadoCupo,
  WhatsAppPaquete,
  SolicitudPlanPersonalizadoRequest
} from '../../services/suscripcion.service';

import { Suscripcion } from '../../interfaces/suscripcion';

import { Plan } from '../../interfaces/plan';

import { PlanService } from '../../services/plan-service.service';

import { AlertaService } from '../../services/alerta.service';

import { DialogoService } from '../../services/dialogo.service';

@Component({

  selector: 'app-suscripcion',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './suscripcion.component.html',

  styleUrl: './suscripcion.component.css'

})

export class SuscripcionComponent implements OnInit {

  // ==========================================

  // SUSCRIPCIÓN ACTUAL

  // ==========================================

  suscripcion: Suscripcion | null = null;

  // ==========================================

  // PLAN

  // ==========================================

  plan: Plan | null = null;

  // ==========================================

  // ESTADOS

  // ==========================================

  cargando = true;

  cargandoPlan = false;

  error = false;

  sinSuscripcion = false;

  // ==========================================

  // CONTRATACIÓN

  // ==========================================

  cantidadProfesionales = 1;

  cotizacion: any = null;

  cotizando = false;


  // ==========================================
  // CAMBIO DE PLAN (SUSCRIPCIÓN EXISTENTE)
  // ==========================================
  mostrarCambioPlan = false;
  cargandoCambioPlan = false;
  cotizandoCambioPlan = false;
  confirmandoCambioPlan = false;
  cantidadActualCambio: number | null = null;
  cantidadNuevaCambio = 1;
  planCambio: Plan | null = null;
  cotizacionCambio: any = null;
  errorCambioPlan = '';
  private cotizacionCambioRequestId = 0;

  // ==========================================
  // PLAN PERSONALIZADO
  // ==========================================

  mostrarFormularioPlanPersonalizado = false;

  telefonoPlanPersonalizado = '';

  mensajePlanPersonalizado = '';

  enviandoPlanPersonalizado = false;

  solicitudPlanPersonalizadoEnviada = false;

  // ==========================================

  // CONTROL DE COTIZACIONES

  // ==========================================

  private cotizacionRequestId = 0;

  // ==========================================

  // WHATSAPP

  // ==========================================

  whatsappEstado:

    WhatsAppEstadoCupo | null =

      null;

  paquetesWhatsApp:

    WhatsAppPaquete[] =

      [];

  comprasWhatsApp:

    WhatsAppCompraMensajes[] =

      [];

  cargandoWhatsApp =

    false;

  cargandoPaquetesWhatsApp =

    false;

  cargandoComprasWhatsApp =

    false;

  paqueteComprandoId:

    string | null =

      null;

  // Modal de distribución de mensajes: no altera el tamaño de las tarjetas.
  paqueteWhatsAppSeleccionado: WhatsAppPaquete | null = null;
  cantidadUtilidadWhatsApp = 0;
  cantidadMarketingWhatsApp = 0;
  readonly precioUtilidadWhatsApp = 60;
  readonly precioMarketingWhatsApp = 130;
  // null: compra para la clínica. Para profesionales, el backend
  // debe resolver el perfil autenticado o recibir su ID válido.
  profesionalIdCompraWhatsApp: string | null = null;

  get subtotalUtilidadWhatsApp(): number {
    return this.cantidadUtilidadWhatsApp * this.precioUtilidadWhatsApp;
  }

  get subtotalMarketingWhatsApp(): number {
    return this.cantidadMarketingWhatsApp * this.precioMarketingWhatsApp;
  }

  get totalCompraWhatsApp(): number {
    return this.subtotalUtilidadWhatsApp + this.subtotalMarketingWhatsApp;
  }

  get distribucionWhatsAppValida(): boolean {
    const paquete = this.paqueteWhatsAppSeleccionado;
    return !!paquete &&
      Number.isInteger(this.cantidadUtilidadWhatsApp) &&
      Number.isInteger(this.cantidadMarketingWhatsApp) &&
      this.cantidadUtilidadWhatsApp >= 0 &&
      this.cantidadMarketingWhatsApp >= 0 &&
      this.cantidadUtilidadWhatsApp + this.cantidadMarketingWhatsApp === paquete.cantidadMensajes;
  }

  actualizarCantidadUtilidadWhatsApp(valor: number | string): void {
    const maximo = this.paqueteWhatsAppSeleccionado?.cantidadMensajes ?? 0;
    const numero = Number(valor);
    this.cantidadUtilidadWhatsApp = Number.isFinite(numero)
      ? Math.min(maximo, Math.max(0, Math.trunc(numero))) : 0;
    this.cantidadMarketingWhatsApp = maximo - this.cantidadUtilidadWhatsApp;
  }

  actualizarCantidadMarketingWhatsApp(valor: number | string): void {
    const maximo = this.paqueteWhatsAppSeleccionado?.cantidadMensajes ?? 0;
    const numero = Number(valor);
    this.cantidadMarketingWhatsApp = Number.isFinite(numero)
      ? Math.min(maximo, Math.max(0, Math.trunc(numero))) : 0;
    this.cantidadUtilidadWhatsApp = maximo - this.cantidadMarketingWhatsApp;
  }

  cerrarModalCompraWhatsApp(): void {
    if (this.paqueteComprandoId) return;
    this.paqueteWhatsAppSeleccionado = null;
  }

  // ==========================================

  // CONSTRUCTOR

  // ==========================================

  constructor(

    private suscripcionService: SuscripcionService,

    private planService: PlanService,

    private alertaService: AlertaService,

    private dialogoService: DialogoService

  ) {}

  // ==========================================

  // INIT

  // ==========================================

  ngOnInit(): void {

    this.cargarSuscripcion();

  }

  // ==========================================

  // SUSCRIPCIÓN ACTUAL

  // ==========================================

  cargarSuscripcion(): void {

    this.cargando = true;

    this.error = false;

    this.sinSuscripcion = false;

    this.suscripcionService

      .obtenerActual()

      .subscribe({

        next: (respuesta) => {

          console.log(

            'Suscripción actual:',

            respuesta

          );

          this.suscripcion = respuesta;

          this.cargando = false;

          if (

            respuesta.estado === 'Activa'

            ||

            respuesta.estado === 'EnPrueba'

          ) {

            this.cargarWhatsApp();

          }

        },

        error: (err: any) => {

          console.error(

            'Error al obtener suscripción:',

            err

          );

          this.cargando = false;

          // ==================================

          // 404 = NO TIENE SUSCRIPCIÓN

          // ==================================

          if (err.status === 404) {

            this.sinSuscripcion = true;

            this.suscripcion = null;

            this.cargarPlan();

            return;

          }

          // ==================================

          // ERROR REAL

          // ==================================

          this.error = true;

          this.alertaService.error(

            'No se pudo cargar la suscripción',

            'Ocurrió un problema al obtener la información de tu cuenta.'

          );

        }

      });

  }

  // ==========================================

  // CARGAR PLAN

  // ==========================================

  cargarPlan(): void {

    this.cargandoPlan = true;

    this.planService

      .obtenerTodos()

      .subscribe({

        next: (planes: Plan[]) => {

          console.log(

            'Planes disponibles:',

            planes

          );

          this.plan = planes.find(

            (p: Plan) =>

              p.activo &&

              p.nombre

                .toLowerCase()

                .includes('profesional')

          ) ?? null;

          this.cargandoPlan = false;

          if (!this.plan) {

            console.warn(

              'No se encontró el Plan Profesional.'

            );

            return;

          }

          console.log(

            'Plan seleccionado:',

            this.plan

          );

          // Cotización inicial

          this.cotizar();

        },

        error: (err: any) => {

          console.error(

            'Error al obtener los planes:',

            err

          );

          this.cargandoPlan = false;

          this.error = true;

          this.alertaService.error(

            'No se pudo cargar el plan',

            'Intentá nuevamente en unos segundos.'

          );

        }

      });

  }

  // ==========================================

  // ESTADOS DE SUSCRIPCIÓN

  // ==========================================

  get esPendiente(): boolean {

    return this.suscripcion?.estado === 'Pendiente';

  }

get esCancelada(): boolean {

  return this.suscripcion?.estado === 'Cancelada';

}

  get esActiva(): boolean {

    return this.suscripcion?.estado === 'Activa';

  }

  get esEnPrueba(): boolean {

    return this.suscripcion?.estado === 'EnPrueba';

  }

get secretariasIncluidas(): number {

  return Math.ceil(this.cantidadProfesionales / 3);

}

  // ==========================================

  // CANTIDAD DE PROFESIONALES

  // ==========================================

  aumentarProfesionales(): void {

    // Permitimos llegar a 16.

    // 16 o más = plan personalizado.

    if (this.cantidadProfesionales >= 16) {

      return;

    }

    this.cantidadProfesionales++;

    this.cotizar();

  }

disminuirProfesionales(): void {

  if (this.cantidadProfesionales <= 1) {

    return;

  }

  this.cantidadProfesionales--;

  this.cotizar();

}

  // ==========================================

  // COTIZAR

  // ==========================================

  cotizar(): void {

  if (!this.plan) {

    return;

  }

  const requestId = ++this.cotizacionRequestId;

  this.cotizando = true;

  // NO ponemos cotizacion = null.

  // Así el contenido no desaparece y la página

  // no cambia de altura mientras esperamos.

  const cantidadSolicitada = this.cantidadProfesionales;

  this.suscripcionService

    .cotizar(

      this.plan.id,

      cantidadSolicitada

    )

    .subscribe({

      next: (respuesta) => {

        // Si esta respuesta pertenece a una petición

        // anterior, la ignoramos.

        if (requestId !== this.cotizacionRequestId) {

          return;

        }

        // Seguridad extra:

        // verificamos que la respuesta corresponda

        // a la cantidad que solicitamos.

        if (

          respuesta.cantidadProfesionales !==

          cantidadSolicitada

        ) {

          console.warn(

            'Cotización descartada por cantidad incorrecta.',

            {

              solicitada: cantidadSolicitada,

              recibida: respuesta.cantidadProfesionales

            }

          );

          return;

        }

        console.log(

          'Cotización:',

          respuesta

        );

        this.cotizacion = respuesta;

        this.cotizando = false;

      },

      error: (err: any) => {

        if (requestId !== this.cotizacionRequestId) {

          return;

        }

        console.error(

          'Error al cotizar:',

          err

        );

        this.cotizando = false;

      }

    });

}

  // ==========================================

  // FORMATEAR PRECIO

  // ==========================================

  formatearPrecio(valor: number): string {

    return new Intl.NumberFormat(

      'es-AR',

      {

        maximumFractionDigits: 0

      }

    ).format(valor);

  }

  // ==========================================

  // COMPLETAR SUSCRIPCIÓN EXISTENTE

  // ==========================================

  completarSuscripcion(): void {

    if (!this.suscripcion?.initPoint) {

      this.alertaService.warning(

        'Pago no disponible',

        'Todavía no hay un enlace de pago disponible para esta suscripción.'

      );

      return;

    }

    window.location.href =

      this.suscripcion.initPoint;

  }

  // ==========================================

  // CONTRATAR PLAN

  // ==========================================

  contratarPlan(): void {

    if (!this.plan) {

      return;

    }

    if (!this.cotizacion) {

      return;

    }

    if (this.cotizacion.esPlanPersonalizado) {

      return;

    }

    const datosCheckout = {

      planId: this.plan.id,

      cantidadProfesionales:

        this.cantidadProfesionales,

      modalidad: 'Mensual'

    };

    console.log(

      'Creando checkout:',

      datosCheckout

    );

    this.cotizando = true;

    this.suscripcionService

      .crearCheckout(datosCheckout)

      .subscribe({

        next: (respuesta) => {

          console.log(

            'Checkout creado:',

            respuesta

          );

          this.cotizando = false;

          this.suscripcion = respuesta;

          this.sinSuscripcion = false;

          if (respuesta.initPoint) {

            window.location.href =

              respuesta.initPoint;

            return;

          }

          console.warn(

            'El checkout fue creado pero no llegó initPoint.'

          );

        },

        error: (err: any) => {

          console.error(

            'Error al crear checkout:',

            err

          );

          this.cotizando = false;

          this.alertaService.error(

            'No se pudo crear la suscripción',

            err?.error?.message

            ||

            'Intentá nuevamente.'

          );

        }

      });

  }

  // ==========================================

  // CAMBIAR PLAN

  // ==========================================

  cambiarPlan(): void {
    if (!this.suscripcion || (!this.esActiva && !this.esEnPrueba)) {
      this.alertaService.warning(
        'Cambio de plan no disponible',
        'Solo podés modificar una suscripción activa o en prueba.'
      );
      return;
    }

    // Priorizamos la cantidad de la suscripción real. El cupo de
    // WhatsApp se utiliza como alternativa si el DTO no la expone.
    const suscripcion = this.suscripcion as Suscripcion & {
      cantidadProfesionales?: number;
      cantidadProfesionalesContratados?: number;
    };
    const cantidades = [
      suscripcion.cantidadProfesionales,
      suscripcion.cantidadProfesionalesContratados,
      this.whatsappEstado?.cantidadProfesionales
    ];
    const actual = cantidades.find(
      (valor): valor is number =>
        typeof valor === 'number' &&
        Number.isInteger(valor) && valor > 0
    );

    this.mostrarCambioPlan = true;
    this.errorCambioPlan = '';
    this.planCambio = null;
    this.cotizacionCambio = null;
    this.cantidadActualCambio = actual ?? null;
    this.cantidadNuevaCambio = actual ?? 1;
    this.cargandoCambioPlan = true;
    this.cotizacionCambioRequestId++;

    if (actual == null) {
      this.cargandoCambioPlan = false;
      this.errorCambioPlan =
        'No pudimos conocer la cantidad contratada. Revisá la respuesta de /suscripciones/actual.';
      return;
    }

    this.planService.obtenerTodos().subscribe({
      next: (planes: Plan[]) => {
        if (!this.mostrarCambioPlan) return;
        const nombreActual = String(this.suscripcion?.plan ?? '')
          .trim().toLowerCase();
        this.planCambio = planes.find(p =>
          p.activo && p.nombre.trim().toLowerCase() === nombreActual
        ) ?? planes.find(p =>
          p.activo && p.nombre.toLowerCase().includes('profesional')
        ) ?? null;

        this.cargandoCambioPlan = false;
        if (!this.planCambio) {
          this.errorCambioPlan =
            'No encontramos un plan disponible para cotizar el cambio.';
          return;
        }
        this.cotizarNuevoPlan();
      },
      error: () => {
        this.cargandoCambioPlan = false;
        this.errorCambioPlan =
          'No pudimos obtener los planes disponibles. Intentá nuevamente.';
      }
    });
  }

  cambiarProfesionales(): void {
    this.cambiarPlan();
  }

  cerrarCambioPlan(): void {
    if (this.confirmandoCambioPlan) return;
    this.mostrarCambioPlan = false;
    this.cotizacionCambioRequestId++;
    this.cotizandoCambioPlan = false;
    this.cotizacionCambio = null;
    this.planCambio = null;
  }

  modificarCantidadCambio(diferencia: number): void {
    if (this.cargandoCambioPlan || this.confirmandoCambioPlan) return;
    const nuevaCantidad = Math.max(1, Math.min(15,
      this.cantidadNuevaCambio + diferencia
    ));
    if (nuevaCantidad === this.cantidadNuevaCambio) return;
    this.cantidadNuevaCambio = nuevaCantidad;
    this.cotizacionCambio = null;
    this.cotizarNuevoPlan();
  }

  cotizarNuevoPlan(): void {
    if (!this.planCambio || !this.mostrarCambioPlan) return;
    const idSolicitud = ++this.cotizacionCambioRequestId;
    const cantidad = this.cantidadNuevaCambio;
    this.cotizandoCambioPlan = true;
    this.errorCambioPlan = '';

    this.suscripcionService.cotizar(this.planCambio.id, cantidad)
      .subscribe({
        next: (respuesta: any) => {
          if (!this.mostrarCambioPlan || idSolicitud !== this.cotizacionCambioRequestId) return;
          this.cotizandoCambioPlan = false;
          if (Number(respuesta?.cantidadProfesionales) !== cantidad ||
              !Number.isFinite(Number(respuesta?.importeTotal)) ||
              Number(respuesta.importeTotal) <= 0 ||
              respuesta?.esPlanPersonalizado) {
            this.cotizacionCambio = null;
            this.errorCambioPlan =
              'No se pudo obtener una cotización válida para esta cantidad.';
            return;
          }
          this.cotizacionCambio = respuesta;
        },
        error: () => {
          if (!this.mostrarCambioPlan || idSolicitud !== this.cotizacionCambioRequestId) return;
          this.cotizandoCambioPlan = false;
          this.cotizacionCambio = null;
          this.errorCambioPlan = 'Error al cotizar el nuevo importe.';
        }
      });
  }

  async confirmarCambioPlan(): Promise<void> {
    if (this.confirmandoCambioPlan || this.cotizandoCambioPlan ||
        !this.cotizacionCambio || !this.suscripcion ||
        this.cantidadActualCambio == null ||
        this.cantidadNuevaCambio === this.cantidadActualCambio ||
        Number(this.cotizacionCambio.cantidadProfesionales) !== this.cantidadNuevaCambio) {
      return;
    }

    this.confirmandoCambioPlan = true;
    const nuevaCantidad = this.cantidadNuevaCambio;
    let confirmado = false;
    try {
      confirmado = await this.dialogoService.confirmar({
        titulo: 'Confirmar cambio de profesionales',
        mensaje: `Vas a solicitar el cambio de ${this.cantidadActualCambio} a ${nuevaCantidad} profesionales. ` +
          `El precio mensual cotizado es $${this.formatearPrecio(this.cotizacionCambio.importeTotal)}. ` +
          'La aplicación del cambio y la facturación dependen de la confirmación del servidor y Mercado Pago.',
        textoConfirmar: 'Confirmar cambio',
        textoCancelar: 'Volver'
      });
    } catch {
      confirmado = false;
    }

    if (!confirmado) {
      this.confirmandoCambioPlan = false;
      return;
    }

    this.suscripcionService.cambiarCantidadProfesionales(nuevaCantidad)
      .subscribe({
        next: (respuesta: any) => {
          this.confirmandoCambioPlan = false;
          this.cerrarCambioPlan();
          this.alertaService.success(
            'Solicitud de cambio procesada',
            respuesta?.message ||
              'El servidor recibió la solicitud. Verificá el estado de tu plan y el importe de facturación.'
          );
          this.cargarSuscripcion();
        },
        error: (err: any) => {
          this.confirmandoCambioPlan = false;
          this.alertaService.error(
            'No se pudo cambiar el plan',
            err?.error?.message || 'El servidor rechazó el cambio. No reintentes sin verificar el estado.'
          );
        }
      });
  }

  // ==========================================

  // CANCELAR

  // ==========================================

  async cancelarSuscripcion():

    Promise<void> {

    if (!this.suscripcion) {

      return;

    }

    const confirmado =

      await this.dialogoService

        .confirmar({

          titulo:

            'Cancelar suscripción',

          mensaje:

            '¿Querés cancelar la suscripción de esta organización?',

          textoConfirmar:

            'Cancelar suscripción',

          textoCancelar:

            'Volver'

        });

    if (!confirmado) {

      return;

    }

    this.suscripcionService

      .cancelar()

      .subscribe({

        next: () => {

          this.alertaService.success(

            'Suscripción cancelada',

            'La suscripción fue cancelada correctamente.'

          );

          this.cargarSuscripcion();

        },

        error: (err: any) => {

          this.alertaService.error(

            'No se pudo cancelar',

            err?.error?.message

            ||

            'Intentá nuevamente.'

          );

        }

      });

  }

// ==========================================

// VOLVER A SUSCRIBIRSE

// ==========================================

async reactivarSuscripcion():

  Promise<void> {

  if (!this.suscripcion) {

    return;

  }

  const confirmado =

    await this.dialogoService

      .confirmar({

        titulo:

          'Volver a suscribirme',

        mensaje:

          'Vas a volver a contratar el mismo plan. El cobro comenzará ahora y no incluye un nuevo período de prueba.',

        textoConfirmar:

          'Continuar',

        textoCancelar:

          'Cancelar'

      });

  if (!confirmado) {

    return;

  }

  this.suscripcionService

    .reactivar()

    .subscribe({

      next: (respuesta) => {

        if (respuesta.initPoint) {

          window.location.href =

            respuesta.initPoint;

          return;

        }

        this.alertaService.error(

          'No se pudo iniciar el pago',

          'Mercado Pago no devolvió el enlace de pago.'

        );

      },

      error: (err: any) => {

        this.alertaService.error(

          'No se pudo reactivar la suscripción',

          err?.error?.message

          ||

          'Intentá nuevamente.'

        );

      }

    });

}

  // ==========================================

  // WHATSAPP - CARGA GENERAL

  // ==========================================

  cargarWhatsApp(): void {

    this.cargarEstadoWhatsApp();

    this.cargarPaquetesWhatsApp();

    this.cargarComprasWhatsApp();

  }

  // ==========================================

  // WHATSAPP - ESTADO

  // ==========================================

  cargarEstadoWhatsApp(): void {

    this.cargandoWhatsApp =

      true;

    this.suscripcionService

      .obtenerEstadoWhatsApp()

      .subscribe({

        next: (respuesta) => {

          this.whatsappEstado =

            respuesta;

          this.cargandoWhatsApp =

            false;

        },

        error: (err: any) => {

          console.error(

            'Error al obtener cupo WhatsApp:',

            err

          );

          this.whatsappEstado =

            null;

          this.cargandoWhatsApp =

            false;

        }

      });

  }

  // ==========================================

  // WHATSAPP - PAQUETES

  // ==========================================

  cargarPaquetesWhatsApp(): void {

    this.cargandoPaquetesWhatsApp =

      true;

    this.suscripcionService

      .obtenerPaquetesWhatsApp()

      .subscribe({

        next: (respuesta) => {

          this.paquetesWhatsApp =

            respuesta.items

            ??

            [];

          this.cargandoPaquetesWhatsApp =

            false;

        },

        error: (err: any) => {

          console.error(

            'Error al obtener paquetes WhatsApp:',

            err

          );

          this.paquetesWhatsApp =

            [];

          this.cargandoPaquetesWhatsApp =

            false;

          this.alertaService.error(

            'No se pudieron cargar los paquetes',

            'Intentá nuevamente en unos segundos.'

          );

        }

      });

  }

  // ==========================================

  // WHATSAPP - HISTORIAL DE COMPRAS

  // ==========================================

  cargarComprasWhatsApp(): void {

    this.cargandoComprasWhatsApp =

      true;

    this.suscripcionService

      .obtenerComprasWhatsApp()

      .subscribe({

        next: (respuesta) => {

          this.comprasWhatsApp =

            respuesta.items

            ??

            [];

          this.cargandoComprasWhatsApp =

            false;

        },

        error: (err: any) => {

          console.error(

            'Error al obtener compras WhatsApp:',

            err

          );

          this.comprasWhatsApp =

            [];

          this.cargandoComprasWhatsApp =

            false;

        }

      });

  }

  // ==========================================

  // WHATSAPP - COMPRAR PAQUETE

  // ==========================================

  comprarPaqueteWhatsApp(paquete: WhatsAppPaquete): void {
    if (this.paqueteComprandoId) return;
    this.paqueteWhatsAppSeleccionado = paquete;
    this.cantidadUtilidadWhatsApp = paquete.cantidadMensajes;
    this.cantidadMarketingWhatsApp = 0;
  }

  confirmarCompraWhatsApp(): void {
    const paquete = this.paqueteWhatsAppSeleccionado;
    if (!paquete || this.paqueteComprandoId || !this.distribucionWhatsAppValida) return;

    this.paqueteComprandoId = paquete.id;
    this.suscripcionService.comprarPaqueteWhatsApp({
      paqueteId: paquete.id,
      profesionalId: this.profesionalIdCompraWhatsApp,
      cantidadUtilidad: this.cantidadUtilidadWhatsApp,
      cantidadMarketing: this.cantidadMarketingWhatsApp
    }).subscribe({
      next: (respuesta) => {
        this.paqueteComprandoId = null;
        if (respuesta.compra?.initPoint) {
          window.location.href = respuesta.compra.initPoint;
          return;
        }
        this.alertaService.error(
          'No se pudo iniciar el pago',
          'Mercado Pago no devolvió el enlace de pago.'
        );
      },
      error: (err: any) => {
        this.paqueteComprandoId = null;
        this.alertaService.error(
          'No se pudo crear la compra',
          err?.error?.message || 'Intentá nuevamente.'
        );
      }
    });
  }

  // ==========================================

  // WHATSAPP - PAQUETE PERSONALIZADO

  // ==========================================

  solicitarPaqueteWhatsAppPersonalizado():

    void {

    const numero =

      '5492235824005';

    const mensaje =

      'Hola, quiero consultar por un paquete personalizado de mensajes de WhatsApp para CoriaSalud.';

    const url =

      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(

      url,

      '\_blank'

    );

  }

  // ==========================================

  // FORMATEAR NÚMERO

  // ==========================================

  formatearNumero(

    valor:

      number

  ):

    string {

    return new Intl.NumberFormat(

      'es-AR'

    )

      .format(

        valor

      );

  }

  // ==========================================

  // CLASE DE COMPRA

  // ==========================================

  claseCompraWhatsApp(

    estado:

      string

  ):

    string {

    const valor =

      String(

        estado

        ??

        ''

      )

        .toLowerCase();

    if (

      valor === 'pagada'

      ||

      valor === 'aprobada'

    ) {

      return 'purchase-paid';

    }

    if (

      valor === 'cancelada'

      ||

      valor === 'rechazada'

    ) {

      return 'purchase-cancelled';

    }

    return 'purchase-pending';

  }

// ==========================================
// PLAN PERSONALIZADO
// ==========================================

abrirFormularioPlanPersonalizado(): void {

  this.mostrarFormularioPlanPersonalizado = true;

}


cerrarFormularioPlanPersonalizado(): void {

  if (this.enviandoPlanPersonalizado) {
    return;
  }

  this.mostrarFormularioPlanPersonalizado = false;

}


solicitarPlanPersonalizado(): void {

  if (this.enviandoPlanPersonalizado) {
    return;
  }

  const telefono =
    this.telefonoPlanPersonalizado.trim();

  if (!telefono) {

    this.alertaService.warning(
      'Falta tu teléfono',
      'Ingresá un número de teléfono o WhatsApp para que podamos contactarte.'
    );

    return;
  }

  const request:
    SolicitudPlanPersonalizadoRequest = {

      cantidadProfesionales:
        this.cantidadProfesionales,

      telefonoContacto:
        telefono,

      mensaje:
        this.mensajePlanPersonalizado.trim()
        || null

    };

  this.enviandoPlanPersonalizado = true;

  this.suscripcionService
    .solicitarPlanPersonalizado(
      request
    )
    .subscribe({

      next: (respuesta) => {

        this.enviandoPlanPersonalizado = false;

        this.solicitudPlanPersonalizadoEnviada = true;

        this.mostrarFormularioPlanPersonalizado = false;

        this.alertaService.success(
          'Solicitud enviada',
          respuesta.message
          || 'Recibimos tu solicitud. Nos pondremos en contacto con vos.'
        );

      },

      error: (err: any) => {

        this.enviandoPlanPersonalizado = false;

        this.alertaService.error(
          'No se pudo enviar la solicitud',
          err?.error?.message
          || 'Intentá nuevamente.'
        );

      }

    });

}

}
