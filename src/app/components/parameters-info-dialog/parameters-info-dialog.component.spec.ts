import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametersInfoDialogComponent } from './parameters-info-dialog.component';

describe('ParametersInfoDialogComponent', () => {
  let component: ParametersInfoDialogComponent;
  let fixture: ComponentFixture<ParametersInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParametersInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametersInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
