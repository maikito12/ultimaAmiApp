import { TestBed } from '@angular/core/testing';

import { TotemService } from './totem.service';

describe('TotemService', () => {
  let service: TotemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
