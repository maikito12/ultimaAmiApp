export interface FiltroEstadisticas {
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  sucursal: string;
}

export interface MetricKpi {
  label: string;
  valor: string;
  sub: string;
  color: string;
}

export interface SegmentacionItem {
  label: string;
  val: number;
}

export interface SegmentacionData {
  titulo: string;
  data: SegmentacionItem[];
}

export interface DistribucionHoraria {
  rango: string;
  cupo: number;
}

export interface PacienteRanking {
  nombre: string;
  visitas: number;
  ultima: string;
  status: string;
}

// El objeto global que devuelve la API de C#
export interface DashboardEstadisticasResponse {
  metrics: MetricKpi[];
  segmentacion: SegmentacionData[];
  distribucionHoraria: DistribucionHoraria[];
  rankingPacientes: PacienteRanking[];
}