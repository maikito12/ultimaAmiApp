import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnlacesExternosComponent } from './enlaces-externos.component';

describe('EnlacesExternosComponent', () => {
  let component: EnlacesExternosComponent;
  let fixture: ComponentFixture<EnlacesExternosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnlacesExternosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnlacesExternosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
