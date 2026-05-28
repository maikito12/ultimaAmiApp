import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import Swal from 'sweetalert2';

import { FormularioService } from '../../services/formulario.service';
import { TurnosService } from '../../services/data.service';
import { FooterComponent } from "../../footer/footer.component";

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent], 
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent implements OnInit, AfterViewInit {

  profesionalId: string = '';
  profesional: any = null;
  sucursales: any[] = [];
  calendarInstance: any = null; // Instancia para controlar el calendario

  datosForm = {
    nombre: '', 
    dni: '',
    email: '',
    telefono: '',
    sucursal: '', 
    fecha: '' 
  };

  datosExtras: any = { 'OBRA SOCIAL': '', 'NRO AFILIADO': '' }; 
  configuracionCampos: any[] = []; 

  horariosDisponibles: any[] = [];
  turnoSeleccionado: any = null;
  feriados: string[] = [];

  constructor(
    private turnosService: TurnosService,
    private _formService: FormularioService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.profesionalId = slug;
        this.cargarConfiguracionProfesional(slug);
      }
    });
    this.cargarFeriados();
  }

  ngAfterViewInit() {
    setTimeout(() => this.iniciarCalendario());
  }

  cargarConfiguracionProfesional(slug: string) {
    const dataProfesionales: any = {
      'nutricion': {
        nombre: 'Nutricionista María',
        diasAtencion: [1, 2, 3, 4], // Lunes a Viernes
        sucursales: [
          { id: '1a1a3afc-b267-4865-8108-cf1fdae9d63c', nombre: 'Clínica Del Colon' },
          { id: '5a7ca1d1-7833-4f93-80d6-afe09c041427', nombre: 'Centro de Radiografia' }
        ],
        camposExtra: [
          { id: 'genero', label: 'Género', tipo: 'select', opciones: ['Masculino', 'Femenino', 'Otro'] },
          { id: 'motivo', label: 'Motivo de consulta', tipo: 'textarea' }
        ]
      }
    };

    const config = dataProfesionales[slug];
    if (config) {
      this.profesional = { 
        nombre: config.nombre, 
        diasAtencion: config.diasAtencion 
      };
      this.sucursales = config.sucursales || [];
      this.configuracionCampos = config.camposExtra || [];
      
      this.datosExtras = { 'OBRA SOCIAL': '', 'NRO AFILIADO': '' };
      this.configuracionCampos.forEach(campo => this.datosExtras[campo.id] = '');
      
      // Si el calendario ya existe, actualizamos sus opciones con los nuevos días
      if (this.calendarInstance) {
        this.calendarInstance.set('disable', [
          (date: Date) => this.esDiaNoLaboral(date)
        ]);
      }
    }
    this.cdr.detectChanges();
  }

  esDiaNoLaboral(date: Date): boolean {
    const f = date.toISOString().substring(0, 10);
    const esFeriado = this.feriados.includes(f);
    const diaSemana = date.getDay();
    // Bloquea si es feriado O si el día de la semana no está en la config del profesional
    return esFeriado || !this.profesional?.diasAtencion?.includes(diaSemana);
  }

  iniciarCalendario() {
    const input = document.getElementById('fechaPicker');
    if (!input) return;
    
    this.calendarInstance = flatpickr(input, {
      locale: Spanish,
      minDate: "today",
      dateFormat: "Y-m-d",
      disable: [(date: Date) => this.esDiaNoLaboral(date)],
      onChange: (selectedDates, dateStr) => {
        this.datosForm.fecha = dateStr;
        this.cargarTurnos();
      }
    });
  }

  cargarTurnos() {
    if (!this.datosForm.fecha || !this.datosForm.sucursal) return;

    this.horariosDisponibles = [
        { hora: '09:00', fecha: this.datosForm.fecha },
        { hora: '10:30', fecha: this.datosForm.fecha },
        { hora: '14:00', fecha: this.datosForm.fecha },
        { hora: '16:30', fecha: this.datosForm.fecha }
    ];
    this.cdr.detectChanges();
  }

  reservar(e: any) {
    e.preventDefault();

    // 1. Validamos que haya turno
    if (!this.turnoSeleccionado) { 
      this.mostrarError(); 
      return; 
    }

    const payload = {
      ...this.datosForm,
      profesional_nombre: this.profesional?.nombre,
      ...this.datosExtras,
      fecha_reserva: this.turnoSeleccionado.fecha,
      hora_reserva: this.turnoSeleccionado.hora
    };

    console.log("Datos que se enviarían:", payload);

    // 2. SIMULACIÓN: En lugar de llamar al servicio, forzamos el éxito
    // Comentamos la llamada real y usamos un observable "de mentira"
    
    /* this._formService.enviarNuevoPaciente(payload).subscribe({ ... }); 
    */

    // --- MODO PRUEBA: Forzamos la respuesta positiva ---
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: '¡Turno reservado (Modo Prueba)!',
        text: `Te esperamos el ${payload.fecha_reserva} a las ${payload.hora_reserva} hs.`,
        confirmButtonColor: '#9b67cc'
      });
      this.resetForm();
    }, 500); 
  }
  mostrarError() { Swal.fire('Error', 'Completá todos los campos', 'error'); }
  cargarFeriados() { this.turnosService.obtenerFeriados().subscribe(data => this.feriados = data.map((f: any) => f.date)); }
  resetForm() { 
      this.datosForm = { nombre: '', dni: '', email: '', telefono: '', sucursal: '', fecha: '' }; 
      this.datosExtras = { 'OBRA SOCIAL': '', 'NRO AFILIADO': '' };
      if(this.calendarInstance) this.calendarInstance.clear();
  }
}