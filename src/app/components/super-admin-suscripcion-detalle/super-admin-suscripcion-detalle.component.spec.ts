import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminSuscripcionDetalleComponent } from './super-admin-suscripcion-detalle.component';

describe('SuperAdminSuscripcionDetalleComponent', () => {
  let component: SuperAdminSuscripcionDetalleComponent;
  let fixture: ComponentFixture<SuperAdminSuscripcionDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminSuscripcionDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminSuscripcionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
