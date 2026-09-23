import { TestBed } from '@angular/core/testing';

import { ConsultasMedicasService } from './consultas-medicas.service';

describe('ConsultasMedicasService', () => {
  let service: ConsultasMedicasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultasMedicasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
