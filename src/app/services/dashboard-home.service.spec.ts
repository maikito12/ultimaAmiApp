import { TestBed } from '@angular/core/testing';

import { DashboardHomeService } from './dashboard-home.service';

describe('DashboardHomeService', () => {
  let service: DashboardHomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardHomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
