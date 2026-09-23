import { TestBed } from '@angular/core/testing';

import { ReservaPublicaService } from './reserva-publica.service';

describe('ReservaPublicaService', () => {
  let service: ReservaPublicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservaPublicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
