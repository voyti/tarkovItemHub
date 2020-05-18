import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutInfoDialogComponent } from './about-info-dialog.component';

describe('AboutInfoDialogComponent', () => {
  let component: AboutInfoDialogComponent;
  let fixture: ComponentFixture<AboutInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
