import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ConfiguracionReservas,
  ConfiguracionReservasService
} from '../../services/configuracion-reservas.service';

import {
  ConfiguracionOrganizacionService
} from '../../services/configuracion-organizacion.service';

import {
  AlertaService
} from '../../services/alerta.service';


@Component({
  selector:
    'app-reserva-online',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './reserva-online.component.html',

  styleUrls: [
    './reserva-online.component.css'
  ]
})
export class ReservaOnlineComponent
  implements OnInit {


  // ==========================================
  // ESTADOS
  // ==========================================

  cargando =
    true;

  guardando =
    false;

  cargandoEnlace =
    true;

  hayCambiosSinGuardar =
    false;


  // ==========================================
  // ENLACE PÚBLICO
  // ==========================================

  urlReservaPublica:
    string = '';


  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  configuracion:
    ConfiguracionReservas = {

      permitirReservaOnline:
        true,

      maxTurnosActivos:
        2,

      diasMaximosAnticipacion:
        90,

      horasMinimasCancelacion:
        24,

      permitirMultiplesTurnosMismoDia:
        false,

      permitirElegirProfesional:
        true,

      permitirElegirSucursal:
        true,

      requiereConfirmacion:
        true,


      // ======================================
      // CAMPOS
      // ======================================

      solicitarDni:
        true,

      solicitarEmail:
        true,

      solicitarTelefono:
        true,

      solicitarFechaNacimiento:
        false,

      solicitarObraSocial:
        true,

      solicitarMotivoConsulta:
        true,

      solicitarObservaciones:
        false,


      // ======================================
      // TEXTOS
      // ======================================

      tituloReserva:
        'Reservá tu turno',

      descripcionReserva:
        'Seleccioná el profesional, la fecha y el horario que prefieras.',


      // ======================================
      // REGLAS
      // ======================================

      tiempoGraciaMinutos:
        10,

      permitirSobreturnos:
        false

    };


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(

    private configuracionService:
      ConfiguracionReservasService,

    private organizacionService:
      ConfiguracionOrganizacionService,

    private alertaService:
      AlertaService

  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.cargarConfiguracion();

    this.cargarEnlaceReserva();

  }


  // ==========================================
  // CARGAR ENLACE PÚBLICO
  // ==========================================

  cargarEnlaceReserva():
    void {

    this.cargandoEnlace =
      true;


    this.organizacionService
      .obtenerOrganizacionActual()
      .subscribe({

        next:
          organizacion => {

           const origen =
  window.location.origin;

this.urlReservaPublica =
  organizacion.slug
    ? `${origen}/reservar/${organizacion.slug}`
    : '';

            this.cargandoEnlace =
              false;

          },


        error:
          error => {

            console.error(
              'Error cargando enlace de reserva:',
              error
            );


            this.urlReservaPublica =
              '';


            this.cargandoEnlace =
              false;

          }

      });

  }


  // ==========================================
  // COPIAR ENLACE
  // ==========================================

  copiarLink():
    void {

    if (
      !this.urlReservaPublica
    ) {

      return;

    }


    navigator.clipboard
      .writeText(
        this.urlReservaPublica
      )
      .then(() => {

        this.alertaService.success(
          'Enlace copiado',
          'El enlace de reservas se copió al portapapeles.',
          1600
        );

      })
      .catch(
        error => {

          console.error(
            'Error copiando enlace:',
            error
          );


          this.alertaService.error(
            'No se pudo copiar',
            'No pudimos copiar el enlace.'
          );

        }
      );

  }


  // ==========================================
  // ABRIR PÁGINA PÚBLICA
  // ==========================================

  abrirReservaPublica():
    void {

    if (
      !this.urlReservaPublica
    ) {

      return;

    }


    window.open(
      this.urlReservaPublica,
      '_blank',
      'noopener,noreferrer'
    );

  }


  // ==========================================
  // CARGAR CONFIGURACIÓN
  // ==========================================

  cargarConfiguracion():
    void {

    this.cargando =
      true;


    this.configuracionService
      .obtener()
      .subscribe({

        next:
          respuesta => {

            this.configuracion =
              respuesta;


            this.hayCambiosSinGuardar =
              false;


            this.cargando =
              false;

          },


        error:
          error => {

            console.error(
              'Error cargando configuración:',
              error
            );


            this.cargando =
              false;


            this.alertaService.error(
              'No se pudo cargar',
              'No pudimos obtener la configuración de reserva online.'
            );

          }

      });

  }


  // ==========================================
  // CAMBIOS SIN GUARDAR
  // ==========================================

  marcarCambios():
    void {

    if (
      this.cargando
      ||
      this.guardando
    ) {

      return;

    }


    this.hayCambiosSinGuardar =
      true;

  }


  // ==========================================
  // GUARDAR CONFIGURACIÓN
  // ==========================================

  guardar():
    void {

    if (
      this.guardando
      ||
      !this.hayCambiosSinGuardar
    ) {

      return;

    }


    this.guardando =
      true;


    this.configuracionService
      .guardar(
        this.configuracion
      )
      .subscribe({

        next:
          () => {

            this.guardando =
              false;


            this.hayCambiosSinGuardar =
              false;


            this.alertaService.success(
              'Configuración guardada',
              'Los cambios se guardaron correctamente.',
              1800
            );

          },


        error:
          error => {

            console.error(
              'Error guardando configuración:',
              error
            );


            this.guardando =
              false;


            this.alertaService.error(
              'No se pudo guardar',
              error?.error?.message
              ??
              'Ocurrió un error al guardar la configuración.'
            );

          }

      });

  }

}
