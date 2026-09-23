import { TestBed } from '@angular/core/testing';

import { BloqueosAgendaService } from './bloqueos-agenda.service';

describe('BloqueosAgendaService', () => {
  let service: BloqueosAgendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloqueosAgendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
