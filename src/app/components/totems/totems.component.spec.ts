import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotemsComponent } from './totems.component';

describe('TotemsComponent', () => {
  let component: TotemsComponent;
  let fixture: ComponentFixture<TotemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
