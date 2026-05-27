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

  datosForm = {
    nombre: '', 
    dni: '',
    email: '',
    telefono: '',
    sucursal: '', 
    fecha: '' 
  };

  datosExtras: any = {}; 
  configuracionCampos: any[] = []; 

  horariosDisponibles: any[] = [];
  turnoSeleccionado: any = null;
  feriados: string[] = [];

  constructor(
    private turnosService: TurnosService,
    private _formService: FormularioService,
    private cdr: ChangeDetectorRef,
    private route:ActivatedRoute
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
        sucursales: [
          { id: '1a1a3afc-b267-4865-8108-cf1fdae9d63c', nombre: 'Clínica Del Colon' },
          { id: '5a7ca1d1-7833-4f93-80d6-afe09c041427', nombre: 'Centro de Radiografia' }
        ],
        camposExtra: [
          { id: 'genero', label: 'Género', tipo: 'select', opciones: ['Masculino', 'Femenino', 'Otro'] },
          { id: 'obraSocial', label: 'Obra Social / Prepaga', tipo: 'text' },
          { id: 'nacimiento', label: 'Fecha de Nacimiento', tipo: 'date' },
          { id: 'motivo', label: 'Motivo de consulta', tipo: 'textarea' },
          { id: 'origen', label: '¿Dónde nos encontraste?', tipo: 'select', opciones: ['Instagram', 'Recomendación', 'Otro'] }
        ]
      },
      'mecanico': {
        nombre: 'Taller Juan',
        sucursales: [{ id: '3', nombre: 'Sede Central' }],
        camposExtra: [
          { id: 'patente', label: 'Patente', tipo: 'text' },
          { id: 'modelo', label: 'Marca/Modelo', tipo: 'text' },
          { id: 'falla', label: 'Falla que presenta', tipo: 'textarea' }
        ]
      }
    };

    const config = dataProfesionales[slug];
    if (config) {
      this.profesional = { nombre: config.nombre };
      this.sucursales = config.sucursales || [];
      this.configuracionCampos = config.camposExtra || [];
      // Inicializamos los campos dinámicos
      this.configuracionCampos.forEach(campo => this.datosExtras[campo.id] = '');
    }
    this.cdr.detectChanges();
  }

  // --- CONECTADO CON N8N ---
 cargarTurnos() {
  if (!this.datosForm.fecha || !this.datosForm.sucursal) {
    this.horariosDisponibles = [];
    return;
  }

  const filtros = {
    profesional: this.profesionalId,
    fecha: this.datosForm.fecha,
    sucursal: this.datosForm.sucursal,
    dia_semana: new Date(this.datosForm.fecha + "T00:00:00").getDay()
  };

  console.log("Enviando filtros a n8n:", filtros);

  this._formService.getTurnosDisponibles(filtros).subscribe({
    next: (res: any) => {
      console.log("Respuesta Exitosa de n8n:", res);
      // Validamos si n8n manda los datos directo o dentro de una propiedad 'data'
      this.horariosDisponibles = Array.isArray(res) ? res : (res.data || []);
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Error crítico de conexión:", err);
      // Fallback para que no se vea vacío mientras testeas el diseño
      this.horariosDisponibles = [
        { hora: '08:00', fecha: this.datosForm.fecha },
        { hora: '09:30', fecha: this.datosForm.fecha }
      ];
      this.cdr.detectChanges();
    }
  });
}

  reservar(e: any) {
    e.preventDefault();
    
    if (!this.turnoSeleccionado) {
      this.mostrarError();
      return;
    }

    // Buscamos el nombre de la sucursal para que n8n lo use en notificaciones (WhatsApp/Email)
    const sucursalInfo = this.sucursales.find(s => s.id === this.datosForm.sucursal);

    // Payload final: "Aplanamos" los datos extras para que n8n los mapee fácil
    const payload = {
      profesional_id: this.profesionalId,
      profesional_nombre: this.profesional?.nombre,
      nombre_completo: this.datosForm.nombre,
      dni: this.datosForm.dni,
      email: this.datosForm.email,
      telefono: this.datosForm.telefono,
      sucursal_id: this.datosForm.sucursal, // El ID para la DB
      sucursal_nombre: sucursalInfo?.nombre || 'General', // El nombre para el humano
      fecha_reserva: this.turnoSeleccionado.fecha,
      hora_reserva: this.turnoSeleccionado.hora,
      ...this.datosExtras // Esto mete 'genero', 'patente', etc., directamente en el JSON
    };

    this._formService.enviarNuevoPaciente(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Turno reservado!',
          text: `Te esperamos el ${payload.fecha_reserva} a las ${payload.hora_reserva} hs.`,
          confirmButtonColor: '#9b67cc'
        });
        this.resetForm();
      },
      error: () => Swal.fire('Error', 'No pudimos procesar la reserva. Intentá más tarde.', 'error')
    });
  }

  mostrarError() {
    Swal.fire({
      icon: 'error',
      title: 'Faltan datos',
      text: 'Por favor, seleccioná una sucursal, fecha y horario.',
      confirmButtonColor: '#9b67cc'
    });
  }

  iniciarCalendario() {
    const input = document.getElementById('fechaPicker');
    if (!input) return;
    flatpickr(input, {
      locale: Spanish,
      minDate: "today",
      dateFormat: "Y-m-d",
      disable: [(date: Date) => {
        const f = date.toISOString().substring(0, 10);
        return this.feriados.includes(f) || date.getDay() === 0; // Ejemplo: domingos deshabilitados
      }],
      onChange: (selectedDates, dateStr) => {
        this.datosForm.fecha = dateStr;
        this.cargarTurnos();
      }
    });
  }

  cargarFeriados() {
    this.turnosService.obtenerFeriados().subscribe(data => this.feriados = data.map((f: any) => f.date));
  }

  resetForm() {
    this.datosForm = { nombre: '', dni: '', email: '', telefono: '', sucursal: '', fecha: '' };
    Object.keys(this.datosExtras).forEach(key => this.datosExtras[key] = '');
    this.horariosDisponibles = [];
    this.turnoSeleccionado = null;
    const picker = document.getElementById('fechaPicker') as HTMLInputElement;
    if (picker) picker.value = '';
  }
}