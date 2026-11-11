import { TestBed } from '@angular/core/testing';

import { TotemsadminService } from './totemsadmin.service';

describe('TotemsadminService', () => {
  let service: TotemsadminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotemsadminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
