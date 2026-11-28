import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProfesionalService, ProfesionalEspecialidad, ProfesionalSucursal } from '../../services/profesional.service';
import {
  ProfesionalMotivosConsultaService,
  MotivoConsulta,
  CrearMotivoConsulta,
  ActualizarMotivoConsulta,
  HorarioDisponibleMotivo,
  FranjaMotivo,
  GuardarFranjaMotivo
} from '../../services/profesional-motivos-consulta.service';
import { AlertaService } from '../../services/alerta.service';
import { DialogoService } from '../../services/dialogo.service';

interface FranjaEditable {
  clave: number;
  horarioAtencionId: string;
  horaInicio: string;
  horaFin: string;
  exclusivo: boolean;
}

interface GrupoSucursal {
  id: string;
  nombre: string;
  horarios: HorarioDisponibleMotivo[];
}

@Component({
  selector: 'app-profesional-motivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profesional-motivos.component.html',
  styleUrl: './profesional-motivos.component.css'
})
export class ProfesionalMotivosComponent implements OnChanges {
  @Input() profesionalOrganizacionId: string | null = null;

  motivos: MotivoConsulta[] = [];
  especialidades: ProfesionalEspecialidad[] = [];
  sucursales: ProfesionalSucursal[] = [];
  cargando = false;
  erroresCarga: string[] = [];
  guardando = false;
  editando = false;
  idEditando: string | null = null;
  mostrandoInactivos = false;

  formulario = this.formularioVacio();

  // Configuración de disponibilidad por motivo (separada del CRUD existente).
  motivoConfigurando: MotivoConsulta | null = null;
  cargandoDisponibilidad = false;
  guardandoDisponibilidad = false;
  horariosDisponibles: HorarioDisponibleMotivo[] = [];
  franjasEditables: FranjaEditable[] = [];
  private siguienteClave = 1;
  private solicitudDisponibilidad = 0;
  private solicitudCarga = 0;

  readonly diasSemana: Record<number, string> = {
    1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
    5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
  };

  constructor(
    private motivosService: ProfesionalMotivosConsultaService,
    private profesionalService: ProfesionalService,
    private alertaService: AlertaService,
    private dialogoService: DialogoService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profesionalOrganizacionId']) {
      this.solicitudCarga++;
      this.erroresCarga = [];
      this.cargando = false;
      this.cancelar();
      this.cerrarDisponibilidad();
      this.motivos = [];
      this.especialidades = [];
      this.sucursales = [];
      if (this.profesionalOrganizacionId) void this.cargar();
    }
  }

  private formularioVacio() {
    return {
      profesionalEspecialidadId: '',
      nombre: '',
      duracionMinutos: null as number | null,
      precio: null as number | null,
      orden: 0,
      sucursalIds: [] as string[]
    };
  }

  get motivosVisibles(): MotivoConsulta[] {
    return this.motivos.filter(x => this.mostrandoInactivos || x.activo);
  }

  // Mantener referencias estables: no reconstruir los grupos en cada detección de cambios.
  sucursalesConHorarios: GrupoSucursal[] = [];

  private agruparHorariosPorSucursal(): void {
    const grupos = new Map<string, GrupoSucursal>();
    for (const horario of this.horariosDisponibles) {
      let grupo = grupos.get(horario.sucursalId);
      if (!grupo) {
        grupo = { id: horario.sucursalId, nombre: horario.sucursalNombre, horarios: [] };
        grupos.set(horario.sucursalId, grupo);
      }
      grupo.horarios.push(horario);
    }
    this.sucursalesConHorarios = Array.from(grupos.values()).map(grupo => ({
      ...grupo,
      horarios: [...grupo.horarios].sort((a, b) =>
        a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio))
    }));
  }

  trackSucursal(_index: number, sucursal: GrupoSucursal): string {
    return sucursal.id;
  }

  trackHorario(_index: number, horario: HorarioDisponibleMotivo): string {
    return horario.horarioAtencionId;
  }

  trackFranja(_index: number, franja: FranjaEditable): number {
    return franja.clave;
  }

  nombreEspecialidad(id: string): string {
    return this.especialidades.find(x => x.id === id)?.especialidad ?? 'Especialidad';
  }

  // Mostrar en cada motivo las sedes habilitadas, no solo los horarios específicos.
  nombresSucursales(motivo: MotivoConsulta): string {
    const ids = motivo.sucursalIds ?? [];
    if (!ids.length) return 'Sin sucursales asignadas';
    return ids.map(id => this.sucursales.find(s => s.sucursalId === id)?.sucursal ?? 'Sucursal no disponible').join(' · ');
  }

  estaSucursalSeleccionada(sucursalId: string): boolean {
    return this.formulario.sucursalIds.includes(sucursalId);
  }

  alternarSucursal(sucursalId: string, seleccionada: boolean): void {
    const ids = new Set(this.formulario.sucursalIds);
    if (seleccionada) ids.add(sucursalId);
    else ids.delete(sucursalId);
    this.formulario.sucursalIds = [...ids];
  }

  async cargar(): Promise<void> {
    const id = this.profesionalOrganizacionId;
    if (!id) return;
    const solicitud = ++this.solicitudCarga;
    this.cargando = true;
    this.erroresCarga = [];
    try {
      const [motivos, especialidades, sucursales] = await Promise.allSettled([
        firstValueFrom(this.motivosService.listar(id)),
        firstValueFrom(this.profesionalService.obtenerProfesionalEspecialidades(id)),
        firstValueFrom(this.profesionalService.obtenerProfesionalSucursales(id))
      ] as const);
      if (solicitud !== this.solicitudCarga || id !== this.profesionalOrganizacionId) return;

      this.motivos = motivos.status === 'fulfilled' ? motivos.value : [];
      this.especialidades = especialidades.status === 'fulfilled'
        ? especialidades.value.filter(x => x.activo) : [];
      this.sucursales = sucursales.status === 'fulfilled'
        ? sucursales.value.filter(x => x.activo) : [];

      const errores: string[] = [];
      const registrarError = (nombre: string, resultado: PromiseSettledResult<unknown>) => {
        if (resultado.status !== 'rejected') return;
        const error = resultado.reason;
        console.error(`[Motivos] Error al cargar ${nombre}`, error);
        const estado = error?.status ? ` (HTTP ${error.status})` : '';
        errores.push(`${nombre}${estado}: ${error?.error?.message ?? 'Intentá nuevamente.'}`);
      };
      registrarError('Motivos', motivos);
      registrarError('Especialidades', especialidades);
      registrarError('Sucursales', sucursales);
      this.erroresCarga = errores;
      if (errores.length) {
        this.alertaService.error('No pudimos completar la carga', errores.join(' · '));
      }
    } catch (error: any) {
      if (solicitud === this.solicitudCarga && id === this.profesionalOrganizacionId) {
        this.motivos = [];
        this.especialidades = [];
        this.sucursales = [];
        this.erroresCarga = ['No pudimos completar la carga. Intentá nuevamente.'];
        this.alertaService.error('No pudimos cargar los motivos',
          error?.error?.message ?? 'Intentá nuevamente.');
      }
    } finally {
      if (solicitud === this.solicitudCarga && id === this.profesionalOrganizacionId) {
        this.cargando = false;
      }
    }
  }

  nuevo(): void {
    this.cerrarDisponibilidad();
    this.idEditando = null;
    this.formulario = this.formularioVacio();
    this.formulario.profesionalEspecialidadId = this.especialidades[0]?.id ?? '';
    this.formulario.orden = this.motivos.length;
    this.editando = true;
  }

  editar(motivo: MotivoConsulta): void {
    this.cerrarDisponibilidad();
    this.idEditando = motivo.id;
    this.formulario = {
      profesionalEspecialidadId: motivo.profesionalEspecialidadId,
      nombre: motivo.nombre,
      duracionMinutos: motivo.duracionMinutos,
      precio: motivo.precio,
      orden: motivo.orden,
      sucursalIds: [...(motivo.sucursalIds ?? [])]
    };
    this.editando = true;
  }

  cancelar(): void {
    this.editando = false;
    this.idEditando = null;
    this.formulario = this.formularioVacio();
  }

  async guardar(): Promise<void> {
    if (this.guardando || !this.profesionalOrganizacionId) return;
    const nombre = this.formulario.nombre.trim();
    const duracion = this.formulario.duracionMinutos;
    const precio = this.formulario.precio;
    if (!nombre || nombre.length > 150 || !this.formulario.profesionalEspecialidadId) {
      this.alertaService.error('Datos incompletos', 'Ingresá un nombre y elegí una especialidad.');
      return;
    }
    if (this.formulario.sucursalIds.length === 0) {
      this.alertaService.error('Seleccioná una sucursal', 'Elegí al menos una sucursal donde ofrecés esta prestación.');
      return;
    }
    const disponibles = new Set(this.sucursales.map(x => x.sucursalId));
    if (this.formulario.sucursalIds.some(id => !disponibles.has(id))) {
      this.alertaService.error('Sucursales no disponibles', 'Hay sucursales que ya no están habilitadas. Actualizá la selección.');
      return;
    }
    if ((duracion !== null && (!Number.isInteger(duracion) || duracion <= 0)) ||
        (precio !== null && (!Number.isFinite(precio) || precio < 0))) {
      this.alertaService.error('Valores inválidos', 'Revisá la duración y el precio.');
      return;
    }

    const datos: ActualizarMotivoConsulta = {
      profesionalEspecialidadId: this.formulario.profesionalEspecialidadId,
      nombre,
      duracionMinutos: duracion,
      precio,
      orden: this.formulario.orden,
      sucursalIds: [...this.formulario.sucursalIds]
    };

    this.guardando = true;
    try {
      if (this.idEditando) {
        await firstValueFrom(this.motivosService.actualizar(this.idEditando, datos));
      } else {
        const crear: CrearMotivoConsulta = {
          ...datos,
          profesionalOrganizacionId: this.profesionalOrganizacionId
        };
        await firstValueFrom(this.motivosService.crear(crear));
      }
      this.alertaService.success('Motivo guardado', 'Los cambios se guardaron correctamente.');
      this.cancelar();
      await this.cargar();
    } catch (error: any) {
      this.alertaService.error('No pudimos guardar el motivo',
        error?.error?.message ?? 'Intentá nuevamente.');
    } finally {
      this.guardando = false;
    }
  }

  async cambiarEstado(motivo: MotivoConsulta): Promise<void> {
    if (this.guardando) return;
    this.guardando = true;
    try {
      await firstValueFrom(this.motivosService.cambiarEstado(motivo.id, !motivo.activo));
      await this.cargar();
      this.alertaService.success(motivo.activo ? 'Motivo desactivado' : 'Motivo activado');
    } catch (error: any) {
      this.alertaService.error('No pudimos actualizar el estado',
        error?.error?.message ?? 'Intentá nuevamente.');
    } finally {
      this.guardando = false;
    }
  }

  async eliminar(motivo: MotivoConsulta): Promise<void> {
    if (this.guardando) return;
    const confirmar = await this.dialogoService.confirmar({
      titulo: 'Eliminar motivo de consulta',
      mensaje: `¿Querés eliminar «${motivo.nombre}»? Se desactivará para nuevas reservas, sin borrar el historial.`,
      textoConfirmar: 'Eliminar motivo',
      textoCancelar: 'Cancelar',
      variante: 'danger'
    });
    if (!confirmar) return;
    this.guardando = true;
    try {
      await firstValueFrom(this.motivosService.eliminar(motivo.id));
      await this.cargar();
      this.alertaService.success('Motivo eliminado', 'Ya no se mostrará entre los motivos activos.');
    } catch (error: any) {
      this.alertaService.error('No pudimos eliminar el motivo',
        error?.error?.message ?? 'Intentá nuevamente.');
    } finally {
      this.guardando = false;
    }
  }

  // =====================================================
  // DISPONIBILIDAD POR MOTIVO Y SUCURSAL
  // =====================================================

  async abrirDisponibilidad(motivo: MotivoConsulta): Promise<void> {
    if (!motivo.activo || this.guardandoDisponibilidad || this.guardando) return;
    this.cancelar();
    const solicitud = ++this.solicitudDisponibilidad;
    const contextoId = this.profesionalOrganizacionId;
    this.motivoConfigurando = motivo;
    this.cargandoDisponibilidad = true;
    this.horariosDisponibles = [];
    this.sucursalesConHorarios = [];
    this.franjasEditables = [];

    try {
      const [horarios, franjas] = await Promise.all([
        firstValueFrom(this.motivosService.obtenerHorariosDisponibles(motivo.id)),
        firstValueFrom(this.motivosService.obtenerFranjas(motivo.id))
      ]);
      if (solicitud !== this.solicitudDisponibilidad ||
          contextoId !== this.profesionalOrganizacionId) return;

      this.horariosDisponibles = horarios;
      this.agruparHorariosPorSucursal();
      this.franjasEditables = franjas.map((f: FranjaMotivo) => ({
        clave: this.siguienteClave++,
        horarioAtencionId: f.horarioAtencionId,
        horaInicio: this.aHoraCorta(f.horaInicio),
        horaFin: this.aHoraCorta(f.horaFin),
        exclusivo: f.exclusivo
      }));

      if (franjas.some(f => !horarios.some(h => h.horarioAtencionId === f.horarioAtencionId))) {
        this.alertaService.error('Hay franjas desactualizadas',
          'Cambió algún horario habitual. Revisá la configuración antes de guardarla.');
      }
    } catch (error: any) {
      if (solicitud === this.solicitudDisponibilidad) {
        this.alertaService.error('No pudimos cargar la disponibilidad',
          error?.error?.message ?? 'Revisá que los nuevos endpoints estén disponibles.');
        this.cerrarDisponibilidad();
      }
    } finally {
      if (solicitud === this.solicitudDisponibilidad) this.cargandoDisponibilidad = false;
    }
  }

  cerrarDisponibilidad(): void {
    this.solicitudDisponibilidad++;
    this.motivoConfigurando = null;
    this.cargandoDisponibilidad = false;
    this.horariosDisponibles = [];
    this.sucursalesConHorarios = [];
    this.franjasEditables = [];
  }

  franjasDelHorario(horarioId: string): FranjaEditable[] {
    return this.franjasEditables.filter(x => x.horarioAtencionId === horarioId);
  }

  agregarFranja(horario: HorarioDisponibleMotivo): void {
    const actuales = this.franjasDelHorario(horario.horarioAtencionId);
    // Por defecto propone toda la jornada o el tramo posterior a la última franja.
    const ultimaHoraFin = actuales.reduce((max, f) =>
      f.horaFin > max ? f.horaFin : max, this.aHoraCorta(horario.horaInicio));
    const inicio = ultimaHoraFin < this.aHoraCorta(horario.horaFin)
      ? ultimaHoraFin : this.aHoraCorta(horario.horaInicio);
    this.franjasEditables.push({
      clave: this.siguienteClave++,
      horarioAtencionId: horario.horarioAtencionId,
      horaInicio: inicio,
      horaFin: this.aHoraCorta(horario.horaFin),
      exclusivo: false
    });
  }

  quitarFranja(clave: number): void {
    this.franjasEditables = this.franjasEditables.filter(x => x.clave !== clave);
  }

  usarHorarioCompleto(horario: HorarioDisponibleMotivo): void {
    this.franjasEditables = this.franjasEditables.filter(
      x => x.horarioAtencionId !== horario.horarioAtencionId);
    this.agregarFranja(horario);
  }

  private aHoraCorta(valor: string): string {
    return valor?.substring(0, 5) ?? '';
  }

  private minutos(valor: string): number {
    if (!/^\d{2}:\d{2}$/.test(valor)) return -1;
    const [h, m] = valor.split(':').map(Number);
    if (h > 23 || m > 59) return -1;
    return h * 60 + m;
  }

  private validarFranjas(): string | null {
    const horarios = new Map(this.horariosDisponibles.map(h => [h.horarioAtencionId, h]));
    for (const franja of this.franjasEditables) {
      const horario = horarios.get(franja.horarioAtencionId);
      if (!horario) return 'Hay franjas vinculadas a horarios que ya no están disponibles.';
      const inicio = this.minutos(franja.horaInicio);
      const fin = this.minutos(franja.horaFin);
      if (inicio < 0 || fin < 0 || inicio >= fin)
        return 'Revisá las horas de inicio y fin de las franjas.';
      if (inicio < this.minutos(this.aHoraCorta(horario.horaInicio)) ||
          fin > this.minutos(this.aHoraCorta(horario.horaFin)))
        return `Una franja de ${horario.sucursalNombre} está fuera del horario habitual.`;
    }
    for (let i = 0; i < this.franjasEditables.length; i++) {
      for (let j = i + 1; j < this.franjasEditables.length; j++) {
        const a = this.franjasEditables[i];
        const b = this.franjasEditables[j];
        if (a.horarioAtencionId === b.horarioAtencionId &&
            this.minutos(a.horaInicio) < this.minutos(b.horaFin) &&
            this.minutos(a.horaFin) > this.minutos(b.horaInicio)) {
          return 'Hay franjas superpuestas dentro de un mismo día y sucursal.';
        }
      }
    }
    return null;
  }

  async guardarDisponibilidad(): Promise<void> {
    const motivo = this.motivoConfigurando;
    if (!motivo || this.guardandoDisponibilidad || this.cargandoDisponibilidad) return;

    const error = this.validarFranjas();
    if (error) {
      this.alertaService.error('Horarios inválidos', error);
      return;
    }

    const dto: { franjas: GuardarFranjaMotivo[] } = {
      franjas: this.franjasEditables.map(f => ({
        horarioAtencionId: f.horarioAtencionId,
        horaInicio: `${f.horaInicio}:00`,
        horaFin: `${f.horaFin}:00`,
        exclusivo: f.exclusivo
      }))
    };

    this.guardandoDisponibilidad = true;
    try {
      await firstValueFrom(this.motivosService.guardarFranjas(motivo.id, dto));
      this.alertaService.success('Disponibilidad guardada',
        dto.franjas.length
          ? 'Las franjas se guardaron correctamente.'
          : 'Se eliminaron las restricciones. El motivo usará los horarios habituales.');
      this.cerrarDisponibilidad();
    } catch (error: any) {
      this.alertaService.error('No pudimos guardar la disponibilidad',
        error?.error?.message ?? 'Verificá los horarios y volvé a intentar.');
    } finally {
      this.guardandoDisponibilidad = false;
    }
  }
}
