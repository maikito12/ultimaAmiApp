import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


import {
  ProfesionalService,
  ProfesionalSucursal
} from '../../services/profesional.service';

import {
  ContextoService
} from '../../services/contexto.service';
import { BloqueoAgenda, BloqueosAgendaService, CrearBloqueoAgendaPayload } from '../../services/bloqueos-agenda.service';


@Component({
  selector: 'app-bloqueos-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './bloqueos-agenda.component.html',
  styleUrl: './bloqueos-agenda.component.css'
})
export class BloqueosAgendaComponent implements OnInit {

  // =====================================================
  // ESTADOS
  // =====================================================

  cargando = true;
  guardando = false;

  mostrarFormulario = false;

  profesionalOrganizacionId: string | null = null;

  bloqueos: BloqueoAgenda[] = [];

  sucursales: ProfesionalSucursal[] = [];


  // =====================================================
  // FORMULARIO
  // =====================================================

  nuevoBloqueo = {
    sucursalId: '',
    fechaDesde: '',
    fechaHasta: '',
    todoElDia: true,
    horaDesde: '',
    horaHasta: '',
    motivo: ''
  };


  // =====================================================
  // FECHA MÍNIMA
  // =====================================================

  get fechaMinima(): string {

    const hoy =
      new Date();

    const anio =
      hoy.getFullYear();

    const mes =
      String(
        hoy.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        hoy.getDate()
      ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }


  constructor(
    private bloqueosService: BloqueosAgendaService,
    private profesionalService: ProfesionalService,
    private contextoService: ContextoService
  ) {}


  ngOnInit(): void {

    this.cargarContextoProfesional();

  }


  // =====================================================
  // CONTEXTO PROFESIONAL
  // =====================================================

  private cargarContextoProfesional(): void {

    this.cargando = true;

    this.contextoService
      .obtenerOrganizaciones()
      .subscribe({

        next: (organizaciones) => {

          const actual =
            organizaciones.find(
              x => x.esActual
            );


          if (
            !actual ||
            !actual.esProfesional ||
            !actual.profesionalOrganizacionId
          ) {

            this.cargando = false;

            Swal.fire({
              icon: 'warning',
              title: 'Perfil profesional no disponible',
              text:
                'No encontramos tu perfil profesional en la organización actual.',
              confirmButtonColor: '#17483d'
            });

            return;
          }


          this.profesionalOrganizacionId =
            actual.profesionalOrganizacionId;


          this.cargarSucursales();

          this.cargarBloqueos();

        },


        error: (error) => {

          this.cargando = false;

          console.error(
            'Error obteniendo contexto profesional:',
            error
          );

        }

      });

  }


  // =====================================================
  // SUCURSALES DEL PROFESIONAL
  // =====================================================

  private cargarSucursales(): void {

    if (!this.profesionalOrganizacionId) {
      return;
    }


    this.profesionalService
      .obtenerProfesionalSucursales(
        this.profesionalOrganizacionId
      )
      .subscribe({

        next: (sucursales) => {

          this.sucursales =
            sucursales.filter(
              x => x.activo
            );

        },


        error: (error) => {

          console.error(
            'Error cargando sucursales del profesional:',
            error
          );

          this.sucursales = [];

        }

      });

  }


  // =====================================================
  // CARGAR BLOQUEOS
  // =====================================================

  cargarBloqueos(): void {

    this.cargando = true;

    this.bloqueosService
      .obtenerMisBloqueos()
      .subscribe({

        next: (bloqueos) => {

          this.bloqueos =
            bloqueos;

          this.cargando =
            false;

        },


        error: (error) => {

          this.cargando =
            false;

          console.error(
            'Error cargando bloqueos:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'No pudimos cargar los bloqueos',
            text:
              error?.error?.message ||
              'Intentá nuevamente.',
            confirmButtonColor: '#17483d'
          });

        }

      });

  }


  // =====================================================
  // ABRIR / CERRAR
  // =====================================================

  abrirNuevoBloqueo(): void {

    this.resetearFormulario();

    this.mostrarFormulario =
      true;

  }


  cancelarNuevoBloqueo(): void {

    if (this.guardando) {
      return;
    }

    this.mostrarFormulario =
      false;

    this.resetearFormulario();

  }


  // =====================================================
  // CAMBIO TODO EL DÍA
  // =====================================================

  cambiarTodoElDia(): void {

    if (this.nuevoBloqueo.todoElDia) {

      this.nuevoBloqueo.horaDesde =
        '';

      this.nuevoBloqueo.horaHasta =
        '';

    }

  }


  // =====================================================
  // CREAR BLOQUEO
  // =====================================================

  guardarBloqueo(): void {

    if (this.guardando) {
      return;
    }


    // ==========================================
    // FECHAS
    // ==========================================

    if (
      !this.nuevoBloqueo.fechaDesde ||
      !this.nuevoBloqueo.fechaHasta
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Faltan las fechas',
        text:
          'Indicá desde qué fecha y hasta qué fecha querés bloquear la agenda.',
        confirmButtonColor: '#17483d'
      });

      return;
    }


    if (
      this.nuevoBloqueo.fechaHasta <
      this.nuevoBloqueo.fechaDesde
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Rango de fechas inválido',
        text:
          'La fecha hasta no puede ser anterior a la fecha desde.',
        confirmButtonColor: '#17483d'
      });

      return;
    }


    // ==========================================
    // HORARIOS
    // ==========================================

    if (!this.nuevoBloqueo.todoElDia) {

      if (
        !this.nuevoBloqueo.horaDesde ||
        !this.nuevoBloqueo.horaHasta
      ) {

        Swal.fire({
          icon: 'warning',
          title: 'Falta el horario',
          text:
            'Indicá desde qué hora y hasta qué hora querés bloquear.',
          confirmButtonColor: '#17483d'
        });

        return;
      }


      if (
        this.nuevoBloqueo.horaHasta <=
        this.nuevoBloqueo.horaDesde
      ) {

        Swal.fire({
          icon: 'warning',
          title: 'Horario inválido',
          text:
            'La hora hasta debe ser posterior a la hora desde.',
          confirmButtonColor: '#17483d'
        });

        return;
      }

    }


    // ==========================================
    // PAYLOAD
    // ==========================================

    const payload:
      CrearBloqueoAgendaPayload = {

        sucursalId:
          this.nuevoBloqueo.sucursalId ||
          null,

        fechaDesde:
          this.nuevoBloqueo.fechaDesde,

        fechaHasta:
          this.nuevoBloqueo.fechaHasta,

        todoElDia:
          this.nuevoBloqueo.todoElDia,

       horaDesde:
  this.nuevoBloqueo.todoElDia
    ? null
    : `${this.nuevoBloqueo.horaDesde}:00`,

horaHasta:
  this.nuevoBloqueo.todoElDia
    ? null
    : `${this.nuevoBloqueo.horaHasta}:00`,
        motivo:
          this.nuevoBloqueo.motivo.trim()
            ? this.nuevoBloqueo.motivo.trim()
            : null

      };


    this.guardando =
      true;


    this.bloqueosService
      .crear(payload)
      .subscribe({

        next: (bloqueo) => {

          this.guardando =
            false;

          this.bloqueos =
            [
              ...this.bloqueos,
              bloqueo
            ].sort(
              (
                a,
                b
              ) =>
                a.fechaDesde.localeCompare(
                  b.fechaDesde
                )
            );


          this.mostrarFormulario =
            false;

          this.resetearFormulario();


          Swal.fire({
            icon: 'success',
            title: 'Agenda bloqueada',
            text:
              'El bloqueo se guardó correctamente.',
            timer: 1500,
            showConfirmButton: false
          });

        },


        error: (error) => {

          this.guardando =
            false;

          console.error(
            'Error creando bloqueo:',
            error
          );


          Swal.fire({
            icon: 'error',
            title: 'No pudimos crear el bloqueo',
            text:
              error?.error?.message ||
              'Revisá la información e intentá nuevamente.',
            confirmButtonColor: '#17483d'
          });

        }

      });

  }


  // =====================================================
  // ELIMINAR
  // =====================================================

  eliminarBloqueo(
    bloqueo: BloqueoAgenda
  ): void {

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar este bloqueo?',
      text:
        'La disponibilidad de esas fechas volverá a calcularse automáticamente.',
      showCancelButton: true,
      confirmButtonText: 'Eliminar bloqueo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b45353',
      cancelButtonColor: '#71817c'
    })
    .then(resultado => {

      if (!resultado.isConfirmed) {
        return;
      }


      this.bloqueosService
        .eliminar(
          bloqueo.id
        )
        .subscribe({

          next: () => {

            this.bloqueos =
              this.bloqueos.filter(
                x =>
                  x.id !==
                  bloqueo.id
              );


            Swal.fire({
              icon: 'success',
              title: 'Bloqueo eliminado',
              timer: 1200,
              showConfirmButton: false
            });

          },


          error: (error) => {

            console.error(
              'Error eliminando bloqueo:',
              error
            );


            Swal.fire({
              icon: 'error',
              title: 'No pudimos eliminar el bloqueo',
              text:
                error?.error?.message ||
                'Intentá nuevamente.',
              confirmButtonColor: '#17483d'
            });

          }

        });

    });

  }


  // =====================================================
  // HELPERS
  // =====================================================

  textoFecha(
    fecha: string
  ): string {

    if (!fecha) {
      return '';
    }


    const valor =
      new Date(
        `${fecha}T00:00:00`
      );


    return valor.toLocaleDateString(
      'es-AR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  textoRangoFechas(
    bloqueo: BloqueoAgenda
  ): string {

    if (
      bloqueo.fechaDesde ===
      bloqueo.fechaHasta
    ) {

      return this.textoFecha(
        bloqueo.fechaDesde
      );

    }


    return (
      `${this.textoFecha(bloqueo.fechaDesde)} — ` +
      `${this.textoFecha(bloqueo.fechaHasta)}`
    );

  }


  textoHorario(
    bloqueo: BloqueoAgenda
  ): string {

    if (bloqueo.todoElDia) {
      return 'Todo el día';
    }


    const desde =
      bloqueo.horaDesde
        ?.substring(0, 5) ||
      '';

    const hasta =
      bloqueo.horaHasta
        ?.substring(0, 5) ||
      '';


    return `${desde} — ${hasta}`;

  }


  textoSucursal(
    bloqueo: BloqueoAgenda
  ): string {

    return (
      bloqueo.sucursal ||
      'Todas las sucursales'
    );

  }


  private resetearFormulario(): void {

    this.nuevoBloqueo = {
      sucursalId: '',
      fechaDesde: '',
      fechaHasta: '',
      todoElDia: true,
      horaDesde: '',
      horaHasta: '',
      motivo: ''
    };

  }

}
