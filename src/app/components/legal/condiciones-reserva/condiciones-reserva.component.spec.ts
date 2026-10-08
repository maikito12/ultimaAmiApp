import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondicionesReservaComponent } from './condiciones-reserva.component';

describe('CondicionesReservaComponent', () => {
  let component: CondicionesReservaComponent;
  let fixture: ComponentFixture<CondicionesReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CondicionesReservaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CondicionesReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
