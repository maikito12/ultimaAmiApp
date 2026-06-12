import { TestBed } from '@angular/core/testing';

import { ProfesionalEstadoServiceService } from './profesional-estado-service.service';

describe('ProfesionalEstadoServiceService', () => {
  let service: ProfesionalEstadoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfesionalEstadoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
