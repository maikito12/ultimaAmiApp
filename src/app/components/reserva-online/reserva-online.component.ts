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

import Swal from 'sweetalert2';


import {
  ConfiguracionReservas,
  ConfiguracionReservasService
} from '../../services/configuracion-reservas.service';


import {
  ConfiguracionOrganizacionService
} from '../../services/configuracion-organizacion.service';


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
      ConfiguracionOrganizacionService

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

            this.urlReservaPublica =
              organizacion.slug

                ? `https://amiapp.com/reservar/${organizacion.slug}`

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

        Swal.fire({

          icon:
            'success',

          title:
            'Enlace copiado',

          text:
            'El enlace de reservas se copió al portapapeles.',

          timer:
            1600,

          showConfirmButton:
            false

        });

      })
      .catch(
        error => {

          console.error(
            'Error copiando enlace:',
            error
          );


          Swal.fire({

            icon:
              'error',

            title:
              'No se pudo copiar',

            text:
              'No pudimos copiar el enlace.'

          });

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


            Swal.fire({

              icon:
                'error',

              title:
                'No se pudo cargar',

              text:
                'No pudimos obtener la configuración de reserva online.'

            });

          }

      });

  }


  // ==========================================
  // GUARDAR CONFIGURACIÓN
  // ==========================================

  guardar():
    void {

    if (
      this.guardando
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


            Swal.fire({

              icon:
                'success',

              title:
                'Configuración guardada',

              text:
                'Los cambios se guardaron correctamente.',

              timer:
                1800,

              showConfirmButton:
                false

            });

          },


        error:
          error => {

            console.error(
              'Error guardando configuración:',
              error
            );


            this.guardando =
              false;


            Swal.fire({

              icon:
                'error',

              title:
                'No se pudo guardar',

              text:
                error?.error?.message
                ??
                'Ocurrió un error al guardar la configuración.'

            });

          }

      });

  }

}