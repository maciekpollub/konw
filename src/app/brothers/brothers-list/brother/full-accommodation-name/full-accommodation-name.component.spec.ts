import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullAccommodationNameComponent } from './full-accommodation-name.component';

describe('FullAccommodationNameComponent', () => {
  let component: FullAccommodationNameComponent;
  let fixture: ComponentFixture<FullAccommodationNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullAccommodationNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullAccommodationNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
