import { TestBed } from '@angular/core/testing';

import { EnlacesExternosService } from './enlaces-externos.service';

describe('EnlacesExternosService', () => {
  let service: EnlacesExternosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnlacesExternosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
