import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';



import { Router, Event as NavigationEvent, NavigationEnd, ChildActivationStart } from '@angular/router';
import {TranslateService  } from '@ngx-translate/core';

import { Observable,pipe } from 'rxjs';
import { MenuController, Events } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

// import {LoginPage} from '../pages/login/login.page';
// import {ControlPage} from '../pages/control/control.page';
// import { CheckPage } from '../pages/check/check.page';
import { SyncPage } from '../pages/sync/sync.page';
import { AppComponent } from '../app.component';
// import { CheckLimpiezaPage } from '../pages/check-limpieza/check-limpieza.page';
// import { MantenimientoPage } from '../pages/mantenimiento/mantenimiento.page';
// import { MCorrectivoPage } from '../pages/m-correctivo/m-correctivo.page';

// import { SupervisionPage } from '../pages/supervision/supervision.page';
// import {EmpresaPage } from '../pages/empresa/empresa.page';
import { Sync } from '../services/sync';
import { Servidor } from '../services/servidor';
import { Initdb } from '../services/initdb'

import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { URLS, controlesList, checklistList, checkLimpieza, mantenimiento, limpiezaRealizada,supervisionLimpieza, mantenimientoRealizado, maquina,pieza } from '../models/models'
import * as moment from 'moment';
//import { setTimeout } from 'timers';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [SyncPage, AppComponent]
})
export class HomePage implements OnInit {
  miscontroles: any;
mischecks: any;
mischeckslimpiezas: any;
mismantenimientos: any;
miscalibraciones: any;
mismaquinas:any;
mispiezas:any;
mislimpiezasrealizadas: any;
public cambio: number;
accesomenu: any;
public logoempresa;
public empresa =0;
public controlesList: controlesList[] =[];
public checklistList: checklistList[] = [];
public checkLimpiezas: checkLimpieza[] = [];
public supervisionLimpiezas: supervisionLimpieza[] = [];
public mantenimientos: mantenimiento[]=[];
public calibraciones: mantenimiento[]=[];
public maquinas: maquina[]=[];
public piezas: pieza[]=[];
public loader:any;
public status:boolean[]=[false,false,false,false,false,false,false];
public sql: SQLiteObject;
public Momento = moment();
public cargando: boolean=false;
public tipoUser: string=localStorage.getItem("tipoUser");
public superuser: number=parseInt(localStorage.getItem("superuser"));
public moduloMantenimiento:boolean=false;

  constructor(
    private platform: Platform,
    public router: Router,
     public translate: TranslateService,
     public menu: MenuController, 
     private data:Initdb, 
    private sync: Sync,
    public syncPage: SyncPage,
    private servidor: Servidor, 
    public db :SQLite,
    public network:Network,
    public loadingCtrl: LoadingController, 
    //public params: NavParams, 
    public events: Events,
    public appComponent: AppComponent
  ){
    console.log('**********************CONSTRUCTOR HOME LLAMADO*******************************')
    this.checkEstados()
  }

    //*************  INIT *************/
    changeProov(){
      this.menu.get().then(
        (resultado)=>{
          console.log('MENU',resultado);
        }
      )
    }

  checkEstados(){
    this.platform.ready().then(() => {
      this.checkProveedores();
    console.log("Checking estados...");
    this.network.onDisconnect().subscribe(
      estado=>{
        console.log('desconectado diferencia:',estado.timeStamp - this.data.momentoCambioEstado);
        this.data.hayConexion = false;
        if(estado.timeStamp - this.data.momentoCambioEstado > 1){
          this.data.momentoCambioEstado = estado.timeStamp;
        }else{
          console.log('poca diferencia', estado.timeStamp - this.data.momentoCambioEstado);
        }
      }
    );
    this.network.onConnect().subscribe(
        estado=>{
          console.log('conectado diferencia:',estado.timeStamp - this.data.momentoCambioEstado);
          this.data.momentoCambioEstado = estado.timeStamp;
          console.log ('lestado conexion',this.data.hayConexion);
          if (!this.data.hayConexion){
            console.log ('se procesará si badge',estado);
          this.data.hayConexion = true;
          let badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"));
          if (badge > 0){
            this.syncData();
          }
        }
        }
      );

    this.cargando = true;
    let login = this.data.logged;
        if ((login === undefined || login == null)) {
          console.log("goto login...");
          this.goTo('/login');
        } else {
          this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            console.log("this create db");
            this.sql = db2;
            console.log("db2",this.sql);
//            if (!this.cargando) this.cargaListas();
          if (this.network.type != 'none') {
            console.log("SIN RED...");
            if (localStorage.getItem("versioncontrols") === null || this.data.newDB) {
              this.callSincroniza();
            } else {
              console.log("HAY .RED CHECK UPDATES..");
              this.hayUpdates().then(
                (versionActual) => {
                  console.log("versionActual Controles", versionActual);
                  if (versionActual > parseInt(localStorage.getItem("versioncontrols"))) {
                    this.callSincroniza(versionActual);
                  } else {
                    this.cargaListas();
                  }
                });
            }
            this.refreshlogo();
          } else {
            alert('No hay conexión, para sincronizar los datos');
            this.cargaListas();
          }
          });
        }
      });
  }

  ngOnInit(){
    this.platform.ready().then(() => {
      this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(
        (routerEvent: NavigationEvent)=>{
            console.log('ROUTER EVENT SI HOMEPAGE',routerEvent["url"])
            switch(routerEvent["url"]){
              case "/home/mantenimientos":
                  this.getMantenimientos();
                  this.getCalibraciones();
                break;
              case "/mantenimiento":
                  this.getMantenimientos();
                  this.getCalibraciones();
                break;
              case "/home/checks":
                    this.getChecklists();
                    break;
              case "/check":
                  this.getChecklists();
                break;
              case "/home/controles":
                    this.getControles();
                    break;
              case "/control":
                  this.getControles();
                break;
              case "/home/check-limpieza":
                    this.getLimpiezas();
                    this.getLimpiezasRealizadas();
                break;
              case "/check-limpieza":
                  this.getLimpiezas();
                  this.getLimpiezasRealizadas();
                break;
              case "/supervision":
                  console.log('supervision');
                  this.getLimpiezasRealizadas();
                break;
              case "/home/supervision":
                  console.log('/home/supervision');
                  this.getLimpiezasRealizadas();
                break;
            }
            //this.cargaListas();
          


        })

    this.cambio=0;
    console.log("didEnter...");
    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      this.sql = db2;
      console.log("db2 ok...",this.sql);
    if (!this.cargando) this.cargaListas();
    });
    this.events.subscribe('sync',(param)=>{
      console.log('#####',param.estado);
      if (param.estado == 'start'){
        this.presentLoading();
      }else{
        this.closeLoading();
      }
    })
  });
  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link);
  }

//********************FUNCIONES */

syncData(){
  console.log ('a sincronizar');
      this.syncPage.sync_data();
}



callSincroniza(versionActual?){
  this.data.newDB=false;
this.Momento = moment();
console.log("Inicio callSincroniza",this.Momento.format("mm:ss"));
        this.presentLoading();
        if (versionActual) versionActual = versionActual.toString();
        this.sincronizate(versionActual).subscribe(
        (valor)=>{
          console.log("1", valor);
          switch(valor){
            case "controles":
              this.status[0] = true;
              break;
            case "checklists":
            this.status[1] = true;
            break;
            case "limpiezas":
            this.status[2] = true;
            break;
            case "mantenimientos":
            this.status[3] = true;
            break;
            case "calibraciones":
            this.status[4] = true;
            break;
            case "maquinas":
            this.status[5] = true;
            break;
            case "limpiezasRealizadas":
            this.status[6] = true;
            break;
            case "piezas":
            this.status[7] = true;
            break;
          }
          console.log(this.status, moment(this.Momento).diff(moment(), 'seconds'));
          if (this.status[0] && this.status[1] && this.status[2] && this.status[3] && this.status[4] && this.status[5]  && this.status[6] && this.status[7]){
           console.log("STATUS 6", moment(this.Momento).diff(moment(), 'seconds'));

            if (!(versionActual>0)) localStorage.setItem("versioncontrols","0");
            setTimeout(()=>{ 
              this.cargaListas();
              this.status=[false,false,false,false,false,false,false];
      this.closeLoading();
      },500);
          }
        },
        (error)=>console.log(error)
      );
}

cargaListas(){
this.cargando=true;
console.log("Inicio CargaListas", moment(this.Momento).diff(moment(), 'seconds'));
      this.getControles();
      this.getChecklists();
      this.getLimpiezas();
      this.getLimpiezasRealizadas();
        this.getMantenimientos();
        this.getCalibraciones();
      
console.log("Fin CargaListas", moment(this.Momento).diff(moment(), 'seconds')); 
setTimeout(()=>{
this.cargando = false;
},100);
}

hayUpdates() {
let updates:number = -1;
let parametros = '&idempresa=' + localStorage.getItem("idempresa")+"&entidad=empresas";
return new Promise(resolve => {
  this.servidor.getObjects(URLS.VERSION_USERS, parametros).subscribe(
    response => {

      if (response.success == 'true' && response.data) {
        for (let element of response.data) {
          updates = element.updatecontrols;
        }
        resolve(updates);
      }
  },
  (error)=>{
    console.log(error)
    resolve('Error en hay updates() home# 161' + updates);
},
  ()=>{
      
  });
});
  //return updates;
}




refreshlogo(){
this.empresa = parseInt(localStorage.getItem("idempresa"));
// this.logoempresa = "url("+URLS.SERVER + "logos/"+localStorage.getItem("idempresa")+"/logo.jpg)";
this.logoempresa = URLS.SERVER + "logos/"+localStorage.getItem("idempresa")+"/logo.jpg";
console.log('LOGO',this.logoempresa);

}
sincronizate(version? : string){
console.log("sincronizando...");
//CONTROLES
//CONTROLES
// DESCARGA CONTROLES ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
return new Observable((response)=> {     
      this.sync.getMisControles(this.data.logged).subscribe(
      data => {
        //test
        this.miscontroles = JSON.parse(data.json());
        console.log('resultado' + this.miscontroles.success);
        //console.log('success: ' +this.miscontroles.data[0].nombre);
        if (this.miscontroles.success){
        //test
         this.miscontroles = this.miscontroles.data;
         if (this.miscontroles){
          //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            this.sql.executeSql("delete from controles",[]).then((data) => {
                //console.log(JSON.stringify(data.res));
                let argumentos=[];
                let valores='';
                this.miscontroles.forEach (control => {
                  //this.saveControl(control)
                 argumentos.push ('(?,?,?,?,?,?,?,?,?,?,?,?)');
                 valores += "("+control.id+","+control.idusuario+",'"+control.nombre+"','"+control.pla+"',"+control.valorminimo+","+control.valormaximo+","+control.objetivo+","+control.tolerancia+","+control.critico+",'"+control.fecha_+"','"+control.periodicidad2+"','"+this.checkPeriodo(control.periodicidad2)+"'),";           
                });
                valores = valores.substr(0,valores.length-1);
                 let query = "INSERT INTO controles (id,idusuario, nombre, pla, minimo, maximo, objetivo, tolerancia, critico,fecha,periodicidad,frecuencia) VALUES" + valores;
                 console.log('########',query);

                this.sql.executeSql("INSERT INTO controles (id,idusuario, nombre, pla, minimo, maximo, objetivo, tolerancia, critico,fecha,periodicidad,frecuencia) VALUES" + valores ,[])
                .then((data) => {
                  console.log('***********OK INSERT CONTROLES', data)
                },
                (error)=>{ 
                  console.log('***********ERROR CONTROLES', error)
                });

                }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error));
                //alert("Error 1");
              } );

          //});
         }
          response.next('controles');
         //this.miscontroles.forEach (control => this.saveControl(control));
        }
      },
      err => console.error(err),
      () => {
        if (version) localStorage.setItem("versioncontrols",version);
       // this.getControles();
      }

  );  

  //CONTROLES
  //CONTROLES
//CHECKLISTS
//CHECKLISTS
// DESCARGA CHECKLISTS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
      
      this.sync.getMisChecklists(this.data.logged).map(res => res.json()).subscribe(
      data => {
         this.mischecks = JSON.parse(data);
              console.log('resultado check: ' + this.mischecks.success);
          //    console.log('success check: ' +this.mischecks.data[0].nombre);
          if (this.mischecks.success){
            console.log ("if");
            //test
              this.mischecks = this.mischecks.data;
              if (this.mischecks){
              console.log("mischecklists: " + this.mischecks);
             //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
              this.sql.executeSql("delete from checklist",[]).then((data) => {
                console.log("total chacklists:",this.mischecks.length);
                console.log("total chacklists:",this.mischecks);
                let argumentos=[];
                let valores='';
                this.mischecks.forEach (checklist => {
                 // this.saveChecklist(checklist)
                 argumentos.push ('(?,?,?,?,?,?,?,?)');
                  valores += "("+checklist.idchecklist+","+checklist.idusuario+",'"+checklist.nombrechecklist+"',"+checklist.id+",'"+checklist.nombre+"','"+checklist.fecha_+"','"+checklist.periodicidad2+"','"+this.checkPeriodo(checklist.periodicidad2)+"'),";
                 //valores.push([fila]);
                });
                valores = valores.substr(0,valores.length-1);
                let query = "INSERT INTO checklist (idchecklist,idusuario, nombrechecklist, idcontrol, nombrecontrol,fecha,periodicidad,frecuencia) VALUES " + valores;
                console.log('########',query);
                this.sql.executeSql("INSERT INTO checklist (idchecklist,idusuario, nombrechecklist, idcontrol, nombrecontrol,fecha,periodicidad,frecuencia) VALUES " + valores ,[])
                .then((data) => {
                  console.log('***********OK INSERT CHECKLIST', data)
                },
                (error)=>{ console.log('***********ERROR CHECKLISTS', error)});
                   
            //this.sql.executeSql("INSERT INTO checklist (idchecklist,idusuario, nombrechecklist, idcontrol, nombrecontrol) VALUES ("+checklist+")").then((data) => {console.log('*****************FIN')});

                console.log(JSON.stringify(data.res));
                }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error));
                //alert("Error 2");
              } );
          //});
              }
          response.next('checklists');
                //this.mischecks.forEach (checklist => this.saveChecklist(checklist));
            }
        },
      err => console.error(err),
      () => {
        if (version) localStorage.setItem("versioncontrols",version);
        //this.getChecklists();
      }
  );  
  //CHECKLISTS
  //CHECKLISTS


//LIMPIEZAS
//LIMPIEZAS
// DESCARGA LIMPIEZAS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
      
      this.sync.getMisLimpiezas(this.data.logged).map(res => res.json()).subscribe(
      data => {
         this.mischeckslimpiezas = JSON.parse(data);
              console.log('resultado checklimpieza: ' + this.mischeckslimpiezas.success);
          //    console.log('success check: ' +this.mischecks.data[0].nombre);
          if (this.mischeckslimpiezas.success){
            console.log ("if");
            //test
              this.mischeckslimpiezas = this.mischeckslimpiezas.data;
              if (this.mischeckslimpiezas){
              console.log("mischecklistslimpiezaas: " + this.mischeckslimpiezas);
           //  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
              this.sql.executeSql("delete from checklimpieza",[]).then((data) => {
                let argumentos=[];
                let valores='';
                this.mischeckslimpiezas.forEach (checklimpieza => 
              {
                //    this.saveChecklimpieza(checklimpieza)

                 argumentos.push ('(?,?,?,?,?,?,?)');
                 valores += "("+checklimpieza.idlimpiezazona+","+checklimpieza.idusuario+",'"+checklimpieza.nombrelimpieza+"',"+checklimpieza.id+",'"+checklimpieza.nombre+"','"+checklimpieza.fecha+"','"+checklimpieza.tipo+"','"+checklimpieza.periodicidad+"','"+checklimpieza.productos+"','"+checklimpieza.protocolo+"','"+checklimpieza.responsable+"',"+checklimpieza.supervisor+"),";           
                });
                valores = valores.substr(0,valores.length-1);
                //idlimpiezazona,idusuario, nombrelimpieza, idelemento, nombreelementol, fecha, tipo, periodicidad ,productos,protocolo,responsable ) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
                let query = "INSERT INTO checklimpieza ( idlimpiezazona,idusuario, nombrelimpieza, idelemento, nombreelementol, fecha, tipo, periodicidad ,productos,protocolo,responsable,supervisor ) VALUES " + valores;
                console.log('########',query);

                this.sql.executeSql(query,[])
                .then((data) => {
                  console.log('***********OK INSERT LIMPIEZASREALIZADAS', data)
                },
                (error)=>{ console.log('***********ERROR CHECKLIMPIEZA', error)});
                console.log(JSON.stringify('deleted limpiezas: ',data.res));
                }, (error) => {
                console.log("ERROR home. 211 delete mislimpiezas-> " + JSON.stringify(error));
                //alert("Error 2");
              } );
          //});
              }
            response.next('limpiezas');
                //this.mischecks.forEach (checklist => this.saveChecklist(checklist));
            }
        },
      err => console.error(err),
      () => {
        if (version) localStorage.setItem("versioncontrols",version);
       // this.getChecklists();
      }
  );  
  //LIMPIEZAS
  //LIMPIEZAS

//MANTENIMIENTOS
//MANTENIMIENTOS
// DESCARGA MANTENIMIENTOS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
      
this.sync.getMisMantenimientos(this.data.logged).map(res => res.json()).subscribe(
data => {
 this.mismantenimientos = JSON.parse(data);
      console.log('resultado mantenimientos: ' + this.mismantenimientos.success);
  //    console.log('success check: ' +this.mischecks.data[0].nombre);
  if (this.mismantenimientos.success){
    //test
      this.mismantenimientos = this.mismantenimientos.data;
      if (this.mismantenimientos){
      console.log("mismantenimientos: ", this.mismantenimientos);
   //  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      this.sql.executeSql("delete from maquina_mantenimiento",[]).then((data) => {
        let argumentos=[];
        let valores='';
        this.mismantenimientos.forEach (mantenimiento => 
      {
         argumentos.push ('(?,?,?,?,?,?,?,?)');
         valores += "("+mantenimiento.id+","+mantenimiento.idusuario+","+mantenimiento.idMaquina+",'"+mantenimiento.nombreMaquina+"','"+mantenimiento.nombre+"','"+mantenimiento.fecha+"','"+mantenimiento.tipo+"','"+mantenimiento.periodicidad+"','"+mantenimiento.responsable+"',"+mantenimiento.orden+"),";           
        });
        valores = valores.substr(0,valores.length-1);
        //idlimpiezazona,idusuario, nombrelimpieza, idelemento, nombreelementol, fecha, tipo, periodicidad ,productos,protocolo,responsable ) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
        let query = "INSERT INTO maquina_mantenimiento ( idmantenimiento, idusuario, idMaquina,  nombreMaquina,nombre, fecha, tipo,  periodicidad,responsable,  orden ) VALUES " + valores;
        console.log('########',query);

        this.sql.executeSql(query,[])
        .then((data) => {
          console.log('***********OK INSERT maquina_MANTENIMIENTOS', data)
        },
        (error)=>{ console.log('***********ERROR maquina_MANTENIMIENTOS', error)});
        console.log(JSON.stringify('deleted maquina_mantenimientos: ',data.res));
        }, (error) => {
        console.log("ERROR home. 211 delete mismantenimientos-> " + JSON.stringify(error));
        //alert("Error 2");
      } );
  //});
      }
    response.next('mantenimientos');
        //this.mischecks.forEach (checklist => this.saveChecklist(checklist));
    }
},
err => console.error(err),
() => {
if (version) localStorage.setItem("versioncontrols",version);
// this.getChecklists();
}
);  
//MANTENIMIENTOS 
//MANTENIMIENTOS

//CALIBRACIONES
//CALIBRACIONES
// DESCARGA CALIBRACIONES ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
      
this.sync.getMisCalibraciones(this.data.logged).map(res => res.json()).subscribe(
data => {
 this.miscalibraciones = JSON.parse(data);
      console.log('resultado miscalibraciones: ' + this.miscalibraciones.success);
  //    console.log('success check: ' +this.mischecks.data[0].nombre);
  if (this.miscalibraciones.success){
    //test
      this.miscalibraciones = this.miscalibraciones.data;
      if (this.miscalibraciones){
      console.log("miscalibraciones: ", this.miscalibraciones);
   //  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      this.sql.executeSql("delete from maquina_calibraciones",[]).then((data) => {
        let argumentos=[];
        let valores='';
        this.miscalibraciones.forEach (mantenimiento => 
      {
        //    this.saveChecklimpieza(checklimpieza)

        argumentos.push ('(?,?,?,?,?,?,?,?)');
        valores += "("+mantenimiento.id+","+mantenimiento.idusuario+","+mantenimiento.idMaquina+",'"+mantenimiento.nombreMaquina+"','"+mantenimiento.nombre+"','"+mantenimiento.fecha+"','"+mantenimiento.tipo+"','"+mantenimiento.periodicidad+"','"+mantenimiento.responsable+"',"+mantenimiento.orden+"),";           
       });
       valores = valores.substr(0,valores.length-1);
       //idlimpiezazona,idusuario, nombrelimpieza, idelemento, nombreelementol, fecha, tipo, periodicidad ,productos,protocolo,responsable ) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
       let query = "INSERT INTO maquina_calibraciones (idmantenimiento, idusuario, idMaquina,  nombreMaquina,nombre, fecha, tipo,  periodicidad,responsable,  orden ) VALUES " + valores;
       console.log('########',query);

        this.sql.executeSql(query,[])
        .then((data) => {
          console.log('***********OK INSERT CALIBRACIONES', data)
        },
        (error)=>{ console.log('***********ERROR CALIBRACIONES', error)});
        console.log(JSON.stringify('deleted CALIBRACIONES: ',data.res));
        }, (error) => {
        console.log("ERROR home. 211 delete CALIBRACIONES-> " + JSON.stringify(error));
        //alert("Error 2");
      } );
  //});
      }
    response.next('calibraciones');
        //this.mischecks.forEach (checklist => this.saveChecklist(checklist));
    }
},
err => console.error(err),
() => {
if (version) localStorage.setItem("versioncontrols",version);
// this.getChecklists();
}
);  
//CALIBRACIONES
//CALIBRACIONES

//MAQUINAS
//MAQUINAS
// DESCARGA MAQUINAS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
      
this.sync.getMisMaquinas(this.data.logged).map(res => res.json()).subscribe(
data => {
 this.mismaquinas = JSON.parse(data);
      console.log('resultado mismaquinass: ' + this.mismaquinas.success);
  //    console.log('success check: ' +this.mischecks.data[0].nombre);
  if (this.mismaquinas.success){
    //test
      this.maquinas = this.mismaquinas.data;
      if (this.maquinas){
      console.log("maquinas: ", this.maquinas);
   //  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      this.sql.executeSql("delete from maquinas",[]).then((data) => {
        let argumentos=[];
        let valores='';
        this.maquinas.forEach (maquina => 
      {
        //    this.saveChecklimpieza(checklimpieza)

        argumentos.push ('(?,?)');
        valores += "("+maquina.idMaquina+",'"+maquina.nombreMaquina+"'),";           
       });
       valores = valores.substr(0,valores.length-1);
       //idlimpiezazona,idusuario, nombrelimpieza, idelemento, nombreelementol, fecha, tipo, periodicidad ,productos,protocolo,responsable ) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
       let query = "INSERT INTO maquinas ( idMaquina,nombreMaquina ) VALUES " + valores;
       console.log('########',query);

        this.sql.executeSql(query,[])
        .then((data) => {
          console.log('***********OK INSERT MAQUINAS', data)
        },
        (error)=>{ console.log('***********ERROR MAQUINAS', error)});
        console.log(JSON.stringify('deleted MAQUINAS: ',data.res));
        }, (error) => {
        console.log("ERROR home. 553 delete MAQUINAS-> " + JSON.stringify(error));
        //alert("Error 2");
      } );
  //});
      }
    response.next('maquinas');
        //this.mischecks.forEach (checklist => this.saveChecklist(checklist));
    }
},
err => console.error(err),
() => {
if (version) localStorage.setItem("versioncontrols",version);
// this.getChecklists();
}
);  
//MAQUINAS
//MAQUINAS
//PIEZAS
//PIEZAS
// DESCARGA PIEZAS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
      
this.sync.getMisPiezas(this.data.logged).map(res => res.json()).subscribe(
data => {
 this.mispiezas = JSON.parse(data);
      console.log('resultado mispiezas: ' + this.mispiezas.success);
  //    console.log('success check: ' +this.mischecks.data[0].nombre);
  if (this.mispiezas.success){
    //test
      this.piezas = this.mispiezas.data;
      if (this.piezas){
      console.log("piezas: ", this.piezas);
   //  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      this.sql.executeSql("delete from piezas",[]).then((data) => {
        let argumentos=[];
        let valores='';
        this.piezas.forEach (pieza => 
      {
        //    this.saveChecklimpieza(checklimpieza)
        argumentos.push ('(?,?,?)');
        valores += "("+pieza.id+","+pieza.idmaquina+",'"+pieza.nombre+"'),";           
       });
       valores = valores.substr(0,valores.length-1);
       //idlimpiezazona,idusuario, nombrelimpieza, idelemento, nombreelementol, fecha, tipo, periodicidad ,productos,protocolo,responsable ) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
       let query = "INSERT INTO piezas ( id,idmaquina,nombre ) VALUES " + valores;
       console.log('########',query);

        this.sql.executeSql(query,[])
        .then((data) => {
          console.log('***********OK INSERT PIEZAS', data)
        },
        (error)=>{ console.log('***********ERROR PIEZAS', error)});
        console.log(JSON.stringify('deleted PIEZAS: ',data.res));
        }, (error) => {
        console.log("ERROR home. 626 delete PIEZAS-> " + JSON.stringify(error));
        //alert("Error 2");
      } );
  //});
      }
    response.next('piezas');
        //this.mischecks.forEach (checklist => this.saveChecklist(checklist));
    }
},
err => console.error(err),
() => {
if (version) localStorage.setItem("versioncontrols",version);
// this.getChecklists();
}
);  
//PIEZAS
//PIEZAS

//LIMPIEZAS REALIZADAS
//LIMPIEZAS REALIZADAS
// DESCARGA LIMPIEZAS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.

      this.sync.getMisLimpiezasRealizadas(this.data.logged).map(res => res.json()).subscribe(
      data => {
         this.mislimpiezasrealizadas = JSON.parse(data);
              console.log('resultado limpiezasRealizadas: ' + this.mislimpiezasrealizadas.success);
          //    console.log('success check: ' +this.mischecks.data[0].nombre);
          if (this.mislimpiezasrealizadas.success){
            console.log ("if LIMPIEZAS REALIZADAS.SUCEESS");
            //test
              this.mislimpiezasrealizadas = this.mislimpiezasrealizadas.data;
              //if (this.mislimpiezasrealizadas){
              console.log("mislimpiezasrealizadas: " + this.mislimpiezasrealizadas);
             //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
              this.sql.executeSql("delete from supervisionlimpieza",[]).then((data) => {
                let argumentos=[];
                let valores='';
                if (this.mislimpiezasrealizadas){
                this.mislimpiezasrealizadas.forEach (limpiezaRealizada => {
                //  this.saveLimpiezaRealizada(limpiezarealizada)

                 argumentos.push ('(?,?,?,?,?,?,?)');
                 valores += "("+limpiezaRealizada.id+",'"+limpiezaRealizada.nombre+"',"+limpiezaRealizada.idlimpiezazona+",'"+limpiezaRealizada.nombreZona+"','"+limpiezaRealizada.fecha+"','"+limpiezaRealizada.tipo+"','"+limpiezaRealizada.responsable+"',"+limpiezaRealizada.supervisor+","+limpiezaRealizada.supervision+"),";           
                });
                valores = valores.substr(0,valores.length-1);
                let query = "INSERT INTO supervisionlimpieza (idlimpiezarealizada,  nombrelimpieza,idZona,nombreZona, fecha, tipo,  responsable, idsupervisor, supervision) VALUES " + valores;
                console.log('########',query);

                this.sql.executeSql(query,[])
                .then((data) => {
                  console.log('***********OK INSERT LIMPIEZASREALIZADAS', data)
                },
                (error)=>{ console.log('***********ERROR SUPERVISIONLIMPIEZA', error)});
              }
                console.log(JSON.stringify('deleted limpiezas: ',data.res));
                }, (error) => {
                console.log("ERROR home. 211 delete limpiezas Realizadas-> " + JSON.stringify(error));
                //alert("Error 2");
              } );
          //});
              //}
            response.next('limpiezasRealizadas');
                //this.mischecks.forEach (checklist => this.saveChecklist(checklist));
            }
        },
      err => console.error(err),
      () => {
        if (version) localStorage.setItem("versioncontrols",version);
        //this.getChecklists();
      }
  );  
  //LIMPIEZAS REALIZADAS
  //LIMPIEZAS REALIZADAS
});
}

saveControl(control){
  //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {                
            this.sql.executeSql("INSERT INTO controles (id,idusuario, nombre, pla, minimo, maximo, objetivo, tolerancia, critico) VALUES (?,?,?,?,?,?,?,?,?)",[control.id,control.idusuario,control.nombre,control.pla,control.valorminimo,control.valormaximo,control.objetivo,control.tolerancia,control.critico]).then((data) => {
            //console.log("INSERT CONTROL: " + control.idusuario + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR SAVING CONTROL-> " + JSON.stringify(error));
        });
 // });
}

//   saveChecklist(checklist){
//         //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {            
//                   this.sql.executeSql("INSERT INTO checklist (idchecklist,idusuario, nombrechecklist, idcontrol, nombrecontrol) VALUES (?,?,?,?,?)",[checklist.idchecklist,checklist.idusuario,checklist.nombrechecklist,checklist.id,checklist.nombre]).then((data) => {
//                   console.log("335->INSERT CHECKLIST", moment(this.Momento).diff(moment(), 'seconds'));
//               }, (error) => {
//                   console.log("ERROR SAVING CHECKLIST -> " + JSON.stringify(error));
//               });
//        // });
// }

saveChecklimpieza(checklimpieza){
  //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {            
            this.sql.executeSql("INSERT INTO checklimpieza ( idlimpiezazona,idusuario, nombrelimpieza, idelemento, nombreelementol, fecha, tipo, periodicidad ,productos,protocolo,responsable ) VALUES (?,?,?,?,?,?,?,?,?,?,?)",[checklimpieza.idlimpiezazona,checklimpieza.idusuario,checklimpieza.nombrelimpieza,checklimpieza.id,checklimpieza.nombre,checklimpieza.fecha,checklimpieza.tipo,checklimpieza.periodicidad,checklimpieza.productos,checklimpieza.protocolo,checklimpieza.responsable]).then((data) => {
            //console.log("INSERT CHECKLIMNPIEZA" + checklimpieza.nombrelimpieza + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR SAVING CHECKLIMPIEZA -> " + JSON.stringify(error));
        });
//****EXCEPTION */
            this.sql.executeSql("DELETE from resultadoslimpieza WHERE id > 0",[]).then((data) => {
            console.log("BORRANDO RESULTADOS LIMNPIEZA" + checklimpieza.nombrelimpieza + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR SAVING CHECKLIMPIEZA -> " + JSON.stringify(error));
        });
//****EXCEPTION */
//  });
}
saveLimpiezaRealizada(limpiezaRealizada){
 // this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {  
    console.log("INSERT INTO supervisionlimpieza (idlimpiezarealizada,  nombrelimpieza, fecha, tipo,  responsable, idsupervisor)) VALUES (?,?,?,?,?,?)",limpiezaRealizada.id,limpiezaRealizada.nombre,limpiezaRealizada.fecha,limpiezaRealizada.tipo,limpiezaRealizada.responsable,limpiezaRealizada.supervisor);              
            this.sql.executeSql("INSERT INTO supervisionlimpieza (idlimpiezarealizada,  nombrelimpieza, fecha, tipo,  responsable, idsupervisor, supervision) VALUES (?,?,?,?,?,?,?)",[limpiezaRealizada.id,limpiezaRealizada.nombre,limpiezaRealizada.fecha,limpiezaRealizada.tipo,limpiezaRealizada.responsable,limpiezaRealizada.supervisor,limpiezaRealizada.supervision]).then((data) => {
        }, (error) => {
            console.log("ERROR SAVING limpiezaRealizada-> " + JSON.stringify(error));
        });
//    });
}

getLimpiezasRealizadas() {
console.log("479->Inicio LimpizasRealizadas", moment(this.Momento).diff(moment(), 'seconds'));
this.supervisionLimpiezas=[];
//this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            this.sql.executeSql("SELECT * FROM supervisionlimpieza WHERE idsupervisor = ?",[sessionStorage.getItem("idusuario")]).then((data) => {
            for(let i = 0; i < data.rows.length; i++) {
                this.supervisionLimpiezas.push(new supervisionLimpieza(
                  data.rows.item(i).id,
                  data.rows.item(i).idlimpiezarealizada,
                  data.rows.item(i).idElemento,
                  data.rows.item(i).nombrelimpieza,
                  data.rows.item(i).fecha,
                  data.rows.item(i).tipo,
                  data.rows.item(i).responsable,
                  data.rows.item(i).idsupervisor,
                  null,
                  0,
                  null
                ));
              }
            }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
            alert("error home 276" + JSON.stringify(error.err));
          });  
//});   
console.log("LIMPIEZAS REALIZADAS",  this.supervisionLimpiezas)
console.log("FIN LimpizadasezasReali", moment(this.Momento).diff(moment(), 'seconds'));
}

getControles() {
console.log("397->Inicio controles", moment(this.Momento).diff(moment(), 'seconds'));
let fecha = moment(new Date()).format('YYYY-MM-DD');
this.controlesList=[];
//this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            this.sql.executeSql("SELECT * FROM controles WHERE idusuario = ?  and fecha <= ? ",[sessionStorage.getItem("idusuario"),fecha]).then((data) => {
            for(let i = 0; i < data.rows.length; i++) {
              let isBD = moment(new Date(data.rows.item(i).fecha)).isBefore(moment(), 'day');
                this.controlesList.push({
                "id": data.rows.item(i).id,
                "nombre": data.rows.item(i).nombre,
                "pla": data.rows.item(i).pla,
                "objetivo": data.rows.item(i).objetivo,
                "minimo": data.rows.item(i).minimo,
                "maximo": data.rows.item(i).maximo,
                "tolerancia": data.rows.item(i).tolerancia,
                "critico": data.rows.item(i).critico,
                "fecha": data.rows.item(i).fecha,
                "periodicidad": data.rows.item(i).periodicidad,
                "frecuencia":data.rows.item(i).frecuencia,
                "isbeforedate":isBD
                });
              }
            }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
            alert("error home 276" + JSON.stringify(error.err));
          });  
//});   
console.log("Fin Controles", moment(this.Momento).diff(moment(), 'seconds'));
}

takeControl(control)
{
  this.servidor.setParam(control);
  this.goTo('/control');

// this.navCtrl.push(ControlPage, {control}).then(
// response => {
//   console.log('Response ' + response);
// },
// error => {
//   console.log('Error: ' + error);
// }
// ).catch(exception => {
// console.log('Exception ' + exception);
// });
}



getChecklists(){
console.log("439->Inicio Checklist", moment(this.Momento).diff(moment(), 'seconds'));
let fecha = moment(new Date()).format('YYYY-MM-DD');
this.checklistList =[];
           // this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            //db2.executeSql("Select * FROM checklist WHERE idusuario = ? GROUP BY idlimpiezazona", [sessionStorage.getItem("idusuario")]).then((data) => {
            this.sql.executeSql("Select * FROM checklist WHERE idusuario = ? and fecha <= ?  GROUP BY idchecklist", [sessionStorage.getItem("idusuario"),fecha]).then((data) => {                  
                              
            //this.checklistList = data.rows;
            console.log(data.rows.length);
            if (data.rows.length > 0 ){
                for (var index=0;index < data.rows.length;index++){
                  let isBD = moment(new Date(data.rows.item(index).fecha)).isBefore(moment(), 'day');
                  this.checklistList.push(data.rows.item(index));
                  this.checklistList[index]["isbeforedate"] = isBD;
                  console.log(data.rows.item(index));
                //   this.checklistList.push({
                //         "id":  data.rows.item(index).id,
                //         "idchecklist": data.rows.item(index).idchecklist,
                //         "nombrechecklist": data.rows.item(index).nombrechecklist,
                //         "idcontrol":data.rows.item(index).idcontrol,
                //         "nombrecontrol":data.rows.item(index).nombrecontrol,
                //         "checked":data.rows.item(index).checked,
                //         "idusuario": data.rows.item(index).idusuario,
                //         "descripcion": data.rows.item(index).descripcion,
                // });
                //alert (data.res.rows[index].nombrechecklist);
              }
               console.log("464-> FIN Checklist", moment(this.Momento).diff(moment(), 'seconds'));
            }
            console.log ("checklist:", this.checklistList);
        }, (error) => {
            console.log("ERROR Checklist-> " + JSON.stringify(error.err));
            alert("error home Checklist 325 " + JSON.stringify(error.err));
        }); 
        // });
        console.log("472->FIN Checklist", moment(this.Momento).diff(moment(), 'seconds'));
}

getLimpiezas(){
console.log("476->Inicio limpiezas",moment(this.Momento).diff(moment(), 'seconds'));

            let fecha = moment(new Date()).format('YYYY-MM-DD');
            //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            //this.checklistList = data.rows;
            this.sql.executeSql("Select * FROM checklimpieza WHERE idusuario = ? and fecha <= ?  GROUP BY idlimpiezazona", [sessionStorage.getItem("idusuario"),fecha]).then(
              (data) => {
                this.checkLimpiezas =[];
            //console.log('NUM checklimpiezas:',data.rows.length);
            console.log('***GET LIMPIEZAS');
                for (let index=0;index < data.rows.length;index++){
               //   this.checkLimpiezas.push(new checkLimpieza(data.rows.item(index).id,data.rows.item(index).idLimpieza,))
                  this.checkLimpiezas.push(data.rows.item(index));
                  //console.log('BUCLE:',index,this.checkLimpiezas);
              }
            //console.log ("checkLimpiezas:", this.checkLimpiezas);
        }, (error) => {
            console.log("ERROR home Limpizas. 342-> ", error);
            alert("error home Limpizas. 342" + error);
        }); 
       //});
       console.log("Fin  Limpizas",new Date());
}

getMantenimientos(){
console.log("738->Inicio Mantenimientos",moment(this.Momento).diff(moment(), 'seconds'));
this.mantenimientos =[];

            let fecha = moment(new Date()).format('YYYY-MM-DD');
            let isBD;
            //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            //this.checklistList = data.rows;
            this.sql.executeSql("Select * FROM maquina_mantenimiento WHERE idusuario = ? and fecha <= ?  ORDER BY nombreMaquina, orden", [sessionStorage.getItem("idusuario"),fecha]).then(
              (data) => {
            console.log('NUMmantenimientos:',data.rows.length);
                for (let index=0;index < data.rows.length;index++){
                  isBD = moment(new Date(data.rows.item(index).fecha)).isBefore(moment(), 'day');
               //   this.checkLimpiezas.push(new checkLimpieza(data.rows.item(index).id,data.rows.item(index).idLimpieza,))
                  this.mantenimientos.push(data.rows.item(index));
                  this.mantenimientos[index].isbeforedate = isBD;
              }
            console.log ("mantenimientos:", this.mantenimientos);
        }, (error) => {
            console.log("ERROR home mantenimientos. 752-> ", error);
            alert("error home mantenimientos. 752" + error);
        }); 
       //});
       console.log("Fin  mantenimientoss",new Date());
}
getCalibraciones(){
console.log("738->Inicio Calibraciones",moment(this.Momento).diff(moment(), 'seconds'));
this.calibraciones =[];
            let fecha = moment(new Date()).format('YYYY-MM-DD');
            let isBD;
            //this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            //this.checklistList = data.rows;
            this.sql.executeSql("Select * FROM maquina_calibraciones WHERE idusuario = ? and fecha <= ?  ORDER BY nombreMaquina, orden", [sessionStorage.getItem("idusuario"),fecha]).then(
              (data) => {
            console.log('NUMCalibraciones:',data.rows.length);
                for (var index=0;index < data.rows.length;index++){
                  isBD = moment(new Date(data.rows.item(index).fecha)).isBefore(moment(), 'day');
               //   this.checkLimpiezas.push(new checkLimpieza(data.rows.item(index).id,data.rows.item(index).idLimpieza,))
                  this.calibraciones.push(data.rows.item(index));
                  this.calibraciones[index].isbeforedate = isBD;
              }
            console.log ("Calibraciones:", this.calibraciones);
        }, (error) => {
            console.log("ERROR home Calibraciones. 773-> ", error);
            alert("error home Calibraciones. 774" + error);
        }); 
       //});
       console.log("Fin  Calibraciones",new Date());
}



takeChecklist(checklist){
// this.navCtrl.push(CheckPage,{checklist});
this.servidor.setParam(checklist);
this.goTo('/check');
}

takeLimpieza(limpieza){
console.log('home',limpieza);
this.servidor.setParam(limpieza);

// this.navCtrl.push(CheckLimpiezaPage,{limpieza});
this.goTo('/check-limpieza');
}

takeMCorrectivo(){
this.servidor.setParam(null);

console.log('home',);

// this.navCtrl.push(MCorrectivoPage);
this.goTo('/m-correctivo');
}

takeMantenimiento(mantenimiento,entidad){
console.log('home',mantenimiento);
this.servidor.setParam(mantenimiento,entidad);

// this.navCtrl.push(MantenimientoPage,{mantenimiento,entidad});
this.goTo('/mantenimiento');
}

supervisar(){
// this.navCtrl.push(SupervisionPage);
this.goTo('/supervision');
}


doRefresh(refresher) {
  if (this.network.type != 'none') {
console.log('Begin async operation', refresher);
//this.sincronizate();
this.callSincroniza();
setTimeout(() => {
console.log('Async operation has ended');
refresher.target.complete();
}, 2000);
  }else{
    console.log('No hay Red');
    this.cargaListas();
  }
}

async presentLoading() {
console.log('##SHOW LOADING HOME');
 this.loader = await this.loadingCtrl.create({
 message: "Actualizando...",
 spinner: 'crescent',
// // duration: 3000
 });
 return await this.loader.present();
//loader.dismiss();
}


closeLoading(){
console.log('##HIDE LOADING HOME');
setTimeout(() => {
console.log('Async operation has ended');
this.loader.dismiss();
}, 2500);
}


checkPeriodo(periodicidad: string): string{
if (periodicidad){
let valor:string;
try{
let periodo = JSON.parse(periodicidad);
return periodo.repeticion;
}catch(e){
console.log('**error:',e);
return 'por uso';
} 
}else{
return 'por uso';
}
}





checkProveedores(){

  let paramLogin = '?user=' + sessionStorage.getItem("nombre") + '&password=' +sessionStorage.getItem("password");
  this.servidor.login(URLS.LOGIN, paramLogin).subscribe(
    response => {
      console.log('RESPONSE LOGIN',response);
      if (response["success"] == 'true') {
        localStorage.setItem('token', response["token"]);
        }
  //****************CHECK PROVEEDORES ******************/
  let param = '&idempresa=' + localStorage.getItem("idempresa");
  console.log('MODULO PROVEEDORES START');
  this.servidor.getObjects(URLS.OPCIONES_EMPRESA, param).subscribe(
    response => {
      console.log(response);
      console.log('MODULO PROVEEDORES REQUEST');
      if (response.success == 'true' && response.data) {
        console.log(response.data,response.data.length)
        for (let element of response.data) {
          if (element.opcion == 'Modulo Proveedores'){
            console.log('MODULO PROVEEDORES ACTIVO');
            //this.appComponent.appPages.splice(1,0,{title: 'menu.entradasMP',url: '/entradas-mp',icon: 'cart'});
            //this.appComponent.hayProveedores = true;
            this.sync.proveedoresActivo.next(true);

            this.checkServiciosEntrada();
          }
          if (element.opcion == 'fichas maquinaria'){
            console.log('MODULO MANTENIMIENTO ACTIVO');
            this.moduloMantenimiento=true;;
          }         
          }
      }
  },
error =>{
  console.debug(error);
  console.log('MODULO PROVEEDORES ERROR,' + error);
  },
  ()=>{});


        },
    error=>{console.log('LOGIN ERROR',error)}
    );


}
checkServiciosEntrada(){
  //****************CHECK SERVICIOS DE ENTRADA ******************/
  if (localStorage.getItem("triggerEntradasMP") === null) {
    let parametros = '&idempresa=' + localStorage.getItem("idempresa")+"&entidad=triggers";
    this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
      response => {
        console.log(response);
        if (response.success == 'true' && response.data) {
          console.log(response.data,response.data.length)
          for (let element of response.data) {
            if (element.entidadOrigen == 'proveedores_entradas_producto' && element.entidadDestino=='checklist'){
              localStorage.setItem('triggerEntradasMP',element.idDestino);
            }
            // else{
            //   localStorage.removeItem('triggerEntradasMP');
            // }
            }
        }else{
          localStorage.removeItem('triggerEntradasMP');
          // localStorage.setItem('triggerEntradasMP','0');
        }
    },
error =>{console.debug('hay Trigger servicios entrada', error);});
  }
}


}
