import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NightsComponent } from './nights.component';

describe('NightsComponent', () => {
  let component: NightsComponent;
  let fixture: ComponentFixture<NightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
