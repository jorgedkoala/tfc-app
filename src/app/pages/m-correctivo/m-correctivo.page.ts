import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { URLS, maquina, mantenimientoRealizado } from '../../models/models';
import * as moment from 'moment';
import {SyncPage} from '../sync/sync.page';
import { Initdb } from '../../services/initdb';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-m-correctivo',
  templateUrl: './m-correctivo.page.html',
  styleUrls: ['./m-correctivo.page.scss'],
  providers: [SyncPage]
})
export class MCorrectivoPage implements OnInit {

  public maquinas: maquina[];
  public piezas:object[];
  public machine: number;
  public nombreMaquina:string;
  public mantenimientoRealizado: mantenimientoRealizado;
  public hoy: Date = new Date();
  public imagen:string="";

  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public platform: Platform,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  private sync: SyncPage,
  private initdb: Initdb,
  public camera: Camera,
  ) {
    this.mantenimientoRealizado = new mantenimientoRealizado(null,null,null,null,'',moment(this.hoy).toDate(),
        moment(this.hoy).toDate(),parseInt(localStorage.getItem("idusuario")),'','','',"interno","correctivo",
        '','',parseInt(localStorage.getItem("idempresa")),'');
  }

  //*************  INIT *************/
  ngOnInit() {
    this.platform.ready().then(
      ()=>{
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
        this.getMaquinas();
      });
  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link, {replaceUrl:true});
  }

  //*************  FUNCTIONS *************/


  getMaquinas(){

    this.maquinas =[];

                    //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
                    //this.checklistList = data.rows;
                    this.db.create({name: "data.db", location: "default"}).then((sql: SQLiteObject) => {
                    sql.executeSql("Select * FROM maquinas ORDER BY nombreMaquina", []).then(
                      (data) => {
                    console.log('NUM Maquinas:',data.rows.length);
                        for (var index=0;index < data.rows.length;index++){
                          this.maquinas.push(new maquina(data.rows.item(index).idMaquina, data.rows.item(index).nombreMaquina));
                      }
                    console.log ("Maquinas:", this.maquinas);
                }, (error) => {
                    console.log("ERROR home maquinas. 823-> ", error);
                    alert("error home Maquinas. 824" + error);
                }); 
               //});
               console.log("Fin  Maquinas",new Date());
  });
}


terminar(){

if (this.machine >0){
  
  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
  let fecha = moment(this.mantenimientoRealizado.fecha).format('YYYY-MM-DD');

      db2.executeSql('INSERT INTO mantenimientosrealizados (idmantenimiento, idmaquina, maquina, mantenimiento, fecha_prevista,fecha,idusuario, responsable, descripcion, elemento, tipo,tipo2,causas,tipo_evento, idempresa, imagen, pieza,cantidadPiezas ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [0,this.machine,this.nombreMaquina,
          this.mantenimientoRealizado.mantenimiento,fecha,fecha,this.mantenimientoRealizado.idusuario,
          this.mantenimientoRealizado.responsable,this.mantenimientoRealizado.descripcion,
          this.mantenimientoRealizado.elemento,this.mantenimientoRealizado.tipo,
          this.mantenimientoRealizado.tipo2,this.mantenimientoRealizado.causas,
          this.mantenimientoRealizado.tipo_evento,this.mantenimientoRealizado.idempresa,this.imagen,
        this.mantenimientoRealizado.pieza,this.mantenimientoRealizado.cantidadPiezas]).then(
  (Resultado) => {

      localStorage.setItem("syncmantenimientos", (parseInt(localStorage.getItem("syncmantenimientos")) + 1).toString());
      //this.initdb.badge += 1;
      if (this.network.type != 'none') {
        console.debug("conected");
        // this.sync.sync_mantenimientos();
        //this.navCtrl.pop();
        this.goTo();
      }
      else {
        console.debug("update badge syncmantenimientos");
        //this.navCtrl.pop();
        this.goTo();
      }
      
  },
  (error) => {
    console.debug('ERROR INSERTANDO MR', error);
  });
},
  (error) => {console.debug(JSON.stringify(error))});

}else{
  //NO HAY MAQUINA
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

cambia(id:number){
  let index = this.maquinas.findIndex((maquina)=>maquina.idMaquina == id)
  this.nombreMaquina = this.maquinas[index].nombreMaquina;
  console.log('CAMBIO MAQUINA:',id,index,this.maquinas[index].idMaquina);
  this.getPiezas(this.maquinas[index].idMaquina);
}
cambiaPieza(idPieza:number){
console.log(idPieza);
}

getPiezas(idMaquina){
  console.log(idMaquina)
  this.piezas =[];
  this.db.create({name: "data.db", location: "default"}).then((sql: SQLiteObject) => {
  sql.executeSql("Select * FROM piezas WHERE idmaquina= 0 OR idmaquina = ? ORDER BY id", [idMaquina]).then(
    (data) => {
  console.log('NUM Piezas:',data.rows.length);
      for (var index=0;index < data.rows.length;index++){
        this.piezas.push({'id':data.rows.item(index).id, 'nombre':data.rows.item(index).nombre});
    }
    this.piezas.unshift({'id':0, 'nombre':'ninguna'});
  console.log ("piezas:", this.piezas);
}, (error) => {
  console.log("ERROR pieszas.-> ", error);
  //alert("error home Maquinas. 824" + error);
}); 
//});
console.log("Fin  Piezas");
});

}
  
}
