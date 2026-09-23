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
import { Paciente, PacientesService } from '../../services/pacientesd.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-pacientes-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './clientes-tabla.component.html',
  styleUrls: ['./clientes-tabla.component.css']
})
export class PacientesListaComponent
  implements OnInit {

  // ==========================================
  // LISTADO
  // ==========================================

  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];

  cargando = false;

  filtroTexto = '';

  // ==========================================
  // MODAL DETALLE
  // ==========================================

  mostrarDetalle = false;

  pacienteSeleccionado:
    Paciente | null = null;

  // ==========================================
  // FORMULARIO
  // ==========================================

  mostrarFormulario = false;

  editando = false;

  guardando = false;

  formulario: any =
    this.crearFormularioVacio();

constructor(
  private pacientesService: PacientesService,
  private router: Router
) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  // ==========================================
  // CARGAR
  // ==========================================

  cargarPacientes(): void {

    this.cargando = true;

    this.pacientesService
      .obtenerPacientes(
        1,
        100
      )
      .subscribe({

        next: (response: any) => {

          /*
           * Nuestro backend devuelve
           * PagedResult.
           *
           * Normalizamos por si la propiedad
           * del helper es Items/items.
           */

          const items =
            response?.items ??
            response?.Items ??
            [];

          this.pacientes =
            Array.isArray(items)
              ? items
              : [];

          this.aplicarFiltros();

          this.cargando = false;
        },

        error: (error: any) => {

          console.error(
            'Error obteniendo pacientes:',
            error
          );

          this.pacientes = [];
          this.pacientesFiltrados = [];

          this.cargando = false;

          Swal.fire({
            icon: 'error',
            title:
              'No se pudieron cargar los pacientes',
            text:
              this.obtenerMensajeError(
                error
              )
          });
        }
      });
  }

  // ==========================================
  // FILTROS
  // ==========================================

  aplicarFiltros(): void {

    const busqueda =
      this.filtroTexto
        .trim()
        .toLowerCase();

    this.pacientesFiltrados =
      this.pacientes.filter(
        (paciente: Paciente) => {

          if (!busqueda) {
            return true;
          }

          const nombreCompleto =
            `${paciente.nombre} ${paciente.apellido}`
              .toLowerCase();

          const dni =
            paciente.dni
              ?.toLowerCase() ??
            '';

          const email =
            paciente.email
              ?.toLowerCase() ??
            '';

          const telefono =
            paciente.telefono
              ?.toLowerCase() ??
            '';

          return (
            nombreCompleto.includes(
              busqueda
            ) ||
            dni.includes(
              busqueda
            ) ||
            email.includes(
              busqueda
            ) ||
            telefono.includes(
              busqueda
            )
          );
        }
      );
  }

  limpiarFiltros(): void {

    this.filtroTexto = '';

    this.aplicarFiltros();
  }

  // ==========================================
  // DETALLE
  // ==========================================

abrirFicha(
  paciente: Paciente
): void {

  this.router.navigate([
    '/dashboard/clientes',
    paciente.id
  ]);
}

  cerrarFicha(): void {

    this.mostrarDetalle = false;

    this.pacienteSeleccionado =
      null;
  }

  // ==========================================
  // NUEVO
  // ==========================================

  crearNuevo(): void {

    this.editando = false;

    this.formulario =
      this.crearFormularioVacio();

    this.mostrarFormulario = true;
  }

  // ==========================================
  // EDITAR
  // ==========================================

  editarPaciente(
    paciente: Paciente
  ): void {

    this.editando = true;

    this.formulario = {
      id:
        paciente.id,

      nombre:
        paciente.nombre ?? '',

      apellido:
        paciente.apellido ?? '',

      dni:
        paciente.dni ?? '',

      email:
        paciente.email ?? '',

      telefono:
        paciente.telefono ?? '',

      fecha_nacimiento:
        paciente.fecha_nacimiento ?? '',

      direccion:
        paciente.direccion ?? '',

      sexo:
        paciente.sexo ?? '',

      obra_social_id:
        paciente.obra_social_id ?? null,

      obra_social:
        paciente.obra_social ?? null,

      numero_afiliado:
        paciente.numero_afiliado ?? '',

      activo:
        paciente.activo
    };

    this.mostrarDetalle = false;

    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {

    this.mostrarFormulario = false;

    this.guardando = false;

    this.formulario =
      this.crearFormularioVacio();
  }

  // ==========================================
  // GUARDAR
  // ==========================================

  guardarPaciente(): void {

    if (
      !this.formulario.nombre
        ?.trim()
    ) {

      this.mostrarValidacion(
        'Ingresá el nombre.'
      );

      return;
    }

    if (
      !this.formulario.apellido
        ?.trim()
    ) {

      this.mostrarValidacion(
        'Ingresá el apellido.'
      );

      return;
    }

    if (
      !this.formulario.dni
        ?.trim()
    ) {

      this.mostrarValidacion(
        'Ingresá el DNI.'
      );

      return;
    }

    this.guardando = true;

    const payload: any = {

      nombre:
        this.formulario.nombre.trim(),

      apellido:
        this.formulario.apellido.trim(),

      dni:
        this.formulario.dni.trim(),

      email:
        this.normalizarOpcional(
          this.formulario.email
        ),

      telefono:
        this.normalizarOpcional(
          this.formulario.telefono
        ),

      fecha_nacimiento:
        this.formulario
          .fecha_nacimiento ||
        null,

      direccion:
        this.normalizarOpcional(
          this.formulario.direccion
        ),

      sexo:
        this.normalizarOpcional(
          this.formulario.sexo
        ),

      obra_social_id:
        this.formulario
          .obra_social_id ||
        null,

      numero_afiliado:
        this.normalizarOpcional(
          this.formulario
            .numero_afiliado
        ),

      datos_extra: null
    };

    // ========================================
    // EDITAR
    // ========================================

    if (
      this.editando &&
      this.formulario.id
    ) {

      const updatePayload = {
        ...payload,
        activo:
          this.formulario.activo
          !== false
      };

      this.pacientesService
        .actualizarPaciente(
          this.formulario.id,
          updatePayload
        )
        .subscribe({

          next: (
            pacienteActualizado:any
          ) => {

            this.guardando = false;

            this.cerrarFormulario();

            this.actualizarEnListado(
              pacienteActualizado
            );

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title:
                'Paciente actualizado',
              showConfirmButton: false,
              timer: 2200
            });
          },

          error: (error: any) => {

            this.guardando = false;

            this.mostrarError(
              error,
              'No se pudo actualizar el paciente.'
            );
          }
        });

      return;
    }

    // ========================================
    // CREAR
    // ========================================

    this.pacientesService
      .crearPaciente(payload)
      .subscribe({

        next: (
          nuevoPaciente:any
        ) => {

          this.guardando = false;

          this.cerrarFormulario();

          this.pacientes.push(
            nuevoPaciente
          );

          this.aplicarFiltros();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title:
              'Paciente creado',
            showConfirmButton: false,
            timer: 2200
          });
        },

        error: (error: any) => {

          this.guardando = false;

          this.mostrarError(
            error,
            'No se pudo crear el paciente.'
          );
        }
      });
  }

  // ==========================================
  // ELIMINAR
  // ==========================================

  borrarPaciente(
    paciente: Paciente
  ): void {

    Swal.fire({

      title:
        '¿Eliminar paciente?',

      text:
        `Se dará de baja a ${this.obtenerNombreCompleto(paciente)}.`,

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonText:
        'Sí, eliminar',

      cancelButtonText:
        'Volver',

      confirmButtonColor:
        '#dc2626',

      reverseButtons:
        true

    }).then(result => {

      if (
        !result.isConfirmed
      ) {
        return;
      }

      this.pacientesService
        .eliminarPaciente(
          paciente.id
        )
        .subscribe({

          next: () => {

            this.pacientes =
              this.pacientes.filter(
                p =>
                  p.id !== paciente.id
              );

            this.aplicarFiltros();

            this.cerrarFicha();

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title:
                'Paciente eliminado',
              showConfirmButton: false,
              timer: 2200
            });
          },

          error: (error: any) => {

            this.mostrarError(
              error,
              'No se pudo eliminar el paciente.'
            );
          }
        });
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  obtenerNombreCompleto(
    paciente: Paciente
  ): string {

    return `${paciente.nombre} ${paciente.apellido}`
      .trim();
  }

  obtenerIniciales(
    paciente: Paciente
  ): string {

    const nombre =
      paciente.nombre
        ?.charAt(0) ?? '';

    const apellido =
      paciente.apellido
        ?.charAt(0) ?? '';

    return `${nombre}${apellido}`
      .toUpperCase();
  }

  obtenerEdad(
    paciente: Paciente
  ): number | null {

    if (
      !paciente.fecha_nacimiento
    ) {
      return null;
    }

    const partes =
      paciente.fecha_nacimiento
        .split('-')
        .map(Number);

    if (
      partes.length !== 3
    ) {
      return null;
    }

    const nacimiento =
      new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
      );

    const hoy =
      new Date();

    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear();

    const diferenciaMes =
      hoy.getMonth() -
      nacimiento.getMonth();

    if (
      diferenciaMes < 0 ||
      (
        diferenciaMes === 0 &&
        hoy.getDate() <
        nacimiento.getDate()
      )
    ) {

      edad--;
    }

    return edad;
  }

  formatearFecha(
    fecha?: string | null
  ): string {

    if (!fecha) {
      return '-';
    }

    const [
      year,
      month,
      day
    ] = fecha
      .split('-')
      .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return fecha;
    }

    return new Date(
      year,
      month - 1,
      day
    ).toLocaleDateString(
      'es-AR'
    );
  }

  private crearFormularioVacio() {

    return {

      id: null,

      nombre: '',
      apellido: '',
      dni: '',

      email: '',
      telefono: '',

      fecha_nacimiento: '',
      direccion: '',
      sexo: '',

      obra_social_id: null,
      obra_social: null,

      numero_afiliado: '',

      activo: true
    };
  }

  private actualizarEnListado(
    paciente:
      Paciente
  ): void {

    const index =
      this.pacientes
        .findIndex(
          p =>
            p.id === paciente.id
        );

    if (
      index !== -1
    ) {

      this.pacientes[index] =
        paciente;

    } else {

      this.pacientes.push(
        paciente
      );
    }

    this.aplicarFiltros();
  }

  private normalizarOpcional(
    valor: any
  ): string | null {

    if (
      valor === null ||
      valor === undefined
    ) {
      return null;
    }

    const texto =
      valor
        .toString()
        .trim();

    return texto
      ? texto
      : null;
  }

  private mostrarValidacion(
    mensaje: string
  ): void {

    Swal.fire({
      icon: 'warning',
      title:
        'Revisá los datos',
      text:
        mensaje,
      confirmButtonColor:
        '#7c3aed'
    });
  }

  private mostrarError(
    error: any,
    mensajeDefault: string
  ): void {

    Swal.fire({

      icon:
        'error',

      title:
        'Ocurrió un problema',

      text:
        this.obtenerMensajeError(
          error,
          mensajeDefault
        )
    });
  }

  private obtenerMensajeError(
    error: any,
    defaultMessage =
      'Ocurrió un error al comunicarse con la API.'
  ): string {

    const mensaje =
      error?.error?.message ??
      error?.error?.mensaje ??
      error?.error?.title ??
      error?.message;

    return (
      typeof mensaje === 'string'
        ? mensaje
        : defaultMessage
    );
  }
}