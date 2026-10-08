import { CommonModule } from '@angular/common';



import {

  Component,

  OnInit

} from '@angular/core';



import {

  FormsModule

} from '@angular/forms';



import {

  Router

} from '@angular/router';



import {

  catchError,

  forkJoin,

  of

} from 'rxjs';







import {

  DialogoService

} from '../../services/dialogo.service';



import {

  AuthService

} from '../../services/auth-service.service';



import {

  ActualizarPrecioSuscripcionRequest,

  MetodoPagoManual,

  PagoSuscripcion,

  RegistrarPagoManualRequest,

  SolicitudPlanPersonalizado,

  SuperAdminNegocio,

  SuperAdminOrganizacion,

  SuperAdminResumen,

  SuperAdminService

} from '../../services/super-admin.service';

import { AlertaService } from '../../services/alerta.service';
import { PlanService } from '../../services/plan-service.service';
import { Plan } from '../../interfaces/plan';





type SeccionSuperAdmin =

  | 'inicio'

  | 'organizaciones'

  | 'planes'

  | 'suscripciones'

  | 'plataforma';





interface PagoManualForm {



  metodoPago:

    MetodoPagoManual;



  importe:

    number | null;



  referencia:

    string;



  observaciones:

    string;



}





interface PrecioSuscripcionForm {



  importeTotal:

    number | null;



  precioPorProfesional:

    number | null;



}

interface PlanPersonalizadoForm {
  cantidadProfesionales: number;

  cantidadSecretarias: number;

  modalidad:
    'Mensual' | 'Anual';

  precioPorProfesional:
    number | null;

  importeTotal:
    number | null;
}





@Component({



  selector:

    'app-super-admin',



  standalone:

    true,



  imports: [

    CommonModule,

    FormsModule

  ],



  templateUrl:

    './super-admin.component.html',



  styleUrl:

    './super-admin.component.css'



})

export class SuperAdminComponent

  implements OnInit {





  // =====================================================

  // NAVEGACIÓN

  // =====================================================



  seccionActiva:

    SeccionSuperAdmin =

      'inicio';





  // =====================================================

  // ESTADOS

  // =====================================================



  cargando =

    true;



  errorCarga =

    false;





  // =====================================================

  // DATOS

  // =====================================================



  resumen:

    SuperAdminResumen | null =

      null;





  negocio:

    SuperAdminNegocio | null =

      null;





  organizaciones:

    SuperAdminOrganizacion[] =

      [];





  solicitudes:

    SolicitudPlanPersonalizado[] =

      [];



  // =====================================================

  // PLAN PERSONALIZADO

  // =====================================================

  solicitudPlanSeleccionada:
    SolicitudPlanPersonalizado | null =
      null;


  planPersonalizadoForm:
    PlanPersonalizadoForm = {
      cantidadProfesionales: 16,
       cantidadSecretarias: 0,
      modalidad: 'Mensual',
      precioPorProfesional: null,
      importeTotal: null
    };


  creandoPlanPersonalizado =
    false;


  generandoCheckoutPersonalizado =
    false;


  suscripcionPersonalizadaCreadaId:
    string | null =
      null;


  checkoutPersonalizadoUrl:
    string | null =
      null;






  // =====================================================

  // GESTIÓN DE SUSCRIPCIÓN

  // =====================================================



  organizacionGestion:

    SuperAdminOrganizacion | null =

      null;





  pagosOrganizacion:

    PagoSuscripcion[] =

      [];





  cargandoPagos =

    false;





  guardandoPago =

    false;





  guardandoPrecio =

    false;





  pagoForm:

    PagoManualForm =

      this.crearPagoForm();





  precioForm:

    PrecioSuscripcionForm =

      this.crearPrecioForm();



planBasePersonalizado:
  Plan | null =
    null;


cargandoPlanBase =
  false;

  // =====================================================

  // CONSTRUCTOR

  // =====================================================



  constructor(



    private readonly superAdminService:

      SuperAdminService,



    private readonly authService:

      AuthService,



    private readonly router:

      Router,



    private readonly alertaService:

      AlertaService,



    private readonly dialogoService:

      DialogoService,
private readonly planService:
  PlanService,


  ) {}





  // =====================================================

  // INIT

  // =====================================================



 ngOnInit(): void {

  this.cargarPlanBasePersonalizado();

  this.cargarDashboard();

}





  // =====================================================

  // CARGAR TODO

  // =====================================================
// =====================================================
// CARGAR PLAN BASE PARA PERSONALIZADOS
// =====================================================

cargarPlanBasePersonalizado(): void {

  this.cargandoPlanBase =
    true;


  this.planService
    .obtenerTodos()
    .subscribe({

      next: (planes: Plan[]) => {

        this.planBasePersonalizado =
          planes.find(
            plan =>
              plan.activo
              &&
              plan.nombre
                .toLowerCase()
                .includes('profesional')
          )
          ??
          planes.find(
            plan =>
              plan.activo
          )
          ??
          null;


        this.cargandoPlanBase =
          false;


        if (
          !this.planBasePersonalizado
        ) {

          console.warn(
            'No se encontró un plan activo para usar como base.'
          );

        }

      },


      error: (error) => {

        console.error(
          'Error cargando plan base personalizado:',
          error
        );


        this.cargandoPlanBase =
          false;


        this.planBasePersonalizado =
          null;

      }

    });

}
  cargarDashboard(): void {



    this.cargando =

      true;



    this.errorCarga =

      false;





    forkJoin({



      resumen:

        this.superAdminService

          .obtenerResumen()

          .pipe(

            catchError(

              () =>

                of(null)

            )

          ),



      negocio:

        this.superAdminService

          .obtenerNegocio()

          .pipe(

            catchError(

              () =>

                of(null)

            )

          ),



      organizaciones:

        this.superAdminService

          .obtenerOrganizaciones()

          .pipe(

            catchError(

              () =>

                of([])

            )

          ),



      solicitudes:

        this.superAdminService

          .obtenerSolicitudesPlanPersonalizado()

          .pipe(

            catchError(

              () =>

                of([])

            )

          )



    })

      .subscribe({



        next: (

          respuesta

        ) => {



          this.resumen =

            respuesta.resumen;



          this.negocio =

            respuesta.negocio;



          const organizacionGestionId =

            this.organizacionGestion

              ?.id

            ??

            null;





          this.organizaciones =

            respuesta.organizaciones;





          if (

            organizacionGestionId

          ) {



            this.organizacionGestion =

              this.organizaciones

                .find(

                  x =>

                    x.id ===

                    organizacionGestionId

                )

              ??

              null;





            if (

              this.organizacionGestion

            ) {



              this.precioForm =

                this.crearPrecioForm(

                  this.organizacionGestion

                );



            }



          }





          this.solicitudes =

            respuesta.solicitudes;



          this.cargando =

            false;





          if (

            !respuesta.resumen

            &&

            !respuesta.negocio

            &&

            respuesta.organizaciones.length === 0

            &&

            respuesta.solicitudes.length === 0

          ) {



            this.errorCarga =

              true;



          }



        },



        error: (

          error

        ) => {



          console.error(

            'Error cargando Super Admin:',

            error

          );



          this.cargando =

            false;



          this.errorCarga =

            true;



        }



      });



  }





  // =====================================================

  // CAMBIAR SECCIÓN

  // =====================================================



  cambiarSeccion(

    seccion:

      SeccionSuperAdmin

  ): void {



    this.seccionActiva =

      seccion;



  }





  // =====================================================

  // ÚLTIMAS ORGANIZACIONES

  // =====================================================



  get ultimasOrganizaciones():

    SuperAdminOrganizacion[] {



    return this.organizaciones

      .slice(

        0,

        5

      );



  }





  // =====================================================

  // SOLICITUDES PENDIENTES

  // =====================================================



  get solicitudesPendientes():

    SolicitudPlanPersonalizado[] {



    return this.solicitudes

      .filter(

        x =>

          x.estado ===

          'Pendiente'

      );



  }





  // =====================================================

  // TOTAL ORGANIZACIONES

  // =====================================================



  get totalOrganizaciones():

    number {



    return (

      this.resumen

        ?.organizacionesActivas

      ??

      this.organizaciones

        .filter(

          x =>

            x.activo

        )

        .length

    );



  }





  // =====================================================

  // TOTAL PROFESIONALES

  // =====================================================



  get totalProfesionales():

    number {



    return (

      this.resumen

        ?.profesionalesActivos

      ??

      0

    );



  }





  // =====================================================

  // TOTAL USUARIOS

  // =====================================================



  get totalUsuarios():

    number {



    return (

      this.resumen

        ?.usuariosRegistrados

      ??

      0

    );



  }





  // =====================================================

  // MRR

  // =====================================================



  get mrr():

    number {



    return (

      this.negocio

        ?.ingresos

        .mrrEstimado

      ??

      0

    );



  }





  // =====================================================

  // ARR

  // =====================================================



  get arr():

    number {



    return (

      this.negocio

        ?.ingresos

        .arrEstimado

      ??

      0

    );



  }





  // =====================================================

  // SUSCRIPCIONES ACTIVAS

  // =====================================================



  get suscripcionesActivas():

    number {



    return (

      this.negocio

        ?.suscripciones

        .activas

      ??

      0

    );



  }





  // =====================================================

  // GESTIONAR SUSCRIPCIÓN

  // =====================================================



  gestionarSuscripcion(

    organizacion:

      SuperAdminOrganizacion

  ): void {



    this.router.navigate(

      [

        '/super-admin',

        'organizaciones',

        organizacion.id

      ]

    );



  }





  // =====================================================

  // CERRAR GESTIÓN

  // =====================================================



  cerrarGestionSuscripcion(): void {



    if (

      this.guardandoPago

      ||

      this.guardandoPrecio

    ) {

      return;

    }





    this.organizacionGestion =

      null;





    this.pagosOrganizacion =

      [];





    this.pagoForm =

      this.crearPagoForm();





    this.precioForm =

      this.crearPrecioForm();



  }





  // =====================================================

  // CARGAR HISTORIAL

  // =====================================================



  cargarPagos(

    organizacionId:

      string

  ): void {



    this.cargandoPagos =

      true;





    this.superAdminService

      .obtenerPagos(

        organizacionId

      )

      .subscribe({



        next: (

          respuesta

        ) => {



          this.pagosOrganizacion =

            respuesta.items

            ??

            [];





          this.cargandoPagos =

            false;



        },



        error: (

          error

        ) => {



          console.error(

            'Error cargando pagos:',

            error

          );





          this.pagosOrganizacion =

            [];





          this.cargandoPagos =

            false;



        }



      });



  }





  // =====================================================

  // REGISTRAR PAGO MANUAL

  // =====================================================



  async registrarPagoManual():

    Promise<void> {



    if (

      !this.organizacionGestion

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

        'El importe debe ser mayor a cero o quedar vacío para usar el precio habitual de la suscripción.'

      );



      return;

    }





    const textoImporte =

      importe === null

        ? (

            this.organizacionGestion

              .importeTotal !== null

            &&

            this.organizacionGestion

              .importeTotal !== undefined

              ? this.formatearDinero(

                  this.organizacionGestion

                    .importeTotal

                )

              : 'el importe actual de la suscripción'

          )

        : this.formatearDinero(

            importe

          );





    const confirmado =

      await this.dialogoService

        .confirmar({

          titulo:

            'Confirmar pago',



          mensaje:

            `Vas a registrar un pago de ${textoImporte} para ${this.organizacionGestion.nombre}. Método: ${this.pagoForm.metodoPago}.`,



          textoConfirmar:

            'Registrar pago',



          textoCancelar:

            'Volver'

        });





    if (

      !confirmado

    ) {

      return;

    }





    const request:

      RegistrarPagoManualRequest = {



        importe:

          importe,



        metodoPago:

          this.pagoForm

            .metodoPago,



        referencia:

          this.normalizarTexto(

            this.pagoForm

              .referencia

          ),



        observaciones:

          this.normalizarTexto(

            this.pagoForm

              .observaciones

          )



      };





    const organizacionId =

      this.organizacionGestion.id;





    this.guardandoPago =

      true;





    this.superAdminService

      .registrarPagoManual(

        organizacionId,

        request

      )

      .subscribe({



        next: (

          respuesta

        ) => {



          this.guardandoPago =

            false;





          this.pagoForm =

            this.crearPagoForm();





          this.alertaService.success(

            'Pago registrado',

            respuesta.message

            ||

            'La suscripción quedó actualizada correctamente.'

          );





          this.cargarPagos(

            organizacionId

          );





          this.cargarDashboard();



        },



        error: (

          error

        ) => {



          console.error(

            'Error registrando pago manual:',

            error

          );





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





  // =====================================================

  // ACTUALIZAR PRECIO HABITUAL

  // =====================================================



  async actualizarPrecioSuscripcion():

    Promise<void> {



    if (

      !this.organizacionGestion

      ||

      this.guardandoPrecio

    ) {

      return;

    }





    const importeTotal =

      this.normalizarImporte(

        this.precioForm

          .importeTotal

      );





    const precioPorProfesional =

      this.normalizarImporte(

        this.precioForm

          .precioPorProfesional

      );





    if (

      importeTotal === null

      ||

      importeTotal <= 0

    ) {



      this.alertaService.warning(

        'Precio inválido',

        'Ingresá un importe habitual mayor a cero.'

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

            `El próximo importe habitual de ${this.organizacionGestion.nombre} será ${this.formatearDinero(importeTotal)}. Esto no modifica pagos anteriores.`,



          textoConfirmar:

            'Guardar precio',



          textoCancelar:

            'Volver'

        });





    if (

      !confirmado

    ) {

      return;

    }





    const request:

      ActualizarPrecioSuscripcionRequest = {



        importeTotal,



        precioPorProfesional



      };





    const organizacionId =

      this.organizacionGestion.id;





    this.guardandoPrecio =

      true;





    this.superAdminService

      .actualizarPrecioSuscripcion(

        organizacionId,

        request

      )

      .subscribe({



        next: (

          respuesta

        ) => {



          this.guardandoPrecio =

            false;





          this.alertaService.success(

            'Precio actualizado',

            respuesta.message

            ||

            'El precio habitual quedó actualizado.'

          );





          this.cargarDashboard();



        },



        error: (

          error

        ) => {



          console.error(

            'Error actualizando precio:',

            error

          );





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





    // =====================================================

  // CREAR PLAN PERSONALIZADO

  // =====================================================

  get organizacionSolicitudSeleccionada():
    SuperAdminOrganizacion | null {

    if (!this.solicitudPlanSeleccionada) {
      return null;
    }

    return this.organizaciones
      .find(
        x =>
          x.id ===
          this.solicitudPlanSeleccionada
            ?.organizacion.id
      )
      ?? null;

  }


abrirCrearPlanPersonalizado(
  solicitud:
    SolicitudPlanPersonalizado
): void {

  const planBase =
    this.planBasePersonalizado;


  if (!planBase) {

    this.alertaService.warning(
      'Plan base no disponible',
      'No se encontró un plan activo para crear la suscripción personalizada.'
    );

    return;
  }


  const cantidad =
    Math.max(
      solicitud.cantidadProfesionales
      ?? 16,
      16
    );


  const precioActual =
    planBase.precio;


  this.solicitudPlanSeleccionada =
    solicitud;


  this.planPersonalizadoForm = {

    cantidadProfesionales:
      cantidad,
 cantidadSecretarias:
    planBase.maxSecretarias,
    modalidad:
      'Mensual',

    precioPorProfesional:
      precioActual > 0
        ? precioActual
        : null,

    importeTotal:
      precioActual > 0
        ? precioActual * cantidad
        : null

  };


  this.suscripcionPersonalizadaCreadaId =
    null;


  this.checkoutPersonalizadoUrl =
    null;

}

  cerrarCrearPlanPersonalizado(): void {

    if (
      this.creandoPlanPersonalizado
      ||
      this.generandoCheckoutPersonalizado
    ) {
      return;
    }


    const recargar =
      this.suscripcionPersonalizadaCreadaId !==
      null;


    this.solicitudPlanSeleccionada =
      null;


    this.suscripcionPersonalizadaCreadaId =
      null;


    this.checkoutPersonalizadoUrl =
      null;


    if (recargar) {
      this.cargarDashboard();
    }

  }


  recalcularTotalPlanPersonalizado(): void {

    const cantidad =
      Number(
        this.planPersonalizadoForm
          .cantidadProfesionales
      );


    const precio =
      this.normalizarImporte(
        this.planPersonalizadoForm
          .precioPorProfesional
      );


    if (
      !Number.isFinite(cantidad)
      ||
      cantidad <= 0
      ||
      precio === null
      ||
      precio <= 0
    ) {

      this.planPersonalizadoForm
        .importeTotal =
          null;

      return;
    }


    this.planPersonalizadoForm
      .importeTotal =
        Math.round(
          cantidad *
          precio
        );

  }


async crearPlanPersonalizado():
  Promise<void> {

  const solicitud =
    this.solicitudPlanSeleccionada;


  const planBase =
    this.planBasePersonalizado;


  if (
    !solicitud
    ||
    !planBase
    ||
    this.creandoPlanPersonalizado
  ) {
    return;
  }


  const cantidad =
    Number(
      this.planPersonalizadoForm
        .cantidadProfesionales
    );

const cantidadSecretarias =
  Number(
    this.planPersonalizadoForm
      .cantidadSecretarias
  );
  const precioPorProfesional =
    this.normalizarImporte(
      this.planPersonalizadoForm
        .precioPorProfesional
    );


  const importeTotal =
    this.normalizarImporte(
      this.planPersonalizadoForm
        .importeTotal
    );


  if (
    !Number.isInteger(cantidad)
    ||
    cantidad < 16
  ) {

    this.alertaService.warning(
      'Cantidad inválida',
      'Un plan personalizado debe tener al menos 16 profesionales.'
    );

    return;
  }

if (
  !Number.isInteger(cantidadSecretarias)
  ||
  cantidadSecretarias < 0
) {

  this.alertaService.warning(
    'Cantidad inválida',
    'La cantidad de secretarias no puede ser negativa.'
  );

  return;
}
  if (
    precioPorProfesional === null
    ||
    precioPorProfesional <= 0
  ) {

    this.alertaService.warning(
      'Precio inválido',
      'Ingresá un precio por profesional mayor a cero.'
    );

    return;
  }


  if (
    importeTotal === null
    ||
    importeTotal <= 0
  ) {

    this.alertaService.warning(
      'Importe inválido',
      'Ingresá el importe total acordado para la suscripción.'
    );

    return;
  }


  const confirmado =
    await this.dialogoService
      .confirmar({

        titulo:
          'Crear plan personalizado',

       mensaje:
  `Vas a crear una suscripción ${this.planPersonalizadoForm.modalidad.toLowerCase()} para ${solicitud.organizacion.nombre}, con ${cantidad} profesionales y ${cantidadSecretarias} secretarias por ${this.formatearDinero(importeTotal)}.`,

        textoConfirmar:
          'Crear plan',

        textoCancelar:
          'Volver'

      });


  if (!confirmado) {
    return;
  }


  const solicitudId =
    solicitud.id;

const request = {

  planId:
    planBase.id,

  cantidadProfesionales:
    cantidad,

  cantidadSecretarias:
    cantidadSecretarias,

  modalidad:
    this.planPersonalizadoForm
      .modalidad,

  precioPorProfesional,

  importeTotal

};

  this.creandoPlanPersonalizado =
    true;


  this.superAdminService
    .crearSuscripcionPersonalizada(
      solicitudId,
      request
    )
    .subscribe({

      next: (respuesta) => {

        this.creandoPlanPersonalizado =
          false;


        this.suscripcionPersonalizadaCreadaId =
          respuesta.suscripcionId;


        if (
          this.solicitudPlanSeleccionada
        ) {

          this.solicitudPlanSeleccionada
            .estado =
              'Aceptada';

        }


        this.alertaService.success(
          'Plan creado',
          respuesta.message
          || 'La suscripción personalizada quedó creada.'
        );

      },


      error: (error) => {

        console.error(
          'Error creando plan personalizado:',
          error
        );


        this.creandoPlanPersonalizado =
          false;


        this.alertaService.error(
          'No se pudo crear el plan',
          this.obtenerMensajeError(
            error,
            'Revisá los datos e intentá nuevamente.'
          )
        );

      }

    });

}


generarCheckoutPlanPersonalizado(): void {

  if (
    !this.suscripcionPersonalizadaCreadaId
    ||
    this.generandoCheckoutPersonalizado
  ) {
    return;
  }

  this.generandoCheckoutPersonalizado = true;

  this.superAdminService
    .generarCheckoutPersonalizado(
      this.suscripcionPersonalizadaCreadaId
    )
    .subscribe({

      next: (respuesta) => {

        this.generandoCheckoutPersonalizado = false;

        if (respuesta.requierePagoManual) {

          this.checkoutPersonalizadoUrl = null;

          this.alertaService.info(
            'Pago manual requerido',
            respuesta.message
            || 'El importe supera el límite de Mercado Pago. Registrá el pago manualmente.'
          );

          return;
        }

        this.checkoutPersonalizadoUrl =
          respuesta.initPoint
          || null;

        if (!this.checkoutPersonalizadoUrl) {

          this.alertaService.warning(
            'Checkout no disponible',
            'La suscripción se creó, pero Mercado Pago no devolvió un enlace de pago.'
          );

          return;
        }

        this.alertaService.success(
          'Link generado',
          respuesta.message
          || 'El link de pago quedó listo.'
        );

      },

      error: (error) => {

        console.error(
          'Error generando checkout personalizado:',
          error
        );

        this.generandoCheckoutPersonalizado = false;

        this.alertaService.error(
          'No se pudo generar el checkout',
          this.obtenerMensajeError(
            error,
            'Intentá nuevamente.'
          )
        );

      }

    });

}

  async copiarCheckoutPersonalizado():
    Promise<void> {

    if (!this.checkoutPersonalizadoUrl) {
      return;
    }


    try {

      await navigator.clipboard
        .writeText(
          this.checkoutPersonalizadoUrl
        );


      this.alertaService.success(
        'Link copiado',
        'El enlace de pago quedó copiado al portapapeles.'
      );

    }
    catch {

      this.alertaService.warning(
        'No se pudo copiar',
        'Copiá el enlace manualmente desde el campo.'
      );

    }

  }


  abrirCheckoutPersonalizado(): void {

    if (!this.checkoutPersonalizadoUrl) {
      return;
    }


    window.open(
      this.checkoutPersonalizadoUrl,
      '_blank',
      'noopener,noreferrer'
    );

  }


  gestionarSolicitudAceptada(
    solicitud:
      SolicitudPlanPersonalizado
  ): void {

    this.router.navigate(
      [
        '/super-admin',
        'organizaciones',
        solicitud.organizacion.id
      ]
    );

  }



// =====================================================

  // FORMULARIO DE PAGO

  // =====================================================



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





  // =====================================================

  // FORMULARIO DE PRECIO

  // =====================================================



  private crearPrecioForm(

    organizacion?:

      SuperAdminOrganizacion | null

  ):

    PrecioSuscripcionForm {



    return {



      importeTotal:

        organizacion

          ?.importeTotal

        ??

        null,



      precioPorProfesional:

        organizacion

          ?.precioPorProfesional

        ??

        null



    };



  }





  // =====================================================

  // TEXTO DE VENCIMIENTO

  // =====================================================



  textoVencimiento(

    organizacion:

      SuperAdminOrganizacion

  ): string {



    const dias =

      organizacion

        .diasParaVencer;





    if (

      dias === null

      ||

      dias === undefined

    ) {

      return 'Sin vencimiento';

    }





    if (

      dias < 0

    ) {



      const vencidaHace =

        Math.abs(

          dias

        );





      return vencidaHace === 1

        ? 'Vencida hace 1 día'

        : `Vencida hace ${vencidaHace} días`;



    }





    if (

      dias === 0

    ) {

      return 'Vence hoy';

    }





    if (

      dias === 1

    ) {

      return 'Vence mañana';

    }





    return `Vence en ${dias} días`;



  }





  // =====================================================

  // CLASE DE VENCIMIENTO

  // =====================================================



  claseVencimiento(

    organizacion:

      SuperAdminOrganizacion

  ): string {



    const dias =

      organizacion

        .diasParaVencer;





    if (

      dias === null

      ||

      dias === undefined

    ) {

      return 'expiry-gray';

    }





    if (

      dias < 0

    ) {

      return 'expiry-red';

    }





    if (

      dias <= 5

    ) {

      return 'expiry-yellow';

    }





    return 'expiry-green';



  }





  // =====================================================

  // NORMALIZAR IMPORTE

  // =====================================================



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

      Number(

        valor

      );





    return Number.isFinite(

      numero

    )

      ? numero

      : null;



  }





  // =====================================================

  // NORMALIZAR TEXTO

  // =====================================================



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





    return texto

      ||

      null;



  }





  // =====================================================

  // MENSAJE DE ERROR

  // =====================================================



  private obtenerMensajeError(

    error:

      any,



    fallback:

      string

  ): string {



    return (

      error

        ?.error

        ?.message

      ||

      error

        ?.error

        ?.mensaje

      ||

      error

        ?.message

      ||

      fallback

    );



  }





  // =====================================================

  // FORMATEAR DINERO

  // =====================================================



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





  // =====================================================

  // FORMATEAR FECHA

  // =====================================================



  formatearFecha(

    fecha:

      string | null | undefined

  ): string {



    if (!fecha) {

      return '-';

    }





    const date =

      new Date(

        fecha

      );





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

      .format(

        date

      );



  }





  // =====================================================

  // CLASE ESTADO

  // =====================================================



  claseEstado(

    estado:

      string | null | undefined

  ): string {



    const valor =

      String(

        estado ?? ''

      )

        .toLowerCase();





    if (

      valor ===

      'activa'

      ||

      valor ===

      'aceptada'

    ) {



      return 'estado-verde';



    }





    if (

      valor ===

      'pendiente'

      ||

      valor ===

      'enprueba'

      ||

      valor ===

      'contactado'

      ||

      valor ===

      'propuestaenviada'

    ) {



      return 'estado-amarillo';



    }





    if (

      valor ===

      'cancelada'

      ||

      valor ===

      'rechazada'

      ||

      valor ===

      'vencida'

    ) {



      return 'estado-rojo';



    }





    return 'estado-gris';



  }





  // =====================================================

  // RECARGAR

  // =====================================================



  recargar(): void {



    this.cargarDashboard();



  }





  // =====================================================

  // LOGOUT

  // =====================================================



  cerrarSesion(): void {



    this.authService

      .logout();



    this.router

      .navigate(

        ['/login']

      );



  }



}
