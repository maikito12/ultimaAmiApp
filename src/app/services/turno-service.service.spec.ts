import { TestBed } from '@angular/core/testing';

import { TurnoServiceService } from './turno-service.service';

describe('TurnoServiceService', () => {
  let service: TurnoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurnoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
