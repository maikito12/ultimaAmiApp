import { TestBed } from '@angular/core/testing';

import { ReservaPersonalService } from './reserva-personal.service';

describe('ReservaPersonalService', () => {
  let service: ReservaPersonalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservaPersonalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
