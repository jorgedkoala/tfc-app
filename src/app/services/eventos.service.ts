import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EventosService {
incidencia=new Subject();
procesing=new Subject();
private empresa:string=null;
  constructor() { }

  setIncidencia(incidencia,origen?) {
    this.incidencia.next(incidencia);
  }


  setProcesing(mode) {
    this.procesing.next(mode);
  }

  setidEmpresa(empresa){

  }
  getidEmpresa(){
    return this.empresa
  }
}

