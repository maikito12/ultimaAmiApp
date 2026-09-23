import { TestBed } from '@angular/core/testing';

import { AutomatizacionesService } from './automatizaciones.service';

describe('AutomatizacionesService', () => {
  let service: AutomatizacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomatizacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
