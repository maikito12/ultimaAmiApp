export interface DashboardStats {
  turnosHoy: number;
  clientesTotal: number;
  turnosAtendidosHoy: number;
}

export interface TurnoDashboard {
  id: string;
  hora: string;
  paciente: string;
  dni: string;
  telefono?: string;
  sucursal: string;
  estado: string;
}

export interface Cumpleanios {
  paciente: string;
  edad: number;
  telefono?: string;
}

export interface DashboardHome {
  stats: DashboardStats;
  proximosTurnos: TurnoDashboard[];
  cumplesHoy: Cumpleanios[];
}