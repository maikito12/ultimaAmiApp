import { TestBed } from '@angular/core/testing';

import { ReagendamientoPublcioService } from './reagendamiento-publcio.service';

describe('ReagendamientoPublcioService', () => {
  let service: ReagendamientoPublcioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReagendamientoPublcioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
