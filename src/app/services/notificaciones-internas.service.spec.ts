import { TestBed } from '@angular/core/testing';

import { NotificacionesInternasService } from './notificaciones-internas.service';

describe('NotificacionesInternasService', () => {
  let service: NotificacionesInternasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionesInternasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
