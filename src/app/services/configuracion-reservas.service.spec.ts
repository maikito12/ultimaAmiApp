import { TestBed } from '@angular/core/testing';

import { ConfiguracionReservasService } from './configuracion-reservas.service';

describe('ConfiguracionReservasService', () => {
  let service: ConfiguracionReservasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionReservasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
