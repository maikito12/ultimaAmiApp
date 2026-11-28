import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaPersonalComponent } from './reserva-personal.component';

describe('ReservaPersonalComponent', () => {
  let component: ReservaPersonalComponent;
  let fixture: ComponentFixture<ReservaPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
