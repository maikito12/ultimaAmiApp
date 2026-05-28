import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadisticasService } from '../../services/service-estadisticas.service'; 
import { FiltroEstadisticas, MetricKpi, SegmentacionData, DistribucionHoraria, PacienteRanking } from '../../interfaces/estadisticas';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {

  // Estado de los filtros iniciales
  filtro: FiltroEstadisticas = {
    periodo: 'este_mes',
    fechaInicio: '',
    fechaFin: '',
    sucursal: 'todas'
  };

  // Estructuras que renderizarán en el HTML
  metrics: MetricKpi[] = [];
  segmentacion: SegmentacionData[] = [];
  distribucionHoraria: DistribucionHoraria[] = [];
  rankingPacientes: PacienteRanking[] = [];
  datosEdad: any[] = []; // Nueva propiedad para la segmentación por edad

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    const mockData = {
      metrics: [
        { label: 'Turnos Atendidos', valor: '342', sub: '+14% este mes', color: 'violeta' },
        { label: 'Cancelaciones', valor: '18', sub: '-3% vs mes pasado', color: 'rojo' },
        { label: 'Pacientes Activos', valor: '1,248', sub: '+48 nuevos', color: 'violeta' },
        { label: 'Nuevas Historias', valor: '86', sub: 'En crecimiento', color: 'violeta' }
      ],
      segmentacion: [
        {
          titulo: 'Obras Sociales',
          data: [
            { label: 'OSDE', val: 45 },
            { label: 'Particular', val: 25 },
            { label: 'Swiss Medical', val: 15 },
            { label: 'Galeno', val: 10 },
            { label: 'Medifé', val: 5 }
          ]
        },
        {
          titulo: 'Canal de Adquisición',
          data: [
            { label: 'Instagram Ads', val: 50 },
            { label: 'Recomendación Boca en Boca', val: 25 },
            { label: 'WhatsApp / Web', val: 15 },
            { label: 'Facebook Campaign', val: 10 }
          ]
        },
        {
          titulo: 'Flujo por Sucursal',
          data: [
            { label: 'Clínica Del Niño', val: 60 },
            { label: 'Clínica 25 De Mayo', val: 40 }
          ]
        }
      ],
      distribucionHoraria: [
        { rango: '08:00 - 10:00', cupo: 65 },
        { rango: '10:00 - 12:00', cupo: 90 },
        { rango: '12:00 - 14:00', cupo: 40 },
        { rango: '14:00 - 16:00', cupo: 55 },
        { rango: '16:00 - 18:00', cupo: 85 },
        { rango: '18:00 - 20:00', cupo: 95 }
      ],
      rankingPacientes: [
        { nombre: 'Juan Cruz Di Bello', visitas: 12, status: 'Fiel' },
        { nombre: 'María Belén Rodríguez', visitas: 10, status: 'Fiel' },
        { nombre: 'Gonzalo Pérez', visitas: 8, status: 'Fiel' },
        { nombre: 'Sofía Martínez', visitas: 5, status: 'Nuevo' },
        { nombre: 'Lucas Fernández', visitas: 4, status: 'Nuevo' },
        { nombre: 'Valentina Gomez', visitas: 3, status: 'Nuevo' },
        { nombre: 'Facundo Diaz', visitas: 3, status: 'Nuevo' },
        { nombre: 'Agustina Romero', visitas: 2, status: 'Nuevo' }
      ]
    };

    this.metrics = mockData.metrics as any;
    this.segmentacion = mockData.segmentacion as any;
    this.distribucionHoraria = mockData.distribucionHoraria as any;
    this.rankingPacientes = mockData.rankingPacientes as any;

    // Inicializamos la segmentación por edad
    this.calcularSegmentacionPorEdad();
  }

  calcularSegmentacionPorEdad() {
    // Datos mockeados para la visualización. 
    // Cuando conectes tu API, aquí procesarás las fechas de nacimiento.
    this.datosEdad = [
      { label: '18-24', val: 15 },
      { label: '25-40', val: 45 },
      { label: '41-60', val: 30 },
      { label: '60+', val: 10 }
    ];
  }

  aplicarFiltros() {
    console.log('Enviando filtros analizados a C#:', this.filtro);
    this.cargarEstadisticas();
  }

  restablecerFiltros() {
    this.filtro = {
      periodo: 'este_mes',
      fechaInicio: '',
      fechaFin: '',
      sucursal: 'todas'
    };
    this.cargarEstadisticas(); 
  }

  verTodosLosPacientes() {
    const styleTag = document.getElementById('swal-custom-styles');
    if (!styleTag) {
      const style = document.createElement('style');
      style.id = 'swal-custom-styles';
      style.innerHTML = `
        .modal-minimal-pro { border-radius: 25px !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
        .contenedor-tabla { padding: 10px 15px; text-align: left; }
        .tabla-pro { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .tabla-pro th { padding: 10px 20px; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .fila-paciente td { padding: 14px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .fila-paciente td:first-child { border-left: 1px solid #e2e8f0; border-radius: 12px 0 0 12px; }
        .fila-paciente td:last-child { border-right: 1px solid #e2e8f0; border-radius: 0 12px 12px 0; }
        .nombre-pro { color: #1e293b; font-weight: 700; font-size: 14px; }
        .visitas-pro { color: #9b67cc; font-weight: 800; font-size: 15px; }
        .badge-pro { padding: 5px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .fiel-style { background: #f4eeff; color: #9b67cc; }
        .nuevo-style { background: #dcfce7; color: #15803d; }
        .btn-cerrar-pro { 
          background: #9b67cc; color: white; border: none; padding: 12px 45px; border-radius: 14px; 
          font-weight: 700; cursor: pointer; margin-top: 25px; transition: 0.3s; width: 100%;
        }
        .btn-cerrar-pro:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(155, 103, 204, 0.3); }
      `;
      document.head.appendChild(style);
    }

    const pacientesOrdenados = [...this.rankingPacientes].sort((a, b) => b.visitas - a.visitas);

    const tablaHtml = `
      <div class="contenedor-tabla">
        <table class="tabla-pro">
          <thead>
            <tr>
              <th>Paciente</th>
              <th style="text-align: center;">Sesiones</th>
              <th style="text-align: right;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${pacientesOrdenados.map((p) => `
              <tr class="fila-paciente">
                <td><span class="nombre-pro">${p.nombre}</span></td>
                <td style="text-align: center;"><span class="visitas-pro">${p.visitas}</span></td>
                <td style="text-align: right;">
                  <span class="badge-pro ${p.status.toLowerCase() === 'fiel' ? 'fiel-style' : 'nuevo-style'}">
                    ${p.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align: center;">
          <button id="btn-cerrar-swal" class="btn-cerrar-pro">Cerrar Ventana</button>
        </div>
      </div>
    `;

    Swal.fire({
      title: '<div style="text-align: left; padding-left: 20px; color: #1e293b; font-size: 22px; font-weight: 800;">Ranking de Sesiones</div>',
      html: tablaHtml,
      width: '550px',
      showConfirmButton: false,
      showCloseButton: true,
      customClass: { popup: 'modal-minimal-pro' },
      didOpen: () => {
        const btnCerrar = document.getElementById('btn-cerrar-swal');
        if (btnCerrar) {
          btnCerrar.addEventListener('click', () => {
            Swal.close();
          });
        }
      }
    });
  }
}