import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TanquesPage } from './tanques.page';

describe('TanquesPage', () => {
  let component: TanquesPage;
  let fixture: ComponentFixture<TanquesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TanquesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TanquesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
