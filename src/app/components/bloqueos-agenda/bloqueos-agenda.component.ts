import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {

  ProfesionalService,

  ProfesionalSucursal

} from '../../services/profesional.service';

import {

  ContextoService

} from '../../services/contexto.service';

import {
  AlertaService
} from '../../services/alerta.service';

import {
  DialogoService
} from '../../services/dialogo.service';

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
    private readonly bloqueosService:
      BloqueosAgendaService,

    private readonly profesionalService:
      ProfesionalService,

    private readonly contextoService:
      ContextoService,

    private readonly alertaService:
      AlertaService,

    private readonly dialogoService:
      DialogoService
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

        next: (organizaciones: any[]) => {

          const actual =
            organizaciones.find(
              (x: any) => x.esActual
            );

          if (
            !actual
            ||
            !actual.esProfesional
            ||
            !actual.profesionalOrganizacionId
          ) {

            this.cargando = false;

            this.alertaService.warning(
              'Perfil profesional no disponible',
              'No encontramos tu perfil profesional en la organización actual.'
            );

            return;
          }

          this.profesionalOrganizacionId =
            actual.profesionalOrganizacionId;

          this.cargarSucursales();
          this.cargarBloqueos();
        },

        error: (error: any) => {

          this.cargando = false;

          console.error(
            'Error obteniendo contexto profesional:',
            error
          );

          this.alertaService.error(
            'No pudimos cargar tu perfil profesional',
            error?.error?.message
            ??
            'Intentá nuevamente.'
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

        next: (
          sucursales: ProfesionalSucursal[]
        ) => {

          this.sucursales =
            sucursales.filter(
              (x: ProfesionalSucursal) =>
                x.activo
            );
        },

        error: (error: any) => {

          console.error(
            'Error cargando sucursales del profesional:',
            error
          );

          this.sucursales = [];

          this.alertaService.error(
            'No pudimos cargar tus sucursales',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
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

        next: (
          bloqueos: BloqueoAgenda[]
        ) => {

          this.bloqueos =
            bloqueos;

          this.cargando = false;
        },

        error: (error: any) => {

          this.cargando = false;

          console.error(
            'Error cargando bloqueos:',
            error
          );

          this.alertaService.error(
            'No pudimos cargar los bloqueos',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
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

    if (
      !this.nuevoBloqueo.fechaDesde
      ||
      !this.nuevoBloqueo.fechaHasta
    ) {

      this.alertaService.warning(
        'Faltan las fechas',
        'Indicá desde qué fecha y hasta qué fecha querés bloquear la agenda.'
      );

      return;
    }

    if (
      this.nuevoBloqueo.fechaHasta
      <
      this.nuevoBloqueo.fechaDesde
    ) {

      this.alertaService.warning(
        'Rango de fechas inválido',
        'La fecha hasta no puede ser anterior a la fecha desde.'
      );

      return;
    }

    if (!this.nuevoBloqueo.todoElDia) {

      if (
        !this.nuevoBloqueo.horaDesde
        ||
        !this.nuevoBloqueo.horaHasta
      ) {

        this.alertaService.warning(
          'Falta el horario',
          'Indicá desde qué hora y hasta qué hora querés bloquear.'
        );

        return;
      }

      if (
        this.nuevoBloqueo.horaHasta
        <=
        this.nuevoBloqueo.horaDesde
      ) {

        this.alertaService.warning(
          'Horario inválido',
          'La hora hasta debe ser posterior a la hora desde.'
        );

        return;
      }
    }

    const payload:
      CrearBloqueoAgendaPayload = {

        sucursalId:
          this.nuevoBloqueo.sucursalId
          ||
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

    this.guardando = true;

    this.bloqueosService
      .crear(payload)
      .subscribe({

        next: (
          bloqueo: BloqueoAgenda
        ) => {

          this.guardando = false;

          this.bloqueos =
            [
              ...this.bloqueos,
              bloqueo
            ].sort(
              (
                a: BloqueoAgenda,
                b: BloqueoAgenda
              ) =>
                a.fechaDesde.localeCompare(
                  b.fechaDesde
                )
            );

          this.mostrarFormulario = false;
          this.resetearFormulario();

          this.alertaService.success(
            'Agenda bloqueada'
          );
        },

        error: (error: any) => {

          this.guardando = false;

          console.error(
            'Error creando bloqueo:',
            error
          );

          this.alertaService.error(
            'No pudimos crear el bloqueo',
            error?.error?.message
            ??
            'Revisá la información e intentá nuevamente.'
          );
        }

      });
  }

  // =====================================================

  // ELIMINAR

  // =====================================================

  async eliminarBloqueo(
    bloqueo: BloqueoAgenda
  ): Promise<void> {

    const confirmado =
      await this.dialogoService.confirmar({
        titulo:
          '¿Eliminar este bloqueo?',
        mensaje:
          'La disponibilidad de esas fechas volverá a calcularse automáticamente.',
        textoConfirmar:
          'Eliminar bloqueo',
        textoCancelar:
          'Cancelar',
        variante:
          'danger'
      });

    if (!confirmado) {
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
              (x: BloqueoAgenda) =>
                x.id !== bloqueo.id
            );

          this.alertaService.success(
            'Bloqueo eliminado'
          );
        },

        error: (error: any) => {

          console.error(
            'Error eliminando bloqueo:',
            error
          );

          this.alertaService.error(
            'No pudimos eliminar el bloqueo',
            error?.error?.message
            ??
            'Intentá nuevamente.'
          );
        }

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
