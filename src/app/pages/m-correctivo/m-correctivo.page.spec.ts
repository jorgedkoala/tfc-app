import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MCorrectivoPage } from './m-correctivo.page';

describe('MCorrectivoPage', () => {
  let component: MCorrectivoPage;
  let fixture: ComponentFixture<MCorrectivoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MCorrectivoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MCorrectivoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
