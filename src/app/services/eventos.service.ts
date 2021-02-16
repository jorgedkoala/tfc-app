import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EventosService {
incidencia=new Subject();
procesing=new Subject();
  constructor() { }

  setIncidencia(incidencia,origen?) {
    this.incidencia.next(incidencia);
  }


  setProcesing(mode) {
    this.procesing.next(mode);
  }

  
}

