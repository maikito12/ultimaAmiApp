import { TestBed } from '@angular/core/testing';

import { ReservaMotivosPublicosService } from './reserva-motivos-publicos.service';

describe('ReservaMotivosPublicosService', () => {
  let service: ReservaMotivosPublicosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservaMotivosPublicosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
