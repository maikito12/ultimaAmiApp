import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private readonly URL_N8N = 'https://juandibello05.app.n8n.cloud/webhook/dashboard';
  // private readonly URL_API = 'http://localhost:5000/api/gestion'; // Futuro C#
  private readonly URL_BASE = this.URL_N8N; 

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ==========================================
  // --- ENDPOINTS NUEVOS PARA PACIENTES ---
  // ==========================================

  // GET: Obtener todos los pacientes del profesional
  obtenerPacientes(): Observable<any[]> {
    const slug = this.auth.getUsuario()?.slug;
    // C#: return this.http.get<any[]>(`${this.URL_API}/pacientes?slug=${slug}`);
    return this.http.get<any[]>(`${this.URL_BASE}?slug=${slug}&tipo=pacientes`);
  }

  // POST: Crear o actualizar datos maestros de un paciente
  guardarPaciente(paciente: any): Observable<any> {
    const slug = this.auth.getUsuario()?.slug;
    // C#: return this.http.post(`${this.URL_API}/pacientes`, { ...paciente, slug });
    return this.http.post(`${this.URL_BASE}?tipo=guardar-paciente`, { ...paciente, slug });
  }

  // POST: Agregar una nota clínica/evolución histórica directamente
  agregarNotaHistorial(pacienteId: any, notaData: any): Observable<any> {
    // C#: return this.http.post(`${this.URL_API}/pacientes/${pacienteId}/historial`, notaData);
    return this.http.post(`${this.URL_BASE}?tipo=agregar-nota-historial`, { pacienteId, ...notaData });
  }

  // DELETE: Eliminar un paciente permanentemente
  eliminarPaciente(pacienteId: any): Observable<any> {
    // C#: return this.http.delete(`${this.URL_API}/pacientes/${pacienteId}`);
    return this.http.delete(`${this.URL_BASE}?id=${pacienteId}&tipo=pacientes`);
  }

  // ==========================================
  // --- MÉTODOS ANTERIORES DE TURNOS ---
  // ==========================================
  getStats(): Observable<any> {
    const slug = this.auth.getUsuario()?.slug;
    return this.http.get<any>(`${this.URL_BASE}?slug=${slug}&tipo=stats`);
  }
  obtenerTurnos(): Observable<any[]> {
    const slug = this.auth.getUsuario()?.slug;
    return this.http.get<any[]>(`${this.URL_BASE}?slug=${slug}&tipo=turnos`);
  }
  obtenerTodosTurnos(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL_BASE}?slug=${slug}&tipo=todos-los-turnos`);
  }
  getBloqueos(): Observable<any[]> {
    const slug = this.auth.getUsuario()?.slug;
    return this.http.get<any[]>(`${this.URL_BASE}?slug=${slug}&tipo=bloqueos`);
  }
  notificarEnEspera(turnoId: string): Observable<any> {
    return this.http.post(`${this.URL_BASE}?tipo=en-espera`, { id: turnoId });
  }
  notificarAtencion(turnoId: string): Observable<any> {
    return this.http.post(`${this.URL_BASE}?tipo=marcar-atendido`, { id: turnoId });
  }
  cancelarTurno(turnoId: string, motivo: string = ''): Observable<any> {
    const slug = this.auth.getUsuario()?.slug;
    return this.http.post(`${this.URL_BASE}?tipo=cancelar-turnos`, { id: turnoId, slug, motivo });
  }
  actualizarFicha(pacienteData: any): Observable<any> {
    return this.http.post(`${this.URL_BASE}?tipo=guardar-ficha`, pacienteData);
  }
  bloquearAgenda(bloqueoData: any): Observable<any> {
    const slug = this.auth.getUsuario()?.slug;
    return this.http.post(`${this.URL_BASE}?tipo=bloqueos`, { ...bloqueoData, slug, accion: 'bloquear' });
  }
  desbloquearAgenda(bloqueoId: string): Observable<any> {
    return this.http.post(`${this.URL_BASE}?tipo=bloqueos`, { id: bloqueoId, accion: 'desbloquear' });
  }
}