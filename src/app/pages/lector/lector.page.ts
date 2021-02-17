import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { URLS } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
// import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
import { CheckLimpiezaPage } from '../check-limpieza/check-limpieza.page';
import {SyncPage} from '../sync/sync.page';
//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-lector',
  templateUrl: './lector.page.html',
  styleUrls: ['./lector.page.scss'],
  providers:[CheckLimpiezaPage,SyncPage]
})
export class LectorPage implements OnInit {
public estado:string="esperando...";
public acciones:any[]=[];
public alertas:any[]=[];
public desactivado:boolean=true;
  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  private barcodeScanner: BarcodeScanner,
  private checkLimpieza: CheckLimpiezaPage,
  private sync: SyncPage
  ) {}

  //*************  INIT *************/
  ngOnInit() {
    this.scan();
  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link);
  }

  //*************  FUNCTIONS *************/

scan(){
  this.estado = null;
  this.desactivado=true;
  this.acciones=[];
  this.alertas=[];
  this.barcodeScanner.scan().then(barcodeData => {
    console.log('Barcode data', barcodeData);
    if (barcodeData.format=="QR_CODE"){
    this.estado=barcodeData.text;
    if(this.estado=='fin'){
     // this.finaliza();
     console.log(this.acciones);
    }else{ //estado
      console.log(this.acciones)
      this.acciones.push(this.estado);
      this.doSomething();
    }
  }else{ //si no es QR
    this.alertas.push('Esto no parece un código QR, puede que sea un código de barras, proximamente podrás hacer entradas de producto desde aquí');
  }
   }).catch(err => {
       console.log('Error', err);
   });

}

doSomething(){
console.log(this.acciones[0])
try{  
let accion = JSON.parse(this.acciones[0]);
console.log(accion, accion["idlimpiezazona"]);
if (accion["idEmpresa"]==parseInt(localStorage.getItem("idempresa"))){
switch(accion["modulo"]){
  case 'limpieza':
      console.log('Ok Limpiezas Enviar para procesar');
      this.desactivado=false;
  break;
  default:
      console.error('Modulo no implementado');
      this.alertas.push('Modulo no implementado');
  break;

}
}else{
  this.alertas.push('ERROR, puede que no sea un qr de la empresa?');
}
}catch (e){
  console.error('ERROR JSON, puede que no sea un qr de la empresa?',e);
  this.alertas.push('ERROR, puede que no sea un qr de la empresa?');
}
  //this.scan();
}

finaliza(){
  let accion = JSON.parse(this.acciones[0]);
  console.log(accion, accion["idlimpiezazona"]);
  this.acciones.push('OK FIN');
  this.checkLimpieza.test();

  let idlimpiezazona = accion["idlimpiezazona"];
  console.log (idlimpiezazona);
  this.checkLimpieza.idlimpiezazona = accion["idlimpiezazona"];
  this.checkLimpieza.getLimpiezas();

  setTimeout(()=>{
    this.checkLimpieza.checkLimpiezas.forEach((limpieza)=>{
      console.log ('FOREACH',limpieza);
      limpieza.checked = true;
    });
    console.log(this.checkLimpieza.checkLimpiezas)
    this.checkLimpieza.terminar();
//    this.sync.sync_checklimpieza();
  },1000)
  
}

}
