import { TestBed } from '@angular/core/testing';

import { PacientesdService } from './pacientesd.service';

describe('PacientesdService', () => {
  let service: PacientesdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacientesdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
