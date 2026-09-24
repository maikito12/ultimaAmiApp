import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  SuscripcionService,
  WhatsAppCompraMensajes,
  WhatsAppEstadoCupo,
  WhatsAppPaquete
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
    CommonModule
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

        error: (err) => {

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

        error: (err) => {

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

      error: (err) => {

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

        error: (err) => {

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

    console.log(
      'Cambiar plan'
    );
  }


  // ==========================================
  // CAMBIAR PROFESIONALES
  // ==========================================

  cambiarProfesionales(): void {

    console.log(
      'Cambiar cantidad de profesionales'
    );
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

        error: (err) => {

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

      error: (err) => {

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

        error: (err) => {

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

        error: (err) => {

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

        error: (err) => {

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

  async comprarPaqueteWhatsApp(
    paquete:
      WhatsAppPaquete
  ):
    Promise<void> {

    if (
      this.paqueteComprandoId
    ) {
      return;
    }


    const confirmado =
      await this.dialogoService
        .confirmar({

          titulo:
            'Comprar mensajes extra',

          mensaje:
            `Vas a solicitar ${this.formatearNumero(paquete.cantidadMensajes)} mensajes por $${this.formatearPrecio(paquete.precio)}.`,

          textoConfirmar:
            'Continuar',

          textoCancelar:
            'Volver'

        });


    if (!confirmado) {
      return;
    }


    this.paqueteComprandoId =
      paquete.id;


    this.suscripcionService
      .comprarPaqueteWhatsApp(
        paquete.id
      )
      .subscribe({

       next: (respuesta) => {

  this.paqueteComprandoId = null;

  if (respuesta.compra.initPoint) {

    window.location.href =
      respuesta.compra.initPoint;

    return;
  }

  this.alertaService.error(
    'No se pudo iniciar el pago',
    'Mercado Pago no devolvió el enlace de pago.'
  );
},

        error: (err) => {

          this.paqueteComprandoId =
            null;


          this.alertaService.error(
            'No se pudo crear la compra',
            err?.error?.message
            ||
            'Intentá nuevamente.'
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
      'Hola, quiero consultar por un paquete personalizado de mensajes de WhatsApp para AmiApp.';


    const url =
      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;


    window.open(
      url,
      '_blank'
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


contactarPlanPersonalizado(): void {

  const numero = '5492235824005';

  const mensaje =
    `Hola, quiero consultar por un plan personalizado de AmiUp. ` +
    `Necesitamos ${this.cantidadProfesionales} profesionales.`;

  const url =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
}

}