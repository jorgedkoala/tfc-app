import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionPage } from './supervision.page';

describe('SupervisionPage', () => {
  let component: SupervisionPage;
  let fixture: ComponentFixture<SupervisionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupervisionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
