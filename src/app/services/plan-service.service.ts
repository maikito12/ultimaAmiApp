import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from '../interfaces/plan';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private readonly apiUrl =
     `${environment.apiUrl}/planes`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // OBTENER PLANES
  // ==========================================

  obtenerTodos(): Observable<Plan[]> {

    return this.http.get<Plan[]>(
      this.apiUrl
    );

  }


  // ==========================================
  // OBTENER PLAN POR ID
  // ==========================================

  obtenerPorId(id: string): Observable<Plan> {

    return this.http.get<Plan>(
      `${this.apiUrl}/${id}`
    );

  }

}