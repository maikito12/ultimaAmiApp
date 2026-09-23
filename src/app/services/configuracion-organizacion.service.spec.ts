import { TestBed } from '@angular/core/testing';

import { ConfiguracionOrganizacionService } from './configuracion-organizacion.service';

describe('ConfiguracionOrganizacionService', () => {
  let service: ConfiguracionOrganizacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionOrganizacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
