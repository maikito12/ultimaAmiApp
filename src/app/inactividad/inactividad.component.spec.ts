import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactividadComponent } from './inactividad.component';

describe('InactividadComponent', () => {
  let component: InactividadComponent;
  let fixture: ComponentFixture<InactividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactividadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
