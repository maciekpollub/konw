import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoFileChosenComponent } from './no-file-chosen.component';

describe('NoFileChosenComponent', () => {
  let component: NoFileChosenComponent;
  let fixture: ComponentFixture<NoFileChosenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoFileChosenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoFileChosenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
