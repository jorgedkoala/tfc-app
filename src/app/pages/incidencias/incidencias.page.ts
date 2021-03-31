import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {  IonRouterOutlet, Platform,IonNav } from '@ionic/angular';

import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import {SyncPage} from '../sync/sync.page';
import { Initdb } from '../../services/initdb';
import { URLS, Incidencia } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
// import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
import { EventosService } from '../../services/eventos.service';
const nav = document.querySelector('ion-nav');
//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  providers: [SyncPage]
})
export class IncidenciasPage implements OnInit, OnDestroy {
 
  public base64Image: string;
  public origen;
  public idOrigen;
  public incidencia: Incidencia;
  public textoBoton: string = 'guardar';
  public hayIncidencia:boolean=false;
public hoy: Date = new Date();
public desactivado:boolean=false;
  //*************  CONSTRUCTOR *************/
  constructor(
  public platform: Platform,
  public router: Router,
  public navCtrl: IonRouterOutlet,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network,
  public periodos: PeriodosProvider,
  public initdb: Initdb,
  public sync: SyncPage, 
  // public events: Events,
  public eventos: EventosService,
  public camera: Camera
  ) {

  }

  //*************  INIT *************/
  ngOnDestroy(){
    if(!this.hayIncidencia){
      // this.events.publish('nuevaIncidencia', 0);
      this.eventos.setIncidencia(0);
    }
  }

  ngOnInit() {
    this.eventos.setIncidencia('TEST COMUNICACION INCIDENCIA');
    console.log('can go back',this.navCtrl.canGoBack());
   this.platform.ready().then(
     ()=>{
       this.incidencia = this.servidor.getIncidencia();
      if (!this.incidencia){
          this.textoBoton = 'enviar';
          this.incidencia = new Incidencia(null,null,'','',parseInt(sessionStorage.getItem("iduser")),
          parseInt(localStorage.getItem("idempresa")),'Incidencias',0 ,'Incidencias',0,this.base64Image,'',-1)
        }
        console.log(this.incidencia);
        this.db.create({name: 'data.db',location: 'default'})
        .then((db2: SQLiteObject) => {
        db2.executeSql("DELETE from incidencias", []).then((data) => {
          console.log("deleted x items incidencia");
        },
      (error)=>{console.log('Deleting incidencias ERROR',error)});
      }
    );


    if (this.isTokenExired(localStorage.getItem('token')) && this.network.type != 'none'){
      let param = '?user=' + sessionStorage.getItem("nombre") + '&password=' +sessionStorage.getItem("password");
      this.servidor.login(URLS.LOGIN, param).subscribe(
        response => {
          if (response["success"] == 'true') {
            // Guarda token en sessionStorage
            localStorage.setItem('token', response["token"]);
            }
            });
    }
     
     });
  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link, {replaceUrl:true});
  }

  //*************  FUNCTIONS *************/



  isTokenExired (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    //return JSON.parse(window.atob(base64));
    let jwt = JSON.parse(window.atob(base64));
    console.log (moment.unix(jwt.exp).isBefore(moment()));
   return moment.unix(jwt.exp).isBefore(moment());
}


  creaIncidencia(){
     let fecha = moment(this.hoy).format('YYYY-MM-DD HH:mm');
     let mensaje;
     console.log("creando incidencia:");
     //this.translate.get("alertas."+incidencia).subscribe(resultado => { mensaje = resultado});
    this.db.create({name: 'data.db',location: 'default'})
    .then((db2: SQLiteObject) => { 
      console.log("insert local incidencia");
      db2.executeSql('INSERT INTO incidencias (fecha, incidencia, solucion, responsable, idempresa, origen, idOrigen, origenasociado, idOrigenasociado, foto, descripcion, estado,idElemento) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [fecha, this.incidencia.incidencia,this.incidencia.solucion,parseInt(sessionStorage.getItem("idusuario")),parseInt(localStorage.getItem("idempresa")),this.incidencia.origen,this.incidencia.idOrigen,this.incidencia.origenasociado,this.incidencia.idOrigenasociado,this.incidencia.foto,this.incidencia.descripcion,-1,-1]).then(
  (Resultado) => { console.log("insert_incidencia_ok:",Resultado);
  let incidencia = {'idLocal':Resultado.insertId}
  this.eventos.setIncidencia(incidencia);
  // this.events.publish('nuevaIncidencia', incidencia);
  this.hayIncidencia=true;
  console.log('can go back',this.navCtrl.canGoBack());
  
  if (this.network.type != 'none' && this.incidencia.origen == 'Incidencias') {
    console.debug("conected");
  this.sync.sync_incidencias(-1,0,'Incidencias');
  console.debug("sync called?");
  //this.navCtrl.pop();
  this.closeIncidenciaPage();
  }
  else
  {
  console.debug ("suma:" + localStorage.getItem("syncincidencia"));
    localStorage.setItem("syncincidencia",(parseInt(localStorage.getItem("syncincidencia"))+1).toString());
    console.debug("this.myapp.badge",this.initdb.badge);
    this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
    //this.navCtrl.pop();
    this.closeIncidenciaPage();
  }
  },
  (error) => {
  console.debug(JSON.stringify(error))
  });
  });
  }

  closeIncidenciaPage(){
    console.log('close Incidencia Page',this.navCtrl.canGoBack());
    //console.log('close Incidencia Page',this.navCtrl.getPrevious());
    console.log(this.navCtrl.getLastUrl())
    if (this.navCtrl.canGoBack()){
      console.log('close Incidencia Page via GoBack');
      // this.navCtrl.pop();
      //console.log('#',this.navCtrl.activateEvents);
      //console.log('#',this.navCtrl.activatedRoute);
      //console.log('#',this.navCtrl.activatedRouteData);
      //console.log('#',this.navCtrl.component);
      //console.log('#',this.navCtrl.stackEvents);
      //this.goTo(this.navCtrl.getLastUrl());
      this.navCtrl.pop();
    }else{
      //this.navCtrl.setRoot(HomePage);   
      console.log('close Incidencia Page via goto /HOME');  
      this.goTo();
    }
  }



  takeFoto(){
    this.base64Image = "data:image/jpeg;base64,";
    this.camera.getPicture({
          destinationType: this.camera.DestinationType.DATA_URL,
          quality: 50,
          targetWidth: 300,
          targetHeight: 300,
          correctOrientation: true
      }).then((imageData) => {
        // imageData is a base64 encoded string
          this.base64Image = "data:image/jpeg;base64," + imageData;
          this.incidencia.foto = this.base64Image;
      }, (err) => {
          console.debug(err);
      });
    }
  
}
