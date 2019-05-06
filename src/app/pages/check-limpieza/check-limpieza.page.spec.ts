import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckLimpiezaPage } from './check-limpieza.page';

describe('CheckLimpiezaPage', () => {
  let component: CheckLimpiezaPage;
  let fixture: ComponentFixture<CheckLimpiezaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckLimpiezaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckLimpiezaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
