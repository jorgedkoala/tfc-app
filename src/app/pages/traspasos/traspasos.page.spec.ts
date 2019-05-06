import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraspasosPage } from './traspasos.page';

describe('TraspasosPage', () => {
  let component: TraspasosPage;
  let fixture: ComponentFixture<TraspasosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraspasosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraspasosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
