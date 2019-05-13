import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators';


import * as moment from 'moment'; 
import { Observable } from 'rxjs';


/*
  Generated class for the Servidor provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable(
  { providedIn: 'root' }
)
export class Servidor {
public idempresa= localStorage.getItem("idempresa");
public userId= localStorage.getItem("login");
public param:any=null;
public incidencia:any=null;
public idEntrada:object=null;
public entidad:string=null;
  constructor(public llamada: Http) {
    console.debug('Hello Servidor Provider');
  }

  isTokenExired (token) {
    if (token){
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    //return JSON.parse(window.atob(base64));
    let jwt = JSON.parse(window.atob(base64));
   return moment.unix(jwt.exp).isBefore(moment());
    }else{
      return true;
    }
}

  login(url: string, param: string, payload = '') {
    param = param + "&origen=app";
    if (this.isTokenExired(localStorage.getItem('token'))){
    return this.llamada.post(url + param, payload)
    .pipe(map(res => JSON.parse(res.json())))
    //  .map((res: Response) => JSON.parse(res.json()));
    }else{
      return new Observable((valor)=>{
        valor.next('ok');
      })
    }
  }


//  isTokenValid (token) {
//             var base64Url = token.split('.')[1];
//             var base64 = base64Url.replace('-', '+').replace('_', '/');
//             console.debug (JSON.parse(window.atob(base64)));
//   }

  getObjects(url: string, param: string) {
    let parametros = '?token=' + localStorage.getItem('token') + param; 
    //console.log(url + parametros)
    return this.llamada.get(url + parametros)
      //.map((res: Response) => JSON.parse(res.json()));
      .pipe(map(res => JSON.parse(res.json())))
  }
getSimple(url: string, param: string){
  return this.llamada.get(url + param);
}

  postObject(url: string, object: Object, param?: string) {
    let payload = JSON.stringify(object);
    let paramopcional = '';
    if (param !== undefined){
      paramopcional = param;
    }
    paramopcional += "&userId="+localStorage.getItem('login')+"&idempresa="+localStorage.getItem('idempresa') + "&origen=app";
    let parametros = '?token=' + localStorage.getItem('token') +paramopcional;
    return this.llamada.post(url + parametros, payload)
    .pipe(map(res => JSON.parse(res.json())))
      //.map((res: Response) => JSON.parse(res.json()));
  }

  putObject(url: string, param: string, object: Object,origen?:string) {
    console.log("PUT: ",object,new Date())
    let payload = JSON.stringify(object);        
    let parametros = param + '&token=' + localStorage.getItem('token')+"&userId="+localStorage.getItem('login')+"&idempresa="+localStorage.getItem('idempresa') + "&origen=app";
    return this.llamada.put(url + parametros, payload)
    .pipe(map(res => JSON.parse(res.json())))
      //.map((res: Response) => JSON.parse(res.json()));
  }
  
  deleteObject(url: string, param: string) {
    let parametros = param + '&token=' + localStorage.getItem('token')+"&userId="+localStorage.getItem('login')+"&idempresa="+localStorage.getItem('idempresa') + "&origen=app";
    return this.llamada.delete(url + parametros)
    .pipe(map(res => JSON.parse(res.json())))
      //.map((res: Response) => JSON.parse(res.json()));
  }

  postLogo(url: string, files: File[], idEmpresa: string) {
    let formData: FormData = new FormData();
    let parametros = '?token=' + localStorage.getItem('token') + '&idempresa=' + idEmpresa+ "&origen=app";
    formData.append('logo', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
    .pipe(map(res => JSON.parse(res.json())))
      //.map((res: Response) => JSON.parse(res.json()));
  }

  postDoc(url: string, files: File[], entidad:string, idEntidad: string, idEmpresa: string, field?: string) {
    let formData: FormData = new FormData();
    let parametros = '?token=' + localStorage.getItem('token') + '&idEntidad=' + idEntidad +'&entidad=' + entidad+'&idEmpresa=' + idEmpresa+'&field=' + field+ "&origen=app";
    formData.append('doc', files[0], files[0].name);
    return this.llamada.post(url + parametros, formData)
    .pipe(map(res => JSON.parse(res.json())))
      //.map((res: Response) => JSON.parse(res.json()));
  }

  setParam(param,entidad?){
    this.entidad=null;
    this.param=param;
    this.entidad=entidad;
    console.log(this.entidad);
  }
  getParam(){
    let resultado= this.param;
    console.log(this.entidad);
    if (this.entidad){
      resultado= {'mantenimiento':this.param,'entidad':this.entidad}
    }
    return resultado;
  }
  setIncidencia(param){
    this.incidencia=null;
    if (param)
    this.incidencia=param;
  }
  getIncidencia(){
    return this.incidencia;
  }
  setIdEntrada(id){
    this.idEntrada=id;
  }
  getIdEntrada(){
    return this.idEntrada;
  }
}
