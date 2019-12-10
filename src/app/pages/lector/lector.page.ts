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
import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
//import { CheckLimpiezaPage } from '../check-limpieza/check-limpieza.page'
//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-lector',
  templateUrl: './lector.page.html',
  styleUrls: ['./lector.page.scss'],
 // providers:[CheckLimpiezaPage]
})
export class LectorPage implements OnInit {
public estado:string="esperando...";
public acciones:any[]=[];
  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  private barcodeScanner: BarcodeScanner
 // private checkLimpieza: CheckLimpiezaPage
  ) {}

  //*************  INIT *************/
  ngOnInit() {

  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link);
  }

  //*************  FUNCTIONS *************/

scan(){
  this.barcodeScanner.scan().then(barcodeData => {
    console.log('Barcode data', barcodeData);
    this.estado=barcodeData.text;
    if(this.estado=='fin'){
      this.finaliza();
    }else{
      this.acciones.push(this.estado);
      this.doSomething();
    }
   }).catch(err => {
       console.log('Error', err);
   });

}

doSomething(){

  this.scan();
}

finaliza(){
  this.acciones.push('OK FIN');
  //this.checkLimpieza.test();
}

}
