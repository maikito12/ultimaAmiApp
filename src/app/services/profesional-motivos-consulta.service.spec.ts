import { TestBed } from '@angular/core/testing';

import { ProfesionalMotivosConsultaService } from './profesional-motivos-consulta.service';

describe('ProfesionalMotivosConsultaService', () => {
  let service: ProfesionalMotivosConsultaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfesionalMotivosConsultaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
