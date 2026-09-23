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
  BloqueoOrganizacion,
  ConfiguracionOrganizacionService,
  Especialidad,
  HorarioSucursal,
  ObraSocial,
  OrganizacionGeneral,
  Sucursal
} from '../services/configuracion-organizacion.service';


@Component({
  selector: 'app-periodo-inactividad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './inactividad.component.html',
  styleUrls: [
    './inactividad.component.css'
  ]
})
export class InactividadComponent
  implements OnInit {


  // ==========================================
  // TAB ACTIVA
  // ==========================================

 tabActiva:
  | 'general'
  | 'sucursales'
  | 'horarios'
  | 'especialidades'
  | 'obras'
  | 'bloqueos'
  = 'general';


  // ==========================================
  // ESTADOS
  // ==========================================

  cargandoSucursales = false;

  cargandoHorarios = false;

  cargandoEspecialidades = false;

  guardando = false;

cargandoOrganizacion = false;
subiendoLogoOrganizacion = false;
guardandoOrganizacion = false;

tipoTelefonoOrganizacion:
  'celular' | 'fijo' = 'celular';

telefonoOrganizacionInput = '';

subiendoBannerOrganizacion = false;
organizacionGeneral: OrganizacionGeneral = {

  id: '',

  nombre: '',

  slug: '',

  logoUrl: null,

  colorPrincipal: '#17483d',

  colorSecundario: '#8B5CF6',

  bannerUrl: null,

  faviconUrl: null,

  telefono: null,

  email: null,

  direccion: null,

  ciudad: null,

  pais: null,

  timezone:
    'America/Argentina/Buenos_Aires'

};
  // ==========================================
  // DÍAS
  // ==========================================

  diasSemana = [

    {
      id: 1,
      nombre: 'Lunes',
      corto: 'L',
      seleccionado: false
    },

    {
      id: 2,
      nombre: 'Martes',
      corto: 'M',
      seleccionado: false
    },

    {
      id: 3,
      nombre: 'Miércoles',
      corto: 'X',
      seleccionado: false
    },

    {
      id: 4,
      nombre: 'Jueves',
      corto: 'J',
      seleccionado: false
    },

    {
      id: 5,
      nombre: 'Viernes',
      corto: 'V',
      seleccionado: false
    },

    {
      id: 6,
      nombre: 'Sábado',
      corto: 'S',
      seleccionado: false
    },

    {
      id: 7,
      nombre: 'Domingo',
      corto: 'D',
      seleccionado: false
    }

  ];


  // ==========================================
  // SUCURSALES
  // ==========================================
subiendoFotoSucursal = false;

previewFotoSucursal: string | null = null;
  listaSucursales: Sucursal[] = [];

sucursalEditandoId: string | null = null;

modoEdicionSucursal = false;
 nuevaSucursal = {

  nombre: '',

  calle: '',

  altura: '',

  pisoDepto: '',

  ciudad: '',

  telefono: '',

  email: '',

  fotoUrl: ''

};
  // ==========================================
  // HORARIOS DE APERTURA
  // ==========================================

  listaHorarios: HorarioSucursal[] = [];


  nuevoHorario = {

    sucursalId: '',

    horaInicio: '',

    horaFin: ''

  };


  // ==========================================
  // ESPECIALIDADES
  // ==========================================

  listaEspecialidades: Especialidad[] = [];


  nuevaEspecialidad = {

    nombre: '',

    icono: 'fa-stethoscope',

    color: '#17483d'

  };


  mostrarSelectorIconos = false;


  iconosDisponibles = [

    'fa-stethoscope',

    'fa-heart-pulse',

    'fa-user-doctor',

    'fa-brain',

    'fa-tooth',

    'fa-eye',

    'fa-lungs',

    'fa-bone',

    'fa-baby',

    'fa-apple-whole',

    'fa-weight-scale',

    'fa-pills',

    'fa-dna',

    'fa-droplet',

    'fa-hand-holding-medical',

    'fa-notes-medical',

    'fa-hospital',

    'fa-person',

    'fa-heart',

    'fa-star'

  ];


  coloresDisponibles = [

    '#17483d',

    '#2563eb',

    '#7c3aed',

    '#db2777',

    '#dc2626',

    '#ea580c',

    '#ca8a04',

    '#16a34a',

    '#0891b2',

    '#475569'

  ];


  // ==========================================
  // OBRAS SOCIALES - TEMPORAL
  // ==========================================

listaObrasSociales: ObraSocial[] = [];

cargandoObrasSociales = false;

  nuevaObraSocial = {

    nombre: '',

    siglas: '',

    codigoPrestador: ''

  };


  // ==========================================
  // BLOQUEOS GENERALES DE ORGANIZACIÓN
  // ==========================================

  listaBloqueos: BloqueoOrganizacion[] = [];

  cargandoBloqueos = false;


  nuevoBloqueo = {

    inicio: '',

    fin: '',

    motivo: ''

  };


  constructor(
    private configuracionService:
      ConfiguracionOrganizacionService
  ) {}


  // ==========================================
  // INIT
  // ==========================================

 ngOnInit(): void {
  this.cargarOrganizacion();

  this.cargarSucursales();

  this.cargarHorarios();

  this.cargarEspecialidades();

  this.cargarObrasSociales();

  this.cargarBloqueos();

}


  // ==========================================
  // TABS
  // ==========================================

  cambiarTab(
  tab:
    | 'general'
    | 'sucursales'
    | 'horarios'
    | 'especialidades'
    | 'obras'
    | 'bloqueos'
): void {

  this.tabActiva = tab;

}
// ==========================================
// ORGANIZACIÓN - CARGAR INFORMACIÓN GENERAL
// ==========================================

cargarOrganizacion(): void {

  this.cargandoOrganizacion = true;


  this.configuracionService
    .obtenerOrganizacionActual()
    .subscribe({
next: (data) => {

  this.organizacionGeneral = data;

  this.prepararTelefonoOrganizacion(
    data.telefono
  );

  this.cargandoOrganizacion = false;

},


      error: (error) => {

        this.cargandoOrganizacion = false;

        console.error(
          'Error cargando organización:',
          error
        );

        this.mostrarErrorBackend(
          error,
          'No pudimos cargar la información de la organización.'
        );

      }

    });

}

// ==========================================
// ORGANIZACIÓN - TELÉFONO
// ==========================================

private prepararTelefonoOrganizacion(
  telefono: string | null
): void {

  if (!telefono) {

    this.telefonoOrganizacionInput = '';

    this.tipoTelefonoOrganizacion =
      'celular';

    return;
  }


  const numeros =
    telefono.replace(/\D/g, '');


  // +54 9 = celular argentino
  if (numeros.startsWith('549')) {

    this.tipoTelefonoOrganizacion =
      'celular';

    this.telefonoOrganizacionInput =
      numeros.substring(3);

    return;
  }


  // +54 = teléfono fijo argentino
  if (numeros.startsWith('54')) {

    this.tipoTelefonoOrganizacion =
      'fijo';

    this.telefonoOrganizacionInput =
      numeros.substring(2);

    return;
  }


  this.telefonoOrganizacionInput =
    numeros;
}


// ==========================================
// NORMALIZAR TELÉFONO ARGENTINO
// ==========================================

private normalizarTelefonoOrganizacion():
  string | null {

  let numeros =
    this.telefonoOrganizacionInput
      .replace(/\D/g, '');


  if (!numeros) {
    return null;
  }


  // 0054...
  if (numeros.startsWith('0054')) {

    numeros =
      numeros.substring(4);

  }

  // 54...
  else if (numeros.startsWith('54')) {

    numeros =
      numeros.substring(2);

  }


  // Quitar 0 inicial del código de área
  numeros =
    numeros.replace(/^0+/, '');


  // Si pegó un +54 9...
  if (
    this.tipoTelefonoOrganizacion ===
      'celular' &&
    numeros.startsWith('9') &&
    numeros.length === 11
  ) {

    numeros =
      numeros.substring(1);

  }


  // Argentina debe quedar con 10 dígitos
  // código de área + número
  if (numeros.length !== 10) {

    throw new Error(
      'El teléfono debe tener 10 números incluyendo el código de área. Ej: 223 5551234.'
    );

  }


  if (
    this.tipoTelefonoOrganizacion ===
    'celular'
  ) {

    return `+549${numeros}`;

  }


  return `+54${numeros}`;
}


// ==========================================
// ORGANIZACIÓN - SLUG
// ==========================================

normalizarSlugOrganizacion(): void {

  this.organizacionGeneral.slug =
    this.organizacionGeneral.slug
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

}


// ==========================================
// ORGANIZACIÓN - GUARDAR
// ==========================================

guardarOrganizacion(): void {

  if (this.guardandoOrganizacion) {
    return;
  }


  const nombre =
    this.organizacionGeneral.nombre
      .trim();

  const slug =
    this.organizacionGeneral.slug
      .trim();


  if (!nombre) {

    this.mostrarError(
      'Ingresá el nombre de la organización.'
    );

    return;
  }


  if (!slug) {

    this.mostrarError(
      'Ingresá un identificador para el enlace público.'
    );

    return;
  }


  // ========================================
  // EMAIL
  // ========================================

  const email =
    this.organizacionGeneral.email
      ?.trim() || null;


  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email)
  ) {

    this.mostrarError(
      'Ingresá un email válido.'
    );

    return;
  }


  // ========================================
  // TELÉFONO
  // ========================================

  let telefono: string | null;


  try {

    telefono =
      this.normalizarTelefonoOrganizacion();

  }
  catch (error: any) {

    this.mostrarError(
      error.message
    );

    return;

  }


  // ========================================
  // GUARDAR
  // ========================================

  this.guardandoOrganizacion =
    true;


  this.configuracionService
    .actualizarOrganizacionActual({

      nombre,

      slug,

      telefono,

      email,

      direccion:
        this.organizacionGeneral.direccion
          ?.trim() || null,

      ciudad:
        this.organizacionGeneral.ciudad
          ?.trim() || null,

      pais:
        this.organizacionGeneral.pais
          ?.trim() || null,

      colorPrincipal:
        this.organizacionGeneral
          .colorPrincipal,

      colorSecundario:
        this.organizacionGeneral
          .colorSecundario

    })
    .subscribe({

      next: () => {

        this.guardandoOrganizacion =
          false;

        this.mostrarToast(
          'Información actualizada'
        );

        this.cargarOrganizacion();

      },


      error: (error) => {

        this.guardandoOrganizacion =
          false;

        this.mostrarErrorBackend(
          error,
          'No pudimos actualizar la organización.'
        );

      }

    });

}
  // ==========================================
  // SUCURSALES - CARGAR
  // ==========================================

  cargarSucursales(): void {

    this.cargandoSucursales = true;


    this.configuracionService
      .obtenerSucursales()
      .subscribe({

        next: (data) => {

          this.listaSucursales =
            data;

          this.cargandoSucursales =
            false;

        },


        error: (error) => {

          this.cargandoSucursales =
            false;

          console.error(
            'Error cargando sucursales:',
            error
          );

        }

      });

  }


  // ==========================================
  // SUCURSAL - CREAR
  // ==========================================

guardarSucursal(): void {

  if (
    !this.nuevaSucursal.nombre.trim() ||
    !this.nuevaSucursal.calle.trim() ||
    !this.nuevaSucursal.altura.trim() ||
    !this.nuevaSucursal.ciudad.trim()
  ) {

    this.mostrarError(
      'Completá el nombre, calle, número y ciudad.'
    );

    return;
  }

  this.guardando = true;


  const payload = {

    nombre:
      this.nuevaSucursal.nombre.trim(),

    calle:
      this.nuevaSucursal.calle.trim(),

    altura:
      this.nuevaSucursal.altura.trim(),

    pisoDepto:
      this.nuevaSucursal.pisoDepto.trim() || null,

    ciudad:
      this.nuevaSucursal.ciudad.trim(),

    telefono:
      this.nuevaSucursal.telefono.trim() || null,

    email:
      this.nuevaSucursal.email.trim() || null,

    fotoUrl:
      this.nuevaSucursal.fotoUrl || null,

    latitud:
      null,

    longitud:
      null
  };


  // ==========================================
  // EDITAR
  // ==========================================

  if (
    this.modoEdicionSucursal &&
    this.sucursalEditandoId
  ) {

    this.configuracionService
      .actualizarSucursal(
        this.sucursalEditandoId,
        payload
      )
      .subscribe({

        next: () => {

          this.guardando = false;

          this.cancelarEdicionSucursal();

          this.cargarSucursales();

          this.mostrarToast(
            'Sucursal actualizada'
          );

        },

        error: (error) => {

          this.guardando = false;

          this.mostrarErrorBackend(
            error,
            'No pudimos actualizar la sucursal.'
          );

        }

      });

    return;
  }


  // ==========================================
  // CREAR
  // ==========================================

  this.configuracionService
    .crearSucursal(payload)
    .subscribe({

      next: () => {

        this.guardando = false;

        this.cancelarEdicionSucursal();

        this.cargarSucursales();

        this.mostrarToast(
          'Sucursal creada'
        );

      },

      error: (error) => {

        this.guardando = false;

        this.mostrarErrorBackend(
          error,
          'No pudimos crear la sucursal.'
        );

      }

    });

}


editarSucursal(
  sucursal: Sucursal
): void {

  this.sucursalEditandoId =
    sucursal.id;

  this.modoEdicionSucursal =
    true;

  this.nuevaSucursal = {

    nombre:
      sucursal.nombre,

    calle:
      sucursal.calle,

    altura:
      sucursal.altura,

    pisoDepto:
      sucursal.pisoDepto || '',

    ciudad:
      sucursal.ciudad,

    telefono:
      sucursal.telefono || '',

    email:
      sucursal.email || '',

    fotoUrl:
      sucursal.fotoUrl || ''

  };

  this.previewFotoSucursal =
    sucursal.fotoUrl || null;

}

cancelarEdicionSucursal(): void {

  this.sucursalEditandoId =
    null;

  this.modoEdicionSucursal =
    false;

  this.nuevaSucursal = {

    nombre: '',

    calle: '',

    altura: '',

    pisoDepto: '',

    ciudad: '',

    telefono: '',

    email: '',

    fotoUrl: ''

  };

  this.previewFotoSucursal =
    null;

}

  // ==========================================
  // SUCURSAL - ELIMINAR
  // ==========================================

  eliminarSucursal(
    id: string
  ): void {

    Swal.fire({

      title:
        '¿Eliminar sucursal?',

      text:
        'La sede dejará de estar disponible.',

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonText:
        'Eliminar',

      cancelButtonText:
        'Cancelar',

      confirmButtonColor:
        '#b42318'

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }


      this.configuracionService
        .eliminarSucursal(id)
        .subscribe({

          next: () => {

            this.cargarSucursales();

            this.cargarHorarios();

          },


          error: (error) => {

            this.mostrarErrorBackend(
              error,
              'No pudimos eliminar la sucursal.'
            );

          }

        });

    });

  }


  // ==========================================
  // HORARIOS - CARGAR
  // ==========================================

  cargarHorarios(): void {

    this.cargandoHorarios = true;


    this.configuracionService
      .obtenerHorariosSucursal()
      .subscribe({

        next: (data) => {

          this.listaHorarios =
            data;

          this.cargandoHorarios =
            false;

        },


        error: (error) => {

          this.cargandoHorarios =
            false;

          console.error(
            'Error cargando horarios:',
            error
          );

        }

      });

  }


  // ==========================================
  // HORARIOS - CREAR
  // ==========================================

  guardarHorario(): void {

    const diasSeleccionados =
      this.diasSemana.filter(
        d => d.seleccionado
      );


    if (
      !this.nuevoHorario.sucursalId ||
      !this.nuevoHorario.horaInicio ||
      !this.nuevoHorario.horaFin ||
      diasSeleccionados.length === 0
    ) {

      this.mostrarError(
        'Elegí una sucursal, al menos un día y el horario.'
      );

      return;

    }


    if (
      this.nuevoHorario.horaInicio >=
      this.nuevoHorario.horaFin
    ) {

      this.mostrarError(
        'La hora de apertura debe ser anterior al cierre.'
      );

      return;

    }


    this.guardando = true;


    let completados = 0;

    let errores = 0;


    diasSeleccionados.forEach(
      dia => {

        this.configuracionService
          .crearHorarioSucursal({

            sucursalId:
              this.nuevoHorario.sucursalId,

            diaSemana:
              dia.id,

            horaInicio:
              this.normalizarHora(
                this.nuevoHorario.horaInicio
              ),

            horaFin:
              this.normalizarHora(
                this.nuevoHorario.horaFin
              )

          })
          .subscribe({

            next: () => {

              completados++;

              this.verificarFinGuardadoHorarios(
                completados,
                errores,
                diasSeleccionados.length
              );

            },


            error: (error) => {

              completados++;

              errores++;


              console.error(
                'Error guardando horario:',
                error
              );


              this.verificarFinGuardadoHorarios(
                completados,
                errores,
                diasSeleccionados.length
              );

            }

          });

      }
    );

  }


  private verificarFinGuardadoHorarios(
    completados: number,
    errores: number,
    total: number
  ): void {

    if (completados !== total) {
      return;
    }


    this.guardando = false;


    this.cargarHorarios();


    if (errores === 0) {

      this.nuevoHorario = {

        sucursalId: '',

        horaInicio: '',

        horaFin: ''

      };


      this.diasSemana.forEach(
        d => d.seleccionado = false
      );


      this.mostrarToast(
        'Horario de apertura guardado'
      );

      return;

    }


    Swal.fire({

      icon:
        'warning',

      title:
        'Algunos horarios no se guardaron',

      text:
        `Se produjeron ${errores} errores. Revisá si ya existen horarios superpuestos.`,

      confirmButtonColor:
        '#17483d'

    });

  }


  // ==========================================
  // HORARIO - ELIMINAR
  // ==========================================

  eliminarHorario(
    id: string
  ): void {

    this.configuracionService
      .eliminarHorarioSucursal(id)
      .subscribe({

        next: () => {

          this.cargarHorarios();

        },


        error: (error) => {

          this.mostrarErrorBackend(
            error,
            'No pudimos eliminar el horario.'
          );

        }

      });

  }


  // ==========================================
  // ESPECIALIDADES - CARGAR
  // ==========================================

  cargarEspecialidades(): void {

    this.cargandoEspecialidades =
      true;


    this.configuracionService
      .obtenerEspecialidades()
      .subscribe({

        next: (respuesta) => {

          this.listaEspecialidades =
            respuesta.data?.items
            ?? [];

          this.cargandoEspecialidades =
            false;

        },


        error: (error) => {

          this.cargandoEspecialidades =
            false;

          console.error(
            'Error cargando especialidades:',
            error
          );

        }

      });

  }


  // ==========================================
  // ESPECIALIDADES - CREAR
  // ==========================================

  guardarEspecialidad(): void {

    if (
      !this.nuevaEspecialidad.nombre.trim()
    ) {

      this.mostrarError(
        'Ingresá el nombre de la especialidad.'
      );

      return;

    }


    this.guardando = true;


    this.configuracionService
      .crearEspecialidad({

        nombre:
          this.nuevaEspecialidad.nombre.trim(),

        color:
          this.nuevaEspecialidad.color,

        icono:
          this.nuevaEspecialidad.icono

      })
      .subscribe({

        next: () => {

          this.guardando =
            false;


          this.nuevaEspecialidad = {

            nombre: '',

            icono:
              'fa-stethoscope',

            color:
              '#17483d'

          };


          this.cargarEspecialidades();


          this.mostrarToast(
            'Especialidad creada'
          );

        },


        error: (error) => {

          this.guardando =
            false;


          this.mostrarErrorBackend(
            error,
            'No pudimos crear la especialidad.'
          );

        }

      });

  }


  // ==========================================
  // ESPECIALIDAD - ELIMINAR
  // ==========================================

  eliminarEspecialidad(
    id: string
  ): void {

    Swal.fire({

      title:
        '¿Eliminar especialidad?',

      text:
        'Los profesionales dejarán de poder seleccionarla.',

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonText:
        'Eliminar',

      cancelButtonText:
        'Cancelar',

      confirmButtonColor:
        '#b42318'

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }


      this.configuracionService
        .eliminarEspecialidad(id)
        .subscribe({

          next: () => {

            this.cargarEspecialidades();

          },


          error: (error) => {

            this.mostrarErrorBackend(
              error,
              'No pudimos eliminar la especialidad.'
            );

          }

        });

    });

  }


  // ==========================================
  // SELECTOR DE ICONOS
  // ==========================================

  abrirSelectorIconos(): void {

    this.mostrarSelectorIconos =
      !this.mostrarSelectorIconos;

  }


  seleccionarIcono(
    icono: string
  ): void {

    this.nuevaEspecialidad.icono =
      icono;

    this.mostrarSelectorIconos =
      false;

  }


  seleccionarColor(
    color: string
  ): void {

    this.nuevaEspecialidad.color =
      color;

  }


  // ==========================================
// OBRAS SOCIALES - CARGAR
// ==========================================

cargarObrasSociales(): void {

  this.cargandoObrasSociales = true;

  this.configuracionService
    .obtenerObrasSociales()
    .subscribe({

      next: (respuesta) => {

        this.listaObrasSociales =
          respuesta.items ?? [];

        this.cargandoObrasSociales = false;
      },

      error: (error) => {

        this.cargandoObrasSociales = false;

        console.error(
          'Error cargando obras sociales:',
          error
        );

        this.mostrarErrorBackend(
          error,
          'No pudimos cargar las obras sociales.'
        );
      }

    });
}


// ==========================================
// OBRA SOCIAL - CREAR
// ==========================================

guardarObraSocial(): void {

  if (
    !this.nuevaObraSocial.nombre.trim()
  ) {

    this.mostrarError(
      'Ingresá el nombre de la obra social.'
    );

    return;
  }

  if (this.guardando) {
    return;
  }

  this.guardando = true;

  this.configuracionService
    .crearObraSocial({

      nombre:
        this.nuevaObraSocial.nombre.trim(),

      siglas:
        this.nuevaObraSocial.siglas.trim() || null,

      codigoPrestador:
        this.nuevaObraSocial.codigoPrestador.trim() || null

    })
    .subscribe({

      next: () => {

        this.guardando = false;

        this.nuevaObraSocial = {
          nombre: '',
          siglas: '',
          codigoPrestador: ''
        };

        this.cargarObrasSociales();

        this.mostrarToast(
          'Obra social creada'
        );
      },

      error: (error) => {

        this.guardando = false;

        console.error(
          'Error creando obra social:',
          error
        );

        this.mostrarErrorBackend(
          error,
          'No pudimos crear la obra social.'
        );
      }

    });
}


// ==========================================
// OBRA SOCIAL - ELIMINAR
// ==========================================

eliminarObraSocial(
  id: string
): void {

  Swal.fire({

    title:
      '¿Eliminar obra social?',

    text:
      'Dejará de estar disponible para los profesionales.',

    icon:
      'warning',

    showCancelButton:
      true,

    confirmButtonText:
      'Eliminar',

    cancelButtonText:
      'Cancelar',

    confirmButtonColor:
      '#b42318'

  }).then(result => {

    if (!result.isConfirmed) {
      return;
    }

    this.configuracionService
      .eliminarObraSocial(id)
      .subscribe({

        next: () => {

          this.cargarObrasSociales();

          this.mostrarToast(
            'Obra social eliminada'
          );
        },

        error: (error) => {

          this.mostrarErrorBackend(
            error,
            'No pudimos eliminar la obra social.'
          );
        }

      });

  });

}


  // ==========================================
  // BLOQUEOS GENERALES DE ORGANIZACIÓN
  // ==========================================

  cargarBloqueos(): void {

    if (this.cargandoBloqueos) {
      return;
    }


    this.cargandoBloqueos = true;


    this.configuracionService
      .obtenerBloqueosOrganizacion()
      .subscribe({

        next: (bloqueos) => {

          this.listaBloqueos =
            bloqueos;

          this.cargandoBloqueos =
            false;

        },


        error: (error) => {

          this.cargandoBloqueos =
            false;

          console.error(
            'Error cargando bloqueos de organización:',
            error
          );


          this.mostrarErrorBackend(
            error,
            'No pudimos cargar los bloqueos de la organización.'
          );

        }

      });

  }


  guardarBloqueo(): void {

    if (
      !this.nuevoBloqueo.inicio ||
      !this.nuevoBloqueo.fin
    ) {

      this.mostrarError(
        'Completá la fecha de inicio y fin.'
      );

      return;

    }


    if (
      this.nuevoBloqueo.inicio >=
      this.nuevoBloqueo.fin
    ) {

      this.mostrarError(
        'La fecha de inicio debe ser anterior a la fecha de fin.'
      );

      return;

    }


    if (this.guardando) {
      return;
    }


    this.guardando = true;


    this.configuracionService
      .crearBloqueoOrganizacion({

        inicio:
          this.nuevoBloqueo.inicio,

        fin:
          this.nuevoBloqueo.fin,

        motivo:
          this.nuevoBloqueo.motivo.trim()
            ? this.nuevoBloqueo.motivo.trim()
            : null

      })
      .subscribe({

        next: (bloqueo) => {

          this.guardando =
            false;


          this.listaBloqueos =
            [
              ...this.listaBloqueos,
              bloqueo
            ]
            .sort(
              (a, b) =>
                a.inicio.localeCompare(
                  b.inicio
                )
            );


          this.nuevoBloqueo = {

            inicio: '',

            fin: '',

            motivo: ''

          };


          this.mostrarToast(
            'Bloqueo general creado'
          );

        },


        error: (error) => {

          this.guardando =
            false;


          console.error(
            'Error creando bloqueo de organización:',
            error
          );


          this.mostrarErrorBackend(
            error,
            'No pudimos crear el bloqueo de la organización.'
          );

        }

      });

  }


  eliminarBloqueo(
    id: string
  ): void {

    Swal.fire({

      icon:
        'warning',

      title:
        '¿Eliminar bloqueo general?',

      text:
        'La organización volverá a estar disponible durante ese período.',

      showCancelButton:
        true,

      confirmButtonText:
        'Eliminar bloqueo',

      cancelButtonText:
        'Cancelar',

      confirmButtonColor:
        '#b42318',

      cancelButtonColor:
        '#71817c'

    })
    .then(result => {

      if (!result.isConfirmed) {
        return;
      }


      this.configuracionService
        .eliminarBloqueoOrganizacion(
          id
        )
        .subscribe({

          next: () => {

            this.listaBloqueos =
              this.listaBloqueos.filter(
                x => x.id !== id
              );


            this.mostrarToast(
              'Bloqueo eliminado'
            );

          },


          error: (error) => {

            console.error(
              'Error eliminando bloqueo de organización:',
              error
            );


            this.mostrarErrorBackend(
              error,
              'No pudimos eliminar el bloqueo de la organización.'
            );

          }

        });

    });

  }


  // ==========================================
  // HELPERS
  // ==========================================

  horariosPorSucursal(
    sucursalId: string
  ): HorarioSucursal[] {

    return this.listaHorarios
      .filter(
        x =>
          x.sucursalId ===
          sucursalId
      )
      .sort(
        (a, b) =>
          a.diaSemana -
          b.diaSemana
      );

  }


  obtenerNombreSucursal(
    id: string
  ): string {

    return (
      this.listaSucursales.find(
        x => x.id === id
      )?.nombre
      ??
      'Sucursal'
    );

  }


  get cantidadSucursales(): number {

    return this.listaSucursales.length;

  }


  get cantidadHorarios(): number {

    return this.listaHorarios.length;

  }


  get cantidadEspecialidades(): number {

    return this.listaEspecialidades.length;

  }


  private normalizarHora(
    hora: string
  ): string {

    return hora.length === 5
      ? `${hora}:00`
      : hora;

  }


  // ==========================================
  // ALERTAS
  // ==========================================

  private mostrarToast(
    mensaje: string
  ): void {

    Swal.fire({

      toast:
        true,

      position:
        'top-end',

      icon:
        'success',

      title:
        mensaje,

      showConfirmButton:
        false,

      timer:
        1800,

      timerProgressBar:
        true

    });

  }


  private mostrarError(
    mensaje: string
  ): void {

    Swal.fire({

      icon:
        'warning',

      title:
        'Revisá los datos',

      text:
        mensaje,

      confirmButtonColor:
        '#17483d'

    });

  }


  private mostrarErrorBackend(
    error: any,
    fallback: string
  ): void {

    Swal.fire({

      icon:
        'error',

      title:
        'Ocurrió un problema',

      text:
        error?.error?.message ||
        error?.error ||
        fallback,

      confirmButtonColor:
        '#17483d'

    });

  }
// ==========================================
// FOTO SUCURSAL
// ==========================================

seleccionarFotoSucursal(
  event: Event
): void {

  const input =
    event.target as HTMLInputElement;

  if (
    !input.files ||
    input.files.length === 0
  ) {
    return;
  }

  const archivo =
    input.files[0];


  // Preview local inmediato
  const reader =
    new FileReader();

  reader.onload = () => {

    this.previewFotoSucursal =
      reader.result as string;

  };

  reader.readAsDataURL(
    archivo
  );


  // Subida real
  this.subirFotoSucursal(
    archivo
  );

}


// ==========================================
// SUBIR A CLOUDINARY
// ==========================================

private subirFotoSucursal(
  archivo: File
): void {

  this.subiendoFotoSucursal =
    true;


  this.configuracionService
    .subirFotoSucursal(
      archivo
    )
    .subscribe({

      next: (respuesta) => {

        this.subiendoFotoSucursal =
          false;

        this.nuevaSucursal.fotoUrl =
          respuesta.url;

        this.previewFotoSucursal =
          respuesta.url;

        this.mostrarToast(
          'Foto subida correctamente'
        );

      },


      error: (error) => {

        this.subiendoFotoSucursal =
          false;

        this.previewFotoSucursal =
          null;

        this.nuevaSucursal.fotoUrl =
          '';

        this.mostrarErrorBackend(
          error,
          'No pudimos subir la imagen.'
        );

      }

    });

}


// ==========================================
// QUITAR FOTO
// ==========================================

quitarFotoSucursal(): void {

  this.previewFotoSucursal =
    null;

  this.nuevaSucursal.fotoUrl =
    '';

}

// ==========================================
// ORGANIZACIÓN - LOGO
// ==========================================

seleccionarLogoOrganizacion(
  event: Event
): void {

  const input =
    event.target as HTMLInputElement;


  if (
    !input.files ||
    input.files.length === 0
  ) {
    return;
  }


  const archivo =
    input.files[0];


  // ========================================
  // VALIDAR TAMAÑO
  // ========================================

  const maximo =
    5 * 1024 * 1024;


  if (archivo.size > maximo) {

    this.mostrarError(
      'El logo no puede superar los 5 MB.'
    );

    input.value = '';

    return;
  }


  // ========================================
  // SUBIR
  // ========================================

  this.subiendoLogoOrganizacion =
    true;


  this.configuracionService
    .subirLogoOrganizacion(archivo)
    .subscribe({

      next: (respuesta) => {

        this.subiendoLogoOrganizacion =
          false;

        this.organizacionGeneral.logoUrl =
          respuesta.logoUrl;

        this.mostrarToast(
          'Logo actualizado'
        );

        input.value = '';

      },


      error: (error) => {

        this.subiendoLogoOrganizacion =
          false;

        input.value = '';

        this.mostrarErrorBackend(
          error,
          'No pudimos subir el logo.'
        );

      }

    });

}

// ==========================================
// ORGANIZACIÓN - BANNER
// ==========================================

seleccionarBannerOrganizacion(
  event: Event
): void {

  const input =
    event.target as HTMLInputElement;


  if (
    !input.files ||
    input.files.length === 0
  ) {
    return;
  }


  const archivo =
    input.files[0];


  const maximo =
    8 * 1024 * 1024;


  if (archivo.size > maximo) {

    this.mostrarError(
      'El banner no puede superar los 8 MB.'
    );

    input.value = '';

    return;
  }


  this.subiendoBannerOrganizacion =
    true;


  this.configuracionService
    .subirBannerOrganizacion(archivo)
    .subscribe({

      next: (respuesta) => {

        this.subiendoBannerOrganizacion =
          false;

        this.organizacionGeneral.bannerUrl =
          respuesta.bannerUrl;

        this.mostrarToast(
          'Banner actualizado'
        );

        input.value = '';

      },


      error: (error) => {

        this.subiendoBannerOrganizacion =
          false;

        input.value = '';

        this.mostrarErrorBackend(
          error,
          'No pudimos subir el banner.'
        );

      }

    });

}
}