import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { CrearReservaPublicaRespuesta, DisponibilidadDiaPublica, ReservaPublicaService } from '../../services/reserva-publica.service';


type ModoBusqueda =
  | 'rapido'
  | 'profesional'
  | 'sucursal';


interface PasoReserva {
  numero: number;
  titulo: string;
  corto: string;
}


interface DiaCalendarioReserva {
  fecha: string;
  diaNumero: number;
  mesNumero: number;
  anio: number;
  perteneceMesActual: boolean;
  disponible: boolean;
  cantidadTurnos: number;
  estado:
    | 'muchos'
    | 'pocos'
    | 'sin-turnos'
    | 'sin-atencion';
}


interface DatosPacienteReserva {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  obraSocial: string;
  motivoConsulta: string;
  observaciones: string;
}


interface EspecialidadReserva {
  id: string;
  nombre: string;
  icono: string;
  color: string | null;
}


interface SucursalReserva {
  id: string;
  nombre: string;
  calle: string;
  altura: string;
  pisoDepto: string | null;
  direccion: string;
  ciudad: string;
  fotoUrl: string | null;
  latitud: number | null;
  longitud: number | null;
}


interface ObraSocialDetalleReserva {
  id: string;
  nombre: string;
  siglas: string | null;
}


interface ProfesionalReserva {
  // La relación profesional-organización es el ID que usamos en la UI.
  id: string;

  profesionalId: string;
  profesionalOrganizacionId: string;
  profesionalEspecialidadId: string;

  nombre: string;
  especialidadId: string;
  especialidad: string;
  matricula: string;
  descripcion: string | null;
  fotoUrl: string | null;
  duracionTurno: number;

  sucursalIds: string[];
  sucursales: SucursalReserva[];

  obrasSociales: string[];
  obrasSocialesDetalle: ObraSocialDetalleReserva[];

  // Temporal hasta conectar disponibilidad real.
  proximoTurno: string;
}


interface TurnoRapidoReserva {
  id: string;
  profesional: ProfesionalReserva;
  sucursal: SucursalReserva;
  proximoTurno: string;
}


interface ConfiguracionReservaPublicaLocal {
  permitirReservaOnline: boolean;
  diasMaximosAnticipacion: number;
  permitirElegirProfesional: boolean;
  permitirElegirSucursal: boolean;
  requiereConfirmacion: boolean;

  solicitarDni: boolean;
  solicitarEmail: boolean;
  solicitarTelefono: boolean;
  solicitarFechaNacimiento: boolean;
  solicitarObraSocial: boolean;
  solicitarMotivoConsulta: boolean;
  solicitarObservaciones: boolean;

  tituloReserva: string | null;
  descripcionReserva: string | null;
}


@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  // ==========================================
  // ORGANIZACIÓN
  // ==========================================

  slug = '';

 cargandoReservaPublica = true;

  nombreOrganizacion = 'Organización';

  logoUrl: string | null = null;

  bannerUrl: string | null = null;

  colorPrincipal = '#17483d';

  colorSecundario = '#82a89f';

  configuracionPublica: ConfiguracionReservaPublicaLocal = {
    permitirReservaOnline: true,
    diasMaximosAnticipacion: 90,
    permitirElegirProfesional: true,
    permitirElegirSucursal: true,
    requiereConfirmacion: true,

    solicitarDni: true,
    solicitarEmail: true,
    solicitarTelefono: true,
    solicitarFechaNacimiento: false,
    solicitarObraSocial: true,
    solicitarMotivoConsulta: true,
    solicitarObservaciones: false,

    tituloReserva: 'Reservá tu turno',
    descripcionReserva:
      'Seleccioná la especialidad, el profesional, la fecha y el horario que prefieras.'
  };


  // ==========================================
  // PASOS
  // ==========================================

  pasoActual = 1;

  pasos: PasoReserva[] = [
    {
      numero: 1,
      titulo: 'Datos del paciente',
      corto: 'Datos'
    },
    {
      numero: 2,
      titulo: 'Especialidad',
      corto: 'Especialidad'
    },
    {
      numero: 3,
      titulo: '¿Cómo querés buscar?',
      corto: 'Buscar'
    },
    {
      numero: 4,
      titulo: 'Selección',
      corto: 'Selección'
    },
    {
      numero: 5,
      titulo: 'Fecha y hora',
      corto: 'Fecha'
    },
    {
      numero: 6,
      titulo: 'Confirmación',
      corto: 'Confirmar'
    }
  ];


  // ==========================================
  // PACIENTE
  // ==========================================

  paciente: DatosPacienteReserva = {
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    obraSocial: '',
    motivoConsulta: '',
    observaciones: ''
  };


  // ==========================================
  // ESPECIALIDADES REALES
  // ==========================================

  busquedaEspecialidad = '';

  especialidadSeleccionada:
    EspecialidadReserva | null = null;

  especialidades:
    EspecialidadReserva[] = [];


  // ==========================================
  // PROFESIONALES / SUCURSALES REALES
  // ==========================================

  cargandoProfesionales = false;

  profesionales:
    ProfesionalReserva[] = [];

  sucursales:
    SucursalReserva[] = [];


  // ==========================================
  // COBERTURA
  // ==========================================

  continuarComoParticular = false;

  // TEMPORAL:
  // cuando agreguemos las obras sociales al GET inicial,
  // este array también va a salir 100% del backend.
  obrasSociales = [
    'OSDE',
    'Swiss Medical',
    'IOMA',
    'Galeno',
    'Medifé',
    'Sancor Salud',
    'Particular'
  ];


  // ==========================================
  // BÚSQUEDA
  // ==========================================

  modoBusqueda:
    ModoBusqueda | null = null;

  profesionalSeleccionado:
    ProfesionalReserva | null = null;

  sucursalSeleccionada:
    SucursalReserva | null = null;

  turnoRapidoSeleccionado:
    string | null = null;


  // ==========================================
  // FECHA / HORA
  // ==========================================

  fechaSeleccionada = '';

  horaSeleccionada = '';

  mesActual = new Date().getMonth();

  anioActual = new Date().getFullYear();

  diasSemana = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
  ];

  meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  diasCalendario:
    DiaCalendarioReserva[] = [];

// ==========================================
// DISPONIBILIDAD REAL
// ==========================================

horariosPorFecha:
  Record<string, string[]> = {};


disponibilidadPorFecha:
  Record<
    string,
    DisponibilidadDiaPublica
  > = {};


cargandoDisponibilidad =
  false;

confirmandoTurno =
  false;


reservaFinalizada =
  false;


reservaCreada:
  CrearReservaPublicaRespuesta | null =
  null;

  constructor(
    private route: ActivatedRoute,
    private reservaPublicaService: ReservaPublicaService
  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.route.paramMap
      .subscribe(params => {

        this.slug =
          params.get('slug') || '';

        if (!this.slug) {
          return;
        }

        this.cargarReservaPublica();
      });

    this.generarCalendario();
  }


  // ==========================================
  // CARGA PÚBLICA
  // ==========================================

  cargarReservaPublica(): void {

    this.cargandoReservaPublica = true;

    this.reservaPublicaService
      .obtenerInicial(this.slug)
      .subscribe({

        next: data => {

          this.nombreOrganizacion =
            data.nombre;

          this.logoUrl =
            data.logoUrl;

          this.bannerUrl =
            data.bannerUrl;

          this.colorPrincipal =
            data.colorPrincipal ||
            '#17483d';

          this.colorSecundario =
            data.colorSecundario ||
            '#82a89f';

          if (data.configuracion) {
            this.configuracionPublica =
              data.configuracion;
          }

          this.especialidades =
            data.especialidades
              .map(especialidad => ({
                id: especialidad.id,
                nombre: especialidad.nombre,
                color: especialidad.color,
                icono:
                  especialidad.icono ||
                  'fa-stethoscope'
              }));

          this.cargandoReservaPublica = false;
        },

        error: error => {

          console.error(
            'Error cargando reserva pública:',
            error
          );

          this.cargandoReservaPublica = false;

          Swal.fire({
            icon: 'error',
            title: 'No pudimos cargar la reserva',
            text:
              'La organización no existe o no está disponible.',
            confirmButtonColor: '#17483d'
          });
        }
      });
  }


  // ==========================================
  // CARGAR PROFESIONALES REALES
  // ==========================================

  cargarProfesionales(): void {

    if (!this.especialidadSeleccionada) {
      this.profesionales = [];
      this.sucursales = [];
      return;
    }

    this.cargandoProfesionales = true;

    this.profesionales = [];
    this.sucursales = [];

    this.reservaPublicaService
      .obtenerProfesionales(
        this.slug,
        this.especialidadSeleccionada.id
      )
      .subscribe({

        next: data => {

          this.profesionales =
            data.map(profesional => {

              const sucursales:
                SucursalReserva[] =
                profesional.sucursales
                  .map(sucursal => ({
                    id: sucursal.id,
                    nombre: sucursal.nombre,
                    calle: sucursal.calle,
                    altura: sucursal.altura,
                    pisoDepto:
                      sucursal.pisoDepto,
                    direccion:
                      sucursal.direccion,
                    ciudad: sucursal.ciudad,
                    fotoUrl: sucursal.fotoUrl,
                    latitud: sucursal.latitud,
                    longitud: sucursal.longitud
                  }));

              return {
                id:
                  profesional
                    .profesionalOrganizacionId,

                profesionalId:
                  profesional.profesionalId,

                profesionalOrganizacionId:
                  profesional
                    .profesionalOrganizacionId,

                profesionalEspecialidadId:
                  profesional
                    .profesionalEspecialidadId,

                nombre:
                  profesional.nombre,

                especialidadId:
                  profesional.especialidadId,

                especialidad:
                  profesional.especialidad,

                matricula:
                  profesional.matricula || '',

                descripcion:
                  profesional.descripcion,

                fotoUrl:
                  profesional.fotoUrl,

                duracionTurno:
                  profesional.duracionTurno,

                sucursalIds:
                  sucursales.map(
                    sucursal => sucursal.id
                  ),

                sucursales,

                obrasSociales:
                  profesional.obrasSociales
                    .map(obra => obra.nombre),

                obrasSocialesDetalle:
                  profesional.obrasSociales,

                proximoTurno:
                  'Ver disponibilidad'
              };
            });


          // ==================================
          // SUCURSALES ÚNICAS
          // ==================================

          const mapaSucursales =
            new Map<string, SucursalReserva>();

          for (
            const profesional
            of this.profesionales
          ) {

            for (
              const sucursal
              of profesional.sucursales
            ) {

              if (
                !mapaSucursales.has(
                  sucursal.id
                )
              ) {
                mapaSucursales.set(
                  sucursal.id,
                  sucursal
                );
              }
            }
          }

          this.sucursales =
            Array.from(
              mapaSucursales.values()
            );

          this.cargandoProfesionales = false;
        },

        error: error => {

          console.error(
            'Error cargando profesionales:',
            error
          );

          this.profesionales = [];
          this.sucursales = [];
          this.cargandoProfesionales = false;

          Swal.fire({
            icon: 'error',
            title:
              'No pudimos cargar los profesionales',
            text:
              'Intentá nuevamente en unos segundos.',
            confirmButtonColor:
              this.colorPrincipal
          });
        }
      });
  }


  // ==========================================
  // GETTERS
  // ==========================================

  get nombreMesActual(): string {
    return (
      `${this.meses[this.mesActual]} ` +
      `de ${this.anioActual}`
    );
  }


get horariosDisponiblesFechaSeleccionada():
  string[] {

  if (
    !this.fechaSeleccionada
  ) {

    return [];

  }


  return this.obtenerHorariosValidos(
    this.fechaSeleccionada
  );

}

// ==========================================
// HORARIOS VÁLIDOS
// ==========================================

private obtenerHorariosValidos(
  fecha: string
): string[] {

  const horarios =
    this.horariosPorFecha[
      fecha
    ]
    ??
    [];


  const ahora =
    new Date();


  const hoy =
    this.formatearFechaIso(
      ahora
    );


  // ========================================
  // FECHA PASADA
  // ========================================

  if (
    fecha < hoy
  ) {

    return [];

  }


  // ========================================
  // FECHA FUTURA
  // ========================================

  if (
    fecha > hoy
  ) {

    return horarios;

  }


  // ========================================
  // HOY
  // QUITAMOS HORARIOS QUE YA PASARON
  // ========================================

  return horarios.filter(
    hora => {

      const [
        horas,
        minutos
      ] =
        hora
          .split(':')
          .map(Number);


      const horarioTurno =
        new Date(
          ahora.getFullYear(),
          ahora.getMonth(),
          ahora.getDate(),
          horas,
          minutos,
          0,
          0
        );


      return (
        horarioTurno >
        ahora
      );

    }
  );

}

  get tituloPasoActual(): string {
    return (
      this.pasos.find(
        paso =>
          paso.numero ===
          this.pasoActual
      )?.titulo
      ??
      ''
    );
  }


  get porcentajeProgreso(): number {
    return (
      this.pasoActual /
      this.pasos.length
    ) * 100;
  }


  get especialidadesFiltradas():
    EspecialidadReserva[] {

    const termino =
      this.busquedaEspecialidad
        .trim()
        .toLowerCase();

    if (!termino) {
      return this.especialidades;
    }

    return this.especialidades
      .filter(
        especialidad =>
          especialidad.nombre
            .toLowerCase()
            .includes(termino)
      );
  }


  get profesionalesFiltrados():
    ProfesionalReserva[] {

    if (!this.especialidadSeleccionada) {
      return [];
    }

    return this.profesionales
      .filter(
        profesional =>
          profesional.especialidadId ===
          this.especialidadSeleccionada!.id
      );
  }


  get sucursalesFiltradas():
    SucursalReserva[] {

    const ids =
      new Set(
        this.profesionalesFiltrados
          .flatMap(
            profesional =>
              profesional.sucursalIds
          )
      );

    return this.sucursales
      .filter(
        sucursal =>
          ids.has(sucursal.id)
      );
  }


  get profesionalesSucursalSeleccionada():
    ProfesionalReserva[] {

    if (!this.sucursalSeleccionada) {
      return [];
    }

    return this.profesionalesFiltrados
      .filter(
        profesional =>
          profesional.sucursalIds
            .includes(
              this.sucursalSeleccionada!.id
            )
      );
  }


  get turnosRapidos():
    TurnoRapidoReserva[] {

    // Temporal hasta conectar el endpoint de
    // disponibilidad real. Ya utiliza solamente
    // profesionales y sucursales reales.

    return this.profesionalesFiltrados
      .slice(0, 3)
      .map(profesional => {

        const sucursal =
          profesional.sucursales[0];

        if (!sucursal) {
          return null;
        }

        return {
          id:
            `${profesional.id}-${sucursal.id}`,
          profesional,
          sucursal,
          proximoTurno:
            profesional.proximoTurno
        };
      })
      .filter(
        (
          turno
        ):
          turno is TurnoRapidoReserva =>
            turno !== null
      );
  }


  get sucursalesProfesionalSeleccionado():
    SucursalReserva[] {

    if (!this.profesionalSeleccionado) {
      return [];
    }

    return this.profesionalSeleccionado
      .sucursales;
  }


  get puedeContinuarPaso4(): boolean {

    const seleccionCompleta =
      !!this.profesionalSeleccionado &&
      !!this.sucursalSeleccionada;

    if (!seleccionCompleta) {
      return false;
    }

    return this.coberturaResuelta;
  }


  // ==========================================
  // CALENDARIO - GENERAR
  // ==========================================

  generarCalendario(): void {

    this.diasCalendario = [];

    const primerDiaMes =
      new Date(
        this.anioActual,
        this.mesActual,
        1
      );

    const ultimoDiaMes =
      new Date(
        this.anioActual,
        this.mesActual + 1,
        0
      );

    const diaInicio =
      (
        primerDiaMes.getDay() +
        6
      ) % 7;

    const diasMesAnterior =
      new Date(
        this.anioActual,
        this.mesActual,
        0
      ).getDate();


    // MES ANTERIOR

    for (
      let i = diaInicio - 1;
      i >= 0;
      i--
    ) {

      const diaNumero =
        diasMesAnterior - i;

      const fecha =
        new Date(
          this.anioActual,
          this.mesActual - 1,
          diaNumero
        );

      this.diasCalendario.push(
        this.crearDiaCalendario(
          fecha,
          false
        )
      );
    }


    // MES ACTUAL

    for (
      let dia = 1;
      dia <= ultimoDiaMes.getDate();
      dia++
    ) {

      const fecha =
        new Date(
          this.anioActual,
          this.mesActual,
          dia
        );

      this.diasCalendario.push(
        this.crearDiaCalendario(
          fecha,
          true
        )
      );
    }


    // MES SIGUIENTE - COMPLETAR 42

    let siguienteDia = 1;

    while (
      this.diasCalendario.length < 42
    ) {

      const fecha =
        new Date(
          this.anioActual,
          this.mesActual + 1,
          siguienteDia
        );

      this.diasCalendario.push(
        this.crearDiaCalendario(
          fecha,
          false
        )
      );

      siguienteDia++;
    }
  }


private crearDiaCalendario(
  fecha: Date,
  perteneceMesActual: boolean
): DiaCalendarioReserva {

  const fechaKey =
    this.formatearFechaIso(
      fecha
    );


  // ========================================
  // DÍAS QUE APARECEN SOLO PARA COMPLETAR
  // EL CALENDARIO
  // ========================================

  if (
    !perteneceMesActual
  ) {

    return {

      fecha:
        fechaKey,

      diaNumero:
        fecha.getDate(),

      mesNumero:
        fecha.getMonth(),

      anio:
        fecha.getFullYear(),

      perteneceMesActual:
        false,

      disponible:
        false,

      cantidadTurnos:
        0,

      estado:
        'sin-atencion'

    };

  }


  // ========================================
  // DISPONIBILIDAD DEVUELTA POR BACKEND
  // ========================================

  const disponibilidad =
    this.disponibilidadPorFecha[
      fechaKey
    ];


  // Todavía no cargó la API
  // o no existe información.

  if (
    !disponibilidad
  ) {

    return {

      fecha:
        fechaKey,

      diaNumero:
        fecha.getDate(),

      mesNumero:
        fecha.getMonth(),

      anio:
        fecha.getFullYear(),

      perteneceMesActual:
        true,

      disponible:
        false,

      cantidadTurnos:
        0,

      estado:
        'sin-atencion'

    };

  }


  // ========================================
  // FUERA DEL RANGO PERMITIDO
  // ========================================

  if (
    disponibilidad
      .fueraDeRango
  ) {

    return {

      fecha:
        fechaKey,

      diaNumero:
        fecha.getDate(),

      mesNumero:
        fecha.getMonth(),

      anio:
        fecha.getFullYear(),

      perteneceMesActual:
        true,

      disponible:
        false,

      cantidadTurnos:
        0,

      estado:
        'sin-atencion'

    };

  }


  // ========================================
  // RESULTADO REAL
  // ========================================

  return {

    fecha:
      fechaKey,

    diaNumero:
      fecha.getDate(),

    mesNumero:
      fecha.getMonth(),

    anio:
      fecha.getFullYear(),

    perteneceMesActual:
      true,

    disponible:
      disponibilidad
        .cantidadTurnos > 0,

    cantidadTurnos:
      disponibilidad
        .cantidadTurnos,

    estado:
      disponibilidad
        .estado

  };

}

  seleccionarDiaCalendario(
    dia: DiaCalendarioReserva
  ): void {

    if (
      !dia.perteneceMesActual ||
      !dia.disponible
    ) {
      return;
    }

    this.fechaSeleccionada =
      dia.fecha;

    this.horaSeleccionada = '';
  }


  esDiaSeleccionado(
    dia: DiaCalendarioReserva
  ): boolean {
    return (
      this.fechaSeleccionada ===
      dia.fecha
    );
  }


  cambiarMes(
    delta: number
  ): void {

    this.mesActual += delta;

    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    }

    if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }

    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';

    this.cargarDisponibilidad();
  }


  obtenerTextoFechaSeleccionada(): string {

    if (!this.fechaSeleccionada) {
      return '';
    }

    const fecha =
      new Date(
        `${this.fechaSeleccionada}T00:00:00`
      );

    const texto =
      fecha.toLocaleDateString(
        'es-AR',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      );

    return (
      texto.charAt(0).toUpperCase() +
      texto.slice(1)
    );
  }


  private formatearFechaIso(
    fecha: Date
  ): string {

    const anio =
      fecha.getFullYear();

    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        fecha.getDate()
      ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }


  // ==========================================
  // NAVEGACIÓN
  // ==========================================

continuar(): void {

  // ========================================
  // PASO 1 - DATOS DEL PACIENTE
  // ========================================

  if (
    this.pasoActual === 1 &&
    !this.validarDatosPaciente()
  ) {

    return;

  }


  // ========================================
  // PASO 2 - ESPECIALIDAD
  // ========================================

  if (
    this.pasoActual === 2 &&
    !this.especialidadSeleccionada
  ) {

    this.mostrarError(
      'Elegí una especialidad para continuar.'
    );

    return;

  }


  // ========================================
  // PASO 4 - PROFESIONAL / SUCURSAL
  // ========================================

  if (
    this.pasoActual === 4 &&
    !this.puedeContinuarPaso4
  ) {

    this.mostrarError(
      'Completá la selección para continuar.'
    );

    return;

  }


  // ========================================
  // PASO 5 - FECHA Y HORA
  // ========================================

  if (
    this.pasoActual === 5 &&
    (
      !this.fechaSeleccionada ||
      !this.horaSeleccionada
    )
  ) {

    this.mostrarError(
      'Elegí una fecha y un horario.'
    );

    return;

  }


  // ========================================
  // AVANZAR
  // ========================================

  if (
    this.pasoActual <
    this.pasos.length
  ) {

    this.pasoActual++;


    // ======================================
    // AL ENTRAR AL PASO 5
    // CARGAMOS DISPONIBILIDAD REAL
    // ======================================

    if (
      this.pasoActual === 5
    ) {

      this.cargarDisponibilidad();

    }


    this.irArriba();

  }

}


  volver(): void {

    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.irArriba();
    }
  }


  irAPaso(
    numero: number
  ): void {

    if (
      numero >=
      this.pasoActual
    ) {
      return;
    }

    this.pasoActual = numero;
    this.irArriba();
  }


  // ==========================================
  // ESPECIALIDAD
  // ==========================================

  seleccionarEspecialidad(
    especialidad: EspecialidadReserva
  ): void {

    this.especialidadSeleccionada =
      especialidad;

    this.modoBusqueda = null;
    this.profesionalSeleccionado = null;
    this.sucursalSeleccionada = null;
    this.turnoRapidoSeleccionado = null;
    this.continuarComoParticular = false;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';

    this.cargarProfesionales();
  }


  // ==========================================
  // MODO DE BÚSQUEDA
  // ==========================================

  seleccionarModoBusqueda(
    modo: ModoBusqueda
  ): void {

    if (
      modo === 'profesional' &&
      !this.configuracionPublica
        .permitirElegirProfesional
    ) {
      return;
    }

    if (
      modo === 'sucursal' &&
      !this.configuracionPublica
        .permitirElegirSucursal
    ) {
      return;
    }

    this.modoBusqueda = modo;
    this.profesionalSeleccionado = null;
    this.sucursalSeleccionada = null;
    this.turnoRapidoSeleccionado = null;
    this.continuarComoParticular = false;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';

    this.pasoActual = 4;
    this.irArriba();
  }


  // ==========================================
  // PRIMER TURNO
  // ==========================================

  seleccionarTurnoRapido(
    turno: TurnoRapidoReserva
  ): void {

    this.turnoRapidoSeleccionado =
      turno.id;

    this.continuarComoParticular =
      false;

    this.profesionalSeleccionado =
      turno.profesional;

    this.sucursalSeleccionada =
      turno.sucursal;

    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
  }


  // ==========================================
  // PROFESIONAL
  // ==========================================

  seleccionarProfesional(
    profesional: ProfesionalReserva
  ): void {

    this.profesionalSeleccionado =
      profesional;

    this.continuarComoParticular =
      false;

    this.sucursalSeleccionada = null;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';

    const sucursales =
      profesional.sucursales;

    if (sucursales.length === 1) {
      this.sucursalSeleccionada =
        sucursales[0];
    }
  }


  seleccionarSucursalProfesional(
    sucursal: SucursalReserva
  ): void {

    this.sucursalSeleccionada =
      sucursal;

    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
  }


  // ==========================================
  // SUCURSAL
  // ==========================================

  seleccionarSucursal(
    sucursal: SucursalReserva
  ): void {

    this.sucursalSeleccionada =
      sucursal;

    this.profesionalSeleccionado = null;
    this.continuarComoParticular = false;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
  }


  seleccionarProfesionalSucursal(
    profesional: ProfesionalReserva
  ): void {

    this.profesionalSeleccionado =
      profesional;

    this.continuarComoParticular =
      false;

    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
  }


  nombresSucursalesProfesional(
    profesional: ProfesionalReserva
  ): string {

    return profesional.sucursales
      .map(
        sucursal =>
          sucursal.nombre
      )
      .join(' · ');
  }


  // ==========================================
  // COBERTURAS
  // ==========================================

  profesionalAceptaCobertura(
    profesional: ProfesionalReserva
  ): boolean {

    const cobertura =
      this.paciente.obraSocial
        ?.trim();

    if (
      !cobertura ||
      cobertura === 'Particular'
    ) {
      return true;
    }

    return profesional
      .obrasSociales
      .includes(cobertura);
  }


  get tieneCoberturaPaciente(): boolean {
    return !!(
      this.configuracionPublica
        .solicitarObraSocial &&
      this.paciente.obraSocial &&
      this.paciente.obraSocial !==
        'Particular'
    );
  }


  get coberturaResuelta(): boolean {

    if (!this.profesionalSeleccionado) {
      return false;
    }

    if (
      !this.configuracionPublica
        .solicitarObraSocial
    ) {
      return true;
    }

    if (
      this.profesionalAceptaCobertura(
        this.profesionalSeleccionado
      )
    ) {
      return true;
    }

    return this.continuarComoParticular;
  }


  aceptarAtencionParticular(): void {
    this.continuarComoParticular = true;
  }


  elegirOtroProfesional(): void {

    this.continuarComoParticular = false;
    this.profesionalSeleccionado = null;
    this.turnoRapidoSeleccionado = null;

    if (
      this.modoBusqueda === 'profesional' ||
      this.modoBusqueda === 'rapido'
    ) {
      this.sucursalSeleccionada = null;
    }
  }


confirmarTurno(): void {

  if (
    this.confirmandoTurno
  ) {

    return;

  }


  if (
    !this.profesionalSeleccionado
    ||
    !this.sucursalSeleccionada
    ||
    !this.fechaSeleccionada
    ||
    !this.horaSeleccionada
  ) {

    this.mostrarError(
      'Faltan datos para confirmar el turno.'
    );

    return;

  }


  const profesionalOrganizacionId =
    this.profesionalSeleccionado
      .profesionalOrganizacionId;


  const profesionalEspecialidadId =
    this.profesionalSeleccionado
      .profesionalEspecialidadId;


  if (
    !profesionalOrganizacionId
    ||
    !profesionalEspecialidadId
  ) {

    this.mostrarError(
      'No se pudo identificar la agenda del profesional.'
    );

    return;

  }


  this.confirmandoTurno =
    true;


  this.reservaPublicaService
    .crearTurno(
      this.slug,
      {

        profesionalOrganizacionId,

        profesionalEspecialidadId,

        sucursalId:
          this.sucursalSeleccionada.id,


        fecha:
          this.fechaSeleccionada,

        hora:
          this.horaSeleccionada,


        nombre:
          this.paciente.nombre.trim(),

        apellido:
          this.paciente.apellido.trim(),

        dni:
          this.paciente.dni.trim(),


        email:
          this.paciente.email?.trim()
          ||
          null,

        telefono:
          this.paciente.telefono?.trim()
          ||
          null,

        fechaNacimiento:
          this.paciente.fechaNacimiento
          ||
          null,


        obraSocialId:
          null,

        obraSocialNombre:
          this.paciente.obraSocial
          ||
          null,


        atencionParticular:
          this.continuarComoParticular
          ||
          this.paciente.obraSocial ===
            'Particular',


        motivoConsulta:
          null,

        observaciones:
          null

      }
    )
    .subscribe({

      next: respuesta => {

        this.reservaCreada =
          respuesta;


        this.reservaFinalizada =
          true;


        this.irArriba();

      },


      error: error => {

        console.error(
          'ERROR RESERVA:',
          error
        );


        const mensaje =
          error?.error?.message
          ??
          error?.error?.title
          ??
          'No pudimos reservar el turno. Intentá nuevamente.';


        Swal.fire({

          icon:
            'error',

          title:
            'No se pudo reservar',

          text:
            mensaje,

          confirmButtonColor:
            this.colorPrincipal

        });

      },


      complete: () => {

        this.confirmandoTurno =
          false;

      }

    });

}
// ==========================================
// DISPONIBILIDAD REAL
// ==========================================

private cargarDisponibilidad():
  void {

  // ========================================
  // VALIDAMOS LA SELECCIÓN
  // ========================================

  if (
    !this.slug
    ||
    !this.profesionalSeleccionado
    ||
    !this.sucursalSeleccionada
  ) {

    this.horariosPorFecha =
      {};

    this.disponibilidadPorFecha =
      {};

    this.generarCalendario();

    return;

  }


  const profesionalOrganizacionId =
    this.profesionalSeleccionado
      .profesionalOrganizacionId;


  const profesionalEspecialidadId =
    this.profesionalSeleccionado
      .profesionalEspecialidadId;


  const sucursalId =
    this.sucursalSeleccionada.id;


  if (
    !profesionalOrganizacionId
    ||
    !profesionalEspecialidadId
    ||
    !sucursalId
  ) {

    this.mostrarError(
      'No se pudo identificar correctamente la agenda seleccionada.'
    );

    return;

  }


  // ========================================
  // LIMPIAMOS SELECCIÓN ANTERIOR
  // ========================================

  this.fechaSeleccionada =
    '';

  this.horaSeleccionada =
    '';

  this.horariosPorFecha =
    {};

  this.disponibilidadPorFecha =
    {};


  this.cargandoDisponibilidad =
    true;


  // Mientras carga mostramos
  // el calendario vacío.

  this.generarCalendario();


  // Backend usa mes 1-12.
  // JavaScript usa 0-11.

  const mesBackend =
    this.mesActual + 1;


  this.reservaPublicaService
    .obtenerDisponibilidad(

      this.slug,

      profesionalOrganizacionId,

      profesionalEspecialidadId,

      sucursalId,

      this.anioActual,

      mesBackend

    )
    .subscribe({

      // ======================================
      // RESPUESTA CORRECTA
      // ======================================

      next: respuesta => {

        const horarios:
          Record<string, string[]> =
          {};


        const disponibilidad:
          Record<
            string,
            DisponibilidadDiaPublica
          > =
          {};


        for (
          const dia
          of respuesta.dias
        ) {

          disponibilidad[
            dia.fecha
          ] =
            dia;


          horarios[
            dia.fecha
          ] =
            dia.horarios;

        }


        this.horariosPorFecha =
          horarios;


        this.disponibilidadPorFecha =
          disponibilidad;


        this.generarCalendario();

      },


      // ======================================
      // ERROR
      // ======================================

      error: error => {

        // MUY IMPORTANTE:
        // complete NO se ejecuta
        // cuando entra por error.

        this.cargandoDisponibilidad =
          false;


        console.error(
          'ERROR DISPONIBILIDAD COMPLETO:',
          error
        );


        console.error(
          'STATUS:',
          error?.status
        );


        console.error(
          'BODY:',
          error?.error
        );


        console.error(
          'URL:',
          error?.url
        );


        this.horariosPorFecha =
          {};


        this.disponibilidadPorFecha =
          {};


        this.generarCalendario();


        const mensaje =
          error?.error?.message
          ??
          error?.error?.title
          ??
          (
            typeof error?.error ===
            'string'

              ? error.error

              : null
          )
          ??
          `No se pudo cargar la disponibilidad. Código: ${
            error?.status
            ??
            'desconocido'
          }`;


        Swal.fire({

          icon:
            'error',

          title:
            'No pudimos cargar los horarios',

          text:
            mensaje,

          confirmButtonColor:
            this.colorPrincipal

        });

      },


      // ======================================
      // TERMINÓ CORRECTAMENTE
      // ======================================

      complete: () => {

        this.cargandoDisponibilidad =
          false;

      }

    });

}
  // ==========================================
  // VALIDAR DATOS PACIENTE
  // ==========================================

  private validarDatosPaciente(): boolean {

    if (!this.paciente.nombre.trim()) {
      this.mostrarError(
        'Ingresá tu nombre.'
      );
      return false;
    }

    if (!this.paciente.apellido.trim()) {
      this.mostrarError(
        'Ingresá tu apellido.'
      );
      return false;
    }

    if (
      this.configuracionPublica.solicitarDni
    ) {

      const dni =
        this.paciente.dni
          .replace(/\D/g, '');

      if (
        dni.length < 7 ||
        dni.length > 9
      ) {
        this.mostrarError(
          'Ingresá un DNI válido.'
        );
        return false;
      }
    }

    if (
      this.configuracionPublica
        .solicitarTelefono
    ) {

      const telefono =
        this.paciente.telefono
          .replace(/\D/g, '');

      if (telefono.length !== 10) {
        this.mostrarError(
          'Ingresá código de área y número. Ejemplo: 223 5551234.'
        );
        return false;
      }
    }

    if (
      this.configuracionPublica
        .solicitarEmail &&
      this.paciente.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(this.paciente.email)
    ) {
      this.mostrarError(
        'Ingresá un correo electrónico válido.'
      );
      return false;
    }

    return true;
  }


  // ==========================================
  // FORMATEAR DNI
  // ==========================================

  formatearDni(): void {

    const numeros =
      this.paciente.dni
        .replace(/\D/g, '')
        .substring(0, 9);

    this.paciente.dni =
      numeros.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        '.'
      );
  }


  // ==========================================
  // HELPERS
  // ==========================================

  private irArriba(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  private mostrarError(
    mensaje: string
  ): void {

    Swal.fire({
      icon: 'warning',
      title: 'Revisá los datos',
      text: mensaje,
      confirmButtonColor:
        this.colorPrincipal
    });
  }
}
