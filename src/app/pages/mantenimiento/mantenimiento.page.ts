import { Component, OnInit } from '@angular/core';
import { Events, Platform } from '@ionic/angular';

import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { URLS, mantenimientoRealizado, Incidencia } from '../../models/models';
import {SyncPage} from '../sync/sync.page';
import { Initdb } from '../../services/initdb';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.page.html',
  styleUrls: ['./mantenimiento.page.scss'],
  providers: [SyncPage]
})
export class MantenimientoPage implements OnInit {
  public nombreMaquina: string;
  public nombre: string;
  public id:number;
  public idMaquina:number;
  public mantenimientoRealizado: mantenimientoRealizado;
  public fechaPrevista: Date;
  public periodicidad:string;
  public responsable:string;
  public tipo:string;
  public hoy: Date = new Date();
  public isbeforedate: boolean=false;
  public hayRetraso:number;
  public autocompletar:boolean=false;
  public checked: boolean=false;
  public imagen:string="";
  public icono:string;
  public entidad:string;
  public descripcion:string="";
  public causas:string ="";
  public hayIncidencia: number = 0;


  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  private sync: SyncPage, 
  private initdb: Initdb,
  public camera: Camera,
  public events: Events,
  public platform: Platform
  ) {
    //console.debug("param",this.params.get('mantenimiento'));
    let param1= this.servidor.getParam();
    console.log("param",param1);
    let param= param1['mantenimiento'];
    this.id =  param.idmantenimiento;
    this.idMaquina=  param.idMaquina;
    this.nombreMaquina = param.nombreMaquina;
    this.nombre = param.nombre;
    this.fechaPrevista = new Date(param.fecha);
    this.periodicidad = JSON.parse(param.periodicidad);
    this.responsable = param.responsable;
    this.tipo = param.tipo;
    this.isbeforedate = moment(this.fechaPrevista).isBefore(this.hoy,'day');
    this.entidad = param1['entidad'];
  }

  //*************  INIT *************/
  ngOnInit() {
    this.platform.ready().then(
    ()=>{
      if ( this.entidad == 'maquina_mantenimiento'){
        this.icono = 'assets/img/machine.png';
        }else{
          this.icono = 'assets/img/balance.png'
        }
      
      
      console.log ("icono",this.icono);
        if (this.network.type != 'none'){
          let param = '?user=' + sessionStorage.getItem("nombre") + '&password=' +sessionStorage.getItem("password");
          this.servidor.login(URLS.LOGIN, param).subscribe(
            response => {
              if (response.success == 'true') {
                // Guarda token en sessionStorage
                localStorage.setItem('token', response.token);
                }
                });
        }
      
        ///ACTIVAR DESACTIVAR BUSCAR Y PERMITIR AUTORRELLENO PARA REPETICIONES PENDIENTES
        // this.hayRetraso = this.periodos.hayRetraso(this.fechaPrevista,this.periodicidad);
      
    }
  )

  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link);
  }

  //*************  FUNCTIONS *************/



  
terminar(){
 
  let idempresa = localStorage.getItem("idempresa");
  let idusuario = sessionStorage.getItem("idusuario")
  let elemento = "";
  let tipo2="preventivo";
  let tipo_evento = (this.entidad == "maquina_mantenimiento")?"mantenimiento":"calibracion";
  let fecha;
if (this.checked){
  (this.autocompletar)? fecha = this.fechaPrevista: fecha= this.hoy;
  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
    let fecha_prevista =  moment(this.fechaPrevista).format('YYYY-MM-DD');
    fecha = moment(fecha).format('YYYY-MM-DD');

      db2.executeSql('INSERT INTO mantenimientosrealizados (idmantenimiento, idmaquina, maquina, mantenimiento, fecha_prevista,fecha,idusuario, responsable, descripcion, elemento, tipo,tipo2,causas,tipo_evento, idempresa, imagen ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [this.id,this.idMaquina,this.nombreMaquina,this.nombre,fecha_prevista,fecha,idusuario,this.responsable,this.descripcion,elemento,this.tipo,tipo2,this.causas,tipo_evento,idempresa,this.imagen]).then(
  (Resultado) => {
    if (this.hayIncidencia > 0){
      db2.executeSql('UPDATE incidencias set idElemento = ? WHERE id = ?',[Resultado.insertId,this.hayIncidencia]).then(
        (Resultado) => { console.log("update_Incidencia_ok:",Resultado);}
        ,
        (error) => {
        console.log('ERROR UPDATE INCIDENCIA',JSON.stringify(error))
        });
    }
   // let proxima_fecha;
   //   proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,this.fechaPrevista,this.autocompletar)).format('YYYY-MM-DD');

      localStorage.setItem("syncmantenimientos", (parseInt(localStorage.getItem("syncmantenimientos")) + 1).toString());
//?      this.initdb.badge += 1;
      this.updateFecha(this.fechaPrevista,this.autocompletar);
      // db2.executeSql('UPDATE ' + this.entidad + ' set  fecha = ? WHERE id = ?',[proxima_fecha, this.id]).then
      // ((Resultado) => {
      //      console.log("updated fecha: ", proxima_fecha);
      // },
      // (error) => {
      //   console.debug('ERROR ACTUALIZANDO FECHA', error);
      //  });
  },
  (error) => {
    console.debug('ERROR INSERTANDO MR', error);
  });
},
  (error) => {console.debug(JSON.stringify(error))});
}          
}

updateFecha(fecha,completaFechas){
  let proxima_fecha;
  if (moment(fecha).isValid()){
    proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,fecha,completaFechas)).format('YYYY-MM-DD');
  }else{
    alert('Mal formato en la fecha ' + fecha + ' se calculará a partir de hoy ' +this.hoy);
    proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,this.hoy)).format('YYYY-MM-DD');
  }    
  //console.log("updating fecha",proxima_fecha);
  if (moment(proxima_fecha).isAfter(moment(),'day')){
    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      db2.executeSql('UPDATE ' + this.entidad + ' set  fecha = ? WHERE id = ?',[proxima_fecha, this.id]).then
      ((Resultado) => {
         console.log("updated fecha: ", proxima_fecha);
      },
      (error) => {
        console.debug('ERROR ACTUALIZANDO FECHA', error);
      });  
    });        
    if (this.network.type != 'none') {
      console.debug("conected");
      this.sync.sync_mantenimientos();
    }
    else {
      console.debug("update badge syncmantenimientos");
    }
    //this.navCtrl.pop();
    this.goTo();
        }else{

          console.log("sigue programando: ",proxima_fecha);
          this.fechaPrevista = proxima_fecha;
          this.terminar();
        }
}

takeFoto(){
//  this.imagen = "data:image/jpeg;base64,";
  this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        quality: 50,
        targetWidth: 300,
        targetHeight: 300,
        correctOrientation: true
    }).then((imageData) => {
      // imageData is a base64 encoded string
        this.imagen = "data:image/jpeg;base64," + imageData;
        
    }, (err) => {
        console.debug(err);
    });
  }

nuevaIncidencia(){
  let incidencia =  this.nombre + ' de ' + this.nombreMaquina;
  let params= new Incidencia(null,null,incidencia,'',parseInt(sessionStorage.getItem("iduser")),
  parseInt(localStorage.getItem("idempresa")),'Maquinaria',null ,'mantenimientos_realizados',this.idMaquina,this.imagen,'',-1)
  //this.navCtrl.push(IncidenciasPage,params);
  this.servidor.setIncidencia(params);
  this.goTo('/incidencias');
  this.events.subscribe('nuevaIncidencia', (param) => {
    // userEventData is an array of parameters, so grab our first and only arg
    console.log('Id Incidencia Local', param);
    this.hayIncidencia = param.idLocal;
    this.servidor.setIncidencia(null);
  });
}



}
