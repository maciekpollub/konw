import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationsListComponent } from './accommodations-list.component';

describe('AccommodationsListComponent', () => {
  let component: AccommodationsListComponent;
  let fixture: ComponentFixture<AccommodationsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccommodationsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
