import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turno-service.service';

const style = document.createElement('style');
style.innerHTML = `
  .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; }
  .swal-field { display: flex; flex-direction: column; }
  .swal-field .label { font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
  .swal-custom-input { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; width: 100%; box-sizing: border-box; }
`;
document.head.appendChild(style);
@Component({
  selector: 'app-pacientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-tabla.component.html',
  styleUrls: ['./clientes-tabla.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class PacientesListaComponent implements OnInit {

  pacienteSeleccionado: any = null; 
  tabActiva: string = 'perfil';    
  esEdicionInterna: boolean = false; 
  
  sedes: string[] = ['Clínica Del Niño', 'Clínica 25 De Mayo'];
  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  filtroTexto: string = ''; 
  filtroSede: string = '';  

  constructor(
    private turnosService: TurnosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.cargarPacientes(); 
  }

  cargarPacientes() {
    this.turnosService.obtenerPacientes().subscribe({
      next: (data) => {
        this.pacientes = data.map(p => ({
          ...p,
          historial: p.historial || [],
          estudios: p.estudios || [],
          camposExtras: p.camposExtras || []
        }));
        this.aplicarFiltros();
      },
      error: (err) => {
        console.warn('⚠️ API no disponible. Cargando datos de prueba locales:', err);
        
        const pacientesPrueba = [
          {
            id: 1,
            nombre: 'Carlos Sebastián Pérez',
            dni: '34899211',
            email: 'carlosperez@gmail.com',
            telefono: '2235467812',
            genero: 'Masculino',
            fechaNac: '1989-05-14',
            sucursal: 'Clínica Del Niño',
            metaActual: 'Bajar porcentaje de grasa corporal al 14% y controlar picos de ansiedad vespertina.',
            camposExtras: [
              { label: 'OBRA SOCIAL', valor: 'OSDE 310' },
              { label: 'MEDICACIÓN', valor: 'Metformina 500mg (Cena)' }
            ],
            historial: [
              { fecha: '20/05/2026', sucursal: 'Clínica Del Niño', nota: 'El paciente logró bajar 1.5kg de masa grasa. Reporta mejor adherencia al plan de alimentación. Se ajustan carbohidratos en la merienda.' },
              { fecha: '22/04/2026', sucursal: 'Clínica Del Niño', nota: 'Primera consulta. Se realiza antropometría inicial. Presenta resistencia a la insulina leve. Se indica plan bajo en azúcares refinados.' }
            ],
            estudios: [
              { fecha: '18/04/2026', nombre: 'Laboratorio de Sangre Completo', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80' }
            ]
          },
          {
            id: 2,
            nombre: 'María Laura Fernández',
            dni: '28455632',
            email: 'marialaura_f@hotmail.com',
            telefono: '2236894521',
            genero: 'Indefinido',
            fechaNac: '1981-11-02',
            sucursal: 'Clínica 25 De Mayo',
            metaActual: 'Aumento de masa muscular y readaptación alimentaria por colon irritable.',
            camposExtras: [
              { label: 'OBRA SOCIAL', valor: 'Particular' },
              { label: 'INTOLERANCIAS', valor: 'Lactosa y Harinas de trigo en exceso' }
            ],
            historial: [
              { fecha: '10/05/2026', sucursal: 'Clínica 25 De Mayo', nota: 'Refiere disminución notable de la distensión abdominal. Se incorpora suplementación con Creatina 3g diarios.' }
            ],
            estudios: []
          }
        ];

        this.pacientes = pacientesPrueba.map(p => ({
          ...p,
          historial: p.historial || [],
          estudios: p.estudios || [],
          camposExtras: p.camposExtras || []
        }));
        this.aplicarFiltros();
      }
    });
  }

  aplicarFiltros() {
    this.pacientesFiltrados = this.pacientes.filter(p => {
      const search = this.filtroTexto?.toLowerCase().trim() || '';
      const coincideTexto = !search || 
                            p.nombre?.toLowerCase().includes(search) || 
                            p.dni?.toString().includes(search);
      
      const coincideSede = !this.filtroSede || p.sucursal === this.filtroSede;
      return coincideTexto && coincideSede;
    });
    this.cdr.detectChanges();
  }

  limpiarFiltros() { 
    this.filtroTexto = ''; 
    this.filtroSede = ''; 
    this.aplicarFiltros(); 
  }

  getExtra(paciente: any, label: string): string {
    if (!paciente || !paciente.camposExtras) return '';
    const campo = paciente.camposExtras.find(
      (ex: any) => ex.label.toUpperCase() === label.toUpperCase()
    );
    return campo ? campo.valor : '';
  }

  actualizarDatoExtra(paciente: any, label: string, valor: string) {
    if (!paciente.camposExtras) paciente.camposExtras = [];
    const index = paciente.camposExtras.findIndex(
      (ex: any) => ex.label.toUpperCase() === label.toUpperCase()
    );

    if (index !== -1) {
      paciente.camposExtras[index].valor = valor || 'Particular';
    } else {
      paciente.camposExtras.push({ label: label.toUpperCase(), valor: valor || 'Particular' });
    }
  }

  async abrirFichaMaestra(p: any) {
    this.pacienteSeleccionado = p;
    const contenidoModal = document.getElementById('fichaMaestraContent');
    
    await Swal.fire({
      title: '', 
      html: contenidoModal?.innerHTML || 'Cargando...', 
      width: '1000px',
      padding: '0',
      showConfirmButton: false,
      showCloseButton: true,
      background: '#ffffff',
      didOpen: () => {
        this.inyectarDatosEnModal(p);
        this.asignarEventosModal(p);
      }
    });
  }

  inyectarDatosEnModal(p: any) {
    const container = Swal.getHtmlContainer();
    if (!container) return;

    container.querySelector('#modal-txt-nombre')!.textContent = p.nombre || '';
    container.querySelector('#modal-txt-dni')!.textContent = p.dni || '---';
    container.querySelector('#modal-txt-email')!.textContent = p.email || '---';
    container.querySelector('#modal-txt-telefono')!.textContent = p.telefono || '---';
    
    // Aplicar color gris si el género es Indefinido
    const elGenero = container.querySelector('#modal-txt-genero') as HTMLElement;
    if (elGenero) {
      elGenero.textContent = p.genero || '---';
      if (p.genero === 'Indefinido') {
        elGenero.style.color = '#94a3b8'; // Color Gris Slated
        elGenero.style.fontWeight = '500';
      } else {
        elGenero.style.color = ''; // Resetear al color por defecto del CSS
      }
    }

    container.querySelector('#modal-txt-nacimiento')!.textContent = p.fechaNac || '---';
    container.querySelector('#modal-txt-meta')!.textContent = p.metaActual || 'Sin meta definida';

    const containerExtras = container.querySelector('#modal-lista-extras');
    if (containerExtras) {
      containerExtras.innerHTML = p.camposExtras.map((ex: any, index: number) => `
        <div class="extra-row-styled">
          <div>
            <span class="extra-label-tag">${ex.label}</span>
            <span class="extra-value-text">${ex.valor}</span>
          </div>
          <button class="btn-delete-extra" data-index="${index}">×</button>
        </div>
      `).join('');
    }

    // Se agrandaron levemente las dimensiones y el espaciado de las cards en el timeline
    const containerTimeline = container.querySelector('#modal-timeline');
    if (containerTimeline) {
      containerTimeline.innerHTML = p.historial.map((h: any, index: number) => `
        <div class="timeline-card" style="padding: 16px; margin-bottom: 14px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
          <div class="timeline-header" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span class="timeline-date" style="font-weight: 600;">📅 ${h.fecha} - ${h.sucursal || 'Consultorio'}</span>
            <button class="btn-delete-nota" data-index="${index}" style="background:none; border:none; cursor:pointer;">🗑️</button>
          </div>
          <p style="margin:0; font-size:0.95rem; color:#334155; line-height: 1.5;">${h.nota}</p>
        </div>
      `).join('');
    }

    const containerEstudios = container.querySelector('#modal-lista-estudios');
    if (containerEstudios) {
      if (!p.estudios || p.estudios.length === 0) {
        containerEstudios.innerHTML = `<p style="color:#64748b; font-size:0.9rem;">No hay estudios cargados aún.</p>`;
      } else {
        containerEstudios.innerHTML = p.estudios.map((est: any) => `
          <div class="extra-row-styled">
            <div>
              <span class="extra-label-tag">${est.fecha}</span>
              <span class="extra-value-text">📄 ${est.nombre}</span>
            </div>
            <button class="btn-edit-main btn-ver-estudio" data-url="${est.url}" style="padding: 4px 10px; font-size:0.75rem;">Ver</button>
          </div>
        `).join('');
      }
    }
  }

  asignarEventosModal(p: any) {
    const modalContainer = Swal.getHtmlContainer();
    if (!modalContainer) return;
      
    const self = this;
    const navItems = modalContainer.querySelectorAll('.nav-item');
    const tabContents = modalContainer.querySelectorAll('.tab-content');

    navItems.forEach(b => {
      if (b.getAttribute('data-tab') === self.tabActiva) b.classList.add('active');
      else b.classList.remove('active');
    });
    tabContents.forEach(c => {
      if (c.id === `tab-${self.tabActiva}`) c.classList.add('active');
      else c.classList.remove('active');
    });

    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab') || 'perfil';
        self.tabActiva = targetTab;
        navItems.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        btn.classList.add('active');
        modalContainer.querySelector(`#tab-${targetTab}`)?.classList.add('active');
      });
    });

    modalContainer.querySelector('#btn-editar-perfil-click')?.addEventListener('click', () => {
      self.esEdicionInterna = true;
      self.abrirFormulario(p);
    });

    modalContainer.querySelector('#btn-nuevo-extra-click')?.addEventListener('click', () => {
      self.agregarCampoExtra(p);
    });

    modalContainer.querySelector('#btn-borrar-paciente-click')?.addEventListener('click', () => {
      self.esEdicionInterna = true;
      self.borrarPaciente(p);
    });

    modalContainer.querySelector('#btn-subir-estudio-click')?.addEventListener('click', () => {
      self.subirNuevoEstudio(p);
    });

    modalContainer.querySelectorAll('.btn-ver-estudio').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        const urlString = e.target.getAttribute('data-url');
        self.verImagenFull(urlString, p);
      });
    });

    modalContainer.querySelectorAll('.btn-delete-extra').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        p.camposExtras.splice(idx, 1);
        self.sincronizarCambiosPaciente(p);
      });
    });

    modalContainer.querySelectorAll('.btn-delete-nota').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        p.historial.splice(idx, 1);
        self.sincronizarCambiosPaciente(p);
      });
    });

    modalContainer.querySelector('#btn-guardar-nota-click')?.addEventListener('click', () => {
      const notaInput = modalContainer.querySelector('#new-nota-input') as HTMLTextAreaElement;
      const nota = notaInput?.value;
      
      if (nota && nota.trim()) {
        const nuevaNota = { 
          fecha: new Date().toLocaleDateString('es-AR'), 
          nota: nota.trim(), 
          sucursal: p.sucursal 
        };
        
        self.turnosService.agregarNotaHistorial(p.id, nuevaNota).subscribe({
          next: () => {
            p.historial.unshift(nuevaNota);
            notaInput.value = '';
            self.inyectarDatosEnModal(p);
            self.asignarEventosModal(p);
          },
          error: () => {
            console.warn('⚠️ Guardando nota en modo offline/desarrollo');
            p.historial.unshift(nuevaNota);
            notaInput.value = '';
            self.inyectarDatosEnModal(p);
            self.asignarEventosModal(p);
          }
        });
      }
    });

    modalContainer.querySelector('#btn-editar-meta-click')?.addEventListener('click', async () => {
      const { value: nuevaMeta } = await Swal.fire({
        title: 'Modificar Meta Actual',
        confirmButtonColor: '#8a2be2',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        html: `
          <div style="display: flex; flex-direction: column; text-align: left; padding: 10px 5px;">
            <textarea id="sw-meta-input" style="height:120px; padding:10px; border: 1px solid #cbd5e1; border-radius:6px; resize:none; font-family:inherit; font-size:0.9rem; width:100%; box-sizing:border-box;">${p.metaActual || ''}</textarea>
          </div>
        `,
        preConfirm: () => {
          return (document.getElementById('sw-meta-input') as HTMLTextAreaElement).value;
        }
      });

      // Al salir del modal secundario, reabrimos obligatoriamente la ficha maestra
      if (nuevaMeta !== undefined) {
        p.metaActual = nuevaMeta.trim() || 'Sin meta definida';
        self.sincronizarCambiosPaciente(p);
      } else {
        self.abrirFichaMaestra(p);
      }
    });
  }

  sincronizarCambiosPaciente(p: any) {
    this.turnosService.guardarPaciente(p).subscribe({
      next: () => {
        this.aplicarFiltros();
        this.abrirFichaMaestra(p);
      },
      error: () => {
        console.warn('⚠️ API offline. Sincronizando cambios de forma local.');
        const index = this.pacientes.findIndex(pac => pac.id === p.id);
        if (index !== -1) this.pacientes[index] = { ...p };
        this.aplicarFiltros();
        this.abrirFichaMaestra(p);
      }
    });
  }

  crearNuevo() {
    this.esEdicionInterna = false;
    this.abrirFormulario(null, true);
  }

 async abrirFormulario(paciente: any = null, esNuevo: boolean = false) {
  const opcionesSedesHtml = this.sedes.map(sede => `
    <option value="${sede}" ${paciente?.sucursal === sede ? 'selected' : ''}>${sede}</option>
  `).join('');

  const { value: formValues, isDismissed } = await Swal.fire({
    title: esNuevo ? '🚀 Nuevo Registro' : '✏️ Editar Datos Principales',
    width: '700px',

    html: `
      <div class="modal-form-grid">
        <div class="swal-field"><span class="label">Nombre</span><input id="sw-nombre" class="swal-custom-input" value="${paciente?.nombre || ''}"></div>
        <div class="swal-field"><span class="label">DNI</span><input id="sw-dni" class="swal-custom-input" value="${paciente?.dni || ''}"></div>
        <div class="swal-field"><span class="label">Fecha Nac.</span><input id="sw-fecha" type="date" class="swal-custom-input" value="${paciente?.fechaNac || ''}"></div>
        <div class="swal-field"><span class="label">Género</span>
          <select id="sw-genero" class="swal-custom-input">
            <option value="Masculino" ${paciente?.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
            <option value="Femenino" ${paciente?.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
            <option value="Indefinido" ${paciente?.genero === 'Indefinido' ? 'selected' : ''}>Indefinido</option>
          </select>
        </div>
        <div class="swal-field col-span-2"><span class="label">Sucursal</span><select id="sw-sede" class="swal-custom-input">${opcionesSedesHtml}</select></div>
        <div class="swal-field"><span class="label">Obra Social</span><input id="sw-os" class="swal-custom-input" value="${this.getExtra(paciente, 'OBRA SOCIAL') || 'Particular'}"></div>
        <div class="swal-field"><span class="label">Teléfono</span><input id="sw-tel" class="swal-custom-input" value="${paciente?.telefono || ''}"></div>
        <div class="swal-field"><span class="label">Email</span><input id="sw-mail" class="swal-custom-input" value="${paciente?.email || ''}"></div>
      </div>
    `,
    preConfirm: () => {
      const nombre = (document.getElementById('sw-nombre') as HTMLInputElement).value;
      if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
      return {
        nombre,
        dni: (document.getElementById('sw-dni') as HTMLInputElement).value,
        fechaNac: (document.getElementById('sw-fecha') as HTMLInputElement).value,
        genero: (document.getElementById('sw-genero') as HTMLSelectElement).value,
        sucursal: (document.getElementById('sw-sede') as HTMLSelectElement).value,
        telefono: (document.getElementById('sw-tel') as HTMLInputElement).value,
        email: (document.getElementById('sw-mail') as HTMLInputElement).value,
        obraSocial: (document.getElementById('sw-os') as HTMLInputElement).value
      };
    }
  });

  // 1. Si el usuario cancela, salimos
  if (isDismissed) return;

  // 2. Si hay valores, procesamos
  if (formValues) {
    const { obraSocial, ...fijos } = formValues;
    const objetoFinal = esNuevo 
      ? { ...fijos, id: Date.now(), metaActual: 'Sin meta definida', camposExtras: [], historial: [], estudios: [] } 
      : Object.assign(paciente, fijos);

    this.actualizarDatoExtra(objetoFinal, 'OBRA SOCIAL', obraSocial);
    
    // 3. Guardamos
    this.turnosService.guardarPaciente(objetoFinal).subscribe({
      next: () => {
        // Alerta de éxito (esto es lo que no veías)
        Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Paciente guardado correctamente', timer: 1500, showConfirmButton: false });
        
        // Recargamos lista y refrescamos vista
        this.cargarPacientes();
      },
      error: () => {
        Swal.fire('Error', 'Hubo un problema al guardar', 'error');
      }
    });
  }
}


  async agregarCampoExtra(p: any) {
    const self = this;
    const { value: nuevo } = await Swal.fire({
      title: 'Nuevo Campo Extra',
      confirmButtonColor: '#8a2be2',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      html: `
        <div style="display: flex; flex-direction: column; text-align: left; padding: 5px; font-family: inherit;">
          <div style="margin-bottom: 12px;">
            <label style="display:block; font-weight:600; font-size:0.85rem; color:#475569; margin-bottom:4px;">Etiqueta</label>
            <input id="ex-l" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;" placeholder="Ej: MEDICACIÓN o INTOLERANCIAS">
          </div>
          <div>
            <label style="display:block; font-weight:600; font-size:0.85rem; color:#475569; margin-bottom:4px;">Valor informativo</label>
            <input id="ex-v" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;" placeholder="Ej: Metformina 500mg">
          </div>
        </div>
      `,
      preConfirm: () => ({ 
        label: (document.getElementById('ex-l') as HTMLInputElement).value.toUpperCase(), 
        valor: (document.getElementById('ex-v') as HTMLInputElement).value 
      })
    });

    if (!nuevo || !nuevo.label || !nuevo.valor) {
      self.abrirFichaMaestra(p);
      return;
    }

    p.camposExtras.push(nuevo);
    self.tabActiva = 'extras'; 
    self.sincronizarCambiosPaciente(p);
  }

  async borrarPaciente(p: any) {
    const self = this;
    const confirm = await Swal.fire({ 
      title: '¿Eliminar Paciente?', 
      text: `Se borrará a ${p.nombre} permanentemente del sistema.`, 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      reverseButtons: true
    });

    if (confirm.isConfirmed) { 
      self.turnosService.eliminarPaciente(p.id).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Eliminado con éxito', showConfirmButton: false, timer: 1500 });
          self.cargarPacientes();
          self.pacienteSeleccionado = null;
        },
        error: () => {
          self.pacientes = self.pacientes.filter(pac => pac.id !== p.id);
          self.aplicarFiltros();
          self.pacienteSeleccionado = null;
          Swal.fire({ icon: 'success', title: 'Eliminado de forma local', showConfirmButton: false, timer: 1500 });
        }
      });
    } else {
      if (self.esEdicionInterna) self.abrirFichaMaestra(p);
    }
  }

  async subirNuevoEstudio(p: any) {
    const self = this;
    const { value: formEstudio } = await Swal.fire({
      title: '📁 Adjuntar Estudio Médico',
      confirmButtonColor: '#8a2be2',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      html: `
        <div style="display: flex; flex-direction: column; text-align: left; padding: 5px; font-family: inherit;">
          <div style="margin-bottom: 12px;">
            <label style="display:block; font-weight:600; font-size:0.85rem; color:#475569; margin-bottom:4px;">Nombre del Estudio</label>
            <input id="est-name" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;" placeholder="Ej: Laboratorio / Ecografía">
          </div>
          <div>
            <label style="display:block; font-weight:600; font-size:0.85rem; color:#475569; margin-bottom:4px;">Seleccionar Imagen/Archivo</label>
            <input id="est-file" type="file" accept="image/*,application/pdf" style="width:100%; padding:8px 0; font-size:0.9rem; box-sizing:border-box;">
          </div>
        </div>
      `,
      preConfirm: () => {
        const nombre = (document.getElementById('est-name') as HTMLInputElement).value;
        const fileInput = document.getElementById('est-file') as HTMLInputElement;
        const file = fileInput.files && fileInput.files.length > 0 ? fileInput.files : null;

        if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        if (!file) { Swal.showValidationMessage('Debes seleccionar un archivo'); return false; }

        return { nombre, file };
      }
    });

    if (formEstudio) {
      const transformarBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      try {
        const stringBase64 = await transformarBase64(formEstudio.file);
        
        p.estudios.push({
          nombre: formEstudio.nombre,
          url: stringBase64, 
          fecha: new Date().toLocaleDateString('es-AR')
        });

        self.tabActiva = 'estudios';
        self.sincronizarCambiosPaciente(p);
      } catch (err) {
        Swal.fire('Error', 'No se pudo procesar el archivo seleccionado.', 'error').then(() => {
          self.abrirFichaMaestra(p);
        });
      }
    } else {
      self.abrirFichaMaestra(p);
    }
  }

  verImagenFull(url: string, p: any) { 
    Swal.fire({ 
      imageUrl: url, 
      imageAlt: 'Estudio Médico',
      confirmButtonColor: '#8a2be2',
      width: '700px'
    }).then(() => {
      // Al cerrar el visor de imágenes, reabre la Ficha Maestra del paciente actual.
      this.abrirFichaMaestra(p);
    }); 
  }
}