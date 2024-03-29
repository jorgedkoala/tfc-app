import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { Sync } from '../../services/sync';
import { EventosService } from '../../services/eventos.service';

import { ResultadoControl, ResultadoControlLocal, ResultadoCechklist, ResultadosControlesChecklist, checkLimpieza, limpiezaRealizada, Supervision, mantenimientoRealizado, Incidencia,ServicioEntrada, ProveedorLoteProducto } from '../../models/models';

//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Initdb } from '../../services/initdb';
import { Servidor } from '../../services/servidor';
import { URLS } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-sync',
  templateUrl: './sync.page.html',
  styleUrls: ['./sync.page.scss'],
})
export class SyncPage implements OnInit {
  public users: any;
  //public db: SQLite;
  //public db2: SQLite;
  public conexion: boolean = false;
  public badge: number;
  //public myapp:MyApp;
public relationResultadosChecklistEntradas:any[];
public idEntradas:any[];
public intervalo:any;
  constructor(
  public translate: TranslateService,
  public initdb: Initdb, 
  public sync: Sync,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  // public events:Events,
  public eventos: EventosService
  ) {}

  ngOnInit() {
    if (this.network.type != 'none') {
      console.log("conected");
    }
    this.badge = parseInt(localStorage.getItem("synccontrol")) + parseInt(localStorage.getItem("syncchecklist"))+ parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
    console.log('Hello Sync Page');
  }


  alerta(text) {
    alert(text);
  }


login(){
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
}

isTokenExired (token) {
  if (token){
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  //return JSON.parse(window.atob(base64));
  let jwt = JSON.parse(window.atob(base64));
  console.log (moment.unix(jwt.exp).isBefore(moment()));
 return moment.unix(jwt.exp).isBefore(moment());
  }else{
    return true;
  }
}

  sync_data() {
    console.log('%cSYNC DATA FROM','{background:yellow}');
    console.log(this.network.type);
    console.log(this.initdb.badge,typeof(this.initdb.badge));
    if (this.network.type != 'none') {
 let param = '?user=' + sessionStorage.getItem("nombre") + '&password=' +sessionStorage.getItem("password");
    this.servidor.login(URLS.LOGIN, param).subscribe(
      response => {
        if (response["success"] == 'true') {
          // Guarda token en sessionStorage
          localStorage.setItem('token', response["token"]);
        }else{}
      this.sync_data_control();
      this.sync_data_checklist('SYNC');
      this.sync_checklimpieza();
      this.sync_data_supervision();
      // this.sync_mantenimientos();
      this.sync_incidencias(-1,0,'Incidencias');
      this.sync_entradasMP()
      .then((resultadosEntradas)=>{
        clearInterval(this.intervalo);
        console.log('RESULTADOS ENTRADAS',resultadosEntradas,this.idEntradas.length,this.idEntradas);
        this.idEntradas.forEach((entrada)=>{
          console.log('SYNC ENTRADASMP',entrada,this.relationResultadosChecklistEntradas);
          if(entrada.idResultadoChecklistLocal){
            console.log('SYNC ENTRADASMP',entrada,this.relationResultadosChecklistEntradas);
            let indiceRelation = this.relationResultadosChecklistEntradas.findIndex((resultadoChecklist)=>resultadoChecklist.idResultadoChecklistLocal==entrada.idResultadoChecklistLocal);
            if (indiceRelation > -1)
            this.sync_serviciosEntrada(this.relationResultadosChecklistEntradas[indiceRelation].idResultadoChecklist,entrada.idResultadoChecklistLocal,{'id':entrada.id,'albaran':entrada.albaran});
          }
        })
        
      });
          });
    }
    else {
      this.translate.get("alertas.conexion").subscribe(resultado => alert(resultado));
    }
  }

  sync_data_control() {
    //alert("hay sinc");
    //this.db2 = new SQLite();
    
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      console.log("base de datos abierta 1");


      db2.executeSql("select id,idcontrol,resultado,fecha,foto, idusuario from resultadoscontrol", []).then((data) => {
        console.log("executed sql" + data.rows.length);
        if (data.rows.length > 0) {
          let arrayfila = [];
          for (let fila = 0; fila < data.rows.length; fila++) {

            console.log(data.rows.item(fila));
            //let checklist = new ResultadoCechklist ()
            //arrayfila.push(data.rows.item(fila))
            arrayfila.push(new ResultadoControlLocal(data.rows.item(fila).idcontrol, data.rows.item(fila).resultado, data.rows.item(fila).fecha, data.rows.item(fila).foto, data.rows.item(fila).idusuario, data.rows.item(fila).id));
          }
          arrayfila.forEach((fila)=>{
           //*******INICIO FOREACH */   
           console.log('FILA CONTROL', fila);
           let newArray = [new ResultadoControl(fila.idcontrol, fila.resultado, fila.fecha, fila.foto, fila.idusuario)];     
          this.sync.setResultados(JSON.stringify(newArray), "resultadoscontrol")
            .subscribe(data => {
              console.log("control5",data);
              this.sync_incidencias(fila.idLocal, data.id, 'Controles');
              this.updateFechaElemento(fila.idcontrol,'controles','id');
              localStorage.setItem("synccontrol", "0");
              this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
              this.badge = parseInt(localStorage.getItem("synccontrol")) + parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
            },
            error => 
            console.log("control6" + error)
            ,
            () => 
            console.log("ok")
          );
          //*******FIN FOREACH */
        });
        this.eventos.setProcesing({'estado':'stop'});
        }
      }, (error) => {
        console.log(error);
        alert("error, no se han podido sincronizar todos los datos [resultadoscontroles] " + error.message);
      });

    }, (error) => {
      console.log("ERROR al abrir la bd: ", error);
    });

  }
  updateFechaElemento(idElemento:number,entidad:string, identificador:string) {
    if (this.network.type != 'none') {
      let fecha = moment(new Date()).format('YYYY-MM-DD');
      let proxima_fecha = '';
      let idusuario = sessionStorage.getItem("idusuario");
      this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
        db2.executeSql("Select * FROM " + entidad + " WHERE " + identificador + " = ? AND fecha >= ? AND idusuario= ?", [idElemento, fecha, idusuario]).then((data) => {
          let proxima_fecha;
          console.log('resultados update fecha',data.rows.length);
          if (data.rows.length){
          for (var index = 0; index < data.rows.length; index++) {
            proxima_fecha = moment(data.rows.item(index).fecha).format('YYYY-MM-DD');
          }
        }else{
          proxima_fecha = moment().format('YYYY-MM-DD');
        }
          let param = "?entidad=" + entidad + "&id=" + idElemento;
          let control;
          if (entidad == 'controles' || entidad == 'checklist'){
           control = { fecha_: proxima_fecha};
          }else{
            control = { fecha: proxima_fecha};
          }
          console.log(control);
          console.log('UPDATING REMOTE DATE',entidad,idElemento,identificador,control);
          this.servidor.putObject(URLS.STD_FECHA, param, control).subscribe(
            (resultado:any) =>{
              // resultado=JSON.parse(resultado)
              console.log('UPDATING REMOTE DATE: RESULTADO: ',resultado);
              // resultado = JSON.parse(resultado.toString())
              // console.log('UPDATING REMOTE DATE: RESULTADO: ',resultado);
              if (resultado["success"] == "nuevaFecha"){
              db2.executeSql("UPDATE " + entidad + " SET fecha  = ? WHERE " + identificador + " = ?", [resultado["nuevaFecha"], idElemento]).then((data) => {
                console.log('UPDATING LOCAL DATE',entidad,resultado["nuevaFecha"]);
              },
            (error)=>{console.log('ERRORLOG',error)});
              }
            },
            (error) =>{console.log('********',error);},
            () => {});
        },
      (error)=>{console.log('error select update Fecha',error);});
      });
    }
  }

  sync_data_checklist(from?) {
    console.log('%cSYNC CHECKLIST FROM '+from,'{background:yellow}');
    this.relationResultadosChecklistEntradas=[];
    //this.db = new SQLite();
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      // console.log("base de datos abierta");


      db2.executeSql("select idlocal,idchecklist,fecha,foto, idusuario from resultadoschecklist", []).then((data) => {
        if (data.rows.length > 0) {
          console.log('@@@CHECKLIST TO SYNC:',data.rows.length);
          for (let fila = 0; fila < data.rows.length; fila++) {
            let resultadoChecklist = new ResultadoCechklist(data.rows.item(fila).idlocal, data.rows.item(fila).idchecklist, data.rows.item(fila).fecha, data.rows.item(fila).foto, data.rows.item(fila).idusuario)

            let idlocal = data.rows.item(fila).idlocal;
            //let arrayfila =[data.rows.item(fila)];
            let arrayfila = [resultadoChecklist];
            arrayfila.push()
            let idrespuesta = this.sync.setResultados(JSON.stringify(arrayfila), "resultadoschecklist")
              .subscribe(data => {
                data = JSON.parse(data)
                console.log(data);
                this.relationResultadosChecklistEntradas.push({'idResultadoChecklist':data.id,'idResultadoChecklistLocal':idlocal});
                console.log('SET RELATION ENTRADASMP','idResultadoChecklist:',data.id,'idResultadoChecklistlocal:',idlocal);
                this.sync_incidencias(idlocal, data.id, 'Checklists');
                this.sync_checklistcontroles(data.id, idlocal);
                //console.log('@@@ENTRADA ID:',this.servidor.getIdEntrada());
                let entrada1=this.servidor.getIdEntrada();
                console.log('@@@ENTRADA ID:',entrada1);
                if (entrada1){
                this.sync_serviciosEntrada(data.id, idlocal,entrada1)
                }
                arrayfila.forEach((checklist)=>{this.updateFechaElemento(checklist.idchecklist,'checklist','idchecklist');})
                
              });
            console.log("returned" + idrespuesta);
          }
          localStorage.setItem("syncchecklist", "0");
          this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
          this.badge = parseInt(localStorage.getItem("synccontrol")) + parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
        }
      }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
        alert("error, no se han podido sincronizar todos los datos [resultadoschecklist]" + JSON.stringify(error.err));
      });

    }, (error) => {
      console.log("ERROR al abrir la bd: ", error);
    });
  }

  sync_checklistcontroles(id, idlocal) {
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      console.log("base de datos abierta 2");

      console.log("send: " + id + " idlocal= " + idlocal);
      db2.executeSql("select idcontrolchecklist,  " + id + " as idresultadochecklist ,resultado,descripcion,fotocontrol from resultadoscontroleschecklist WHERE idresultadochecklist = ?", [idlocal]).then((data) => {
        console.log(data.rows.length);
        if (data.rows.length > 0) {
          let arrayfila = [];
          for (let fila = 0; fila < data.rows.length; fila++) {
            console.log(data.rows.item(fila));

            //arrayfila.push(data.rows.item(fila))
            arrayfila.push(new ResultadosControlesChecklist(data.rows.item(fila).idcontrolchecklist, data.rows.item(fila).idresultadochecklist, data.rows.item(fila).resultado, data.rows.item(fila).descripcion, data.rows.item(fila).fotocontrol))
          }
          this.sync.setResultados(JSON.stringify(arrayfila), "resultadoscontroleschecklist")
            .subscribe(data => { console.log("control3") },
            error => console.log("control4" + error),
            () => console.log("fin"));
        }
      }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error));
        alert("error, no se han podido sincronizar todos los datos [resultadoscontrolchecklist]" + JSON.stringify(error));
      });
    }, (error) => {
      console.log("ERROR al abrir la bd: ", error);
    });

  }


  sync_checklimpieza() {
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      console.log("base de datos abierta 3");

      console.log("send limpiezas: ");
      db2.executeSql("select * from resultadoslimpieza ", []).then((data) => {
        console.log(data.rows.length);
        let param = "&entidad=limpieza_realizada";
        let arrayfila = [];// : limpiezaRealizada[]=[];
        if (data.rows.length > 0) {

          for (let fila = 0; fila < data.rows.length; fila++) {
           // let arrayfila = [];
            //arrayfila.push(new limpiezaRealizada(null, data.rows.item(fila).idelemento, data.rows.item(fila).idempresa, data.rows.item(fila).fecha_prevista, data.rows.item(fila).fecha, data.rows.item(fila).nombre, data.rows.item(fila).descripcion, data.rows.item(fila).tipo, data.rows.item(fila).idusuario, data.rows.item(fila).responsable, data.rows.item(fila).idlimpiezazona))
            let limpieza = new limpiezaRealizada(null, data.rows.item(fila).idelemento, data.rows.item(fila).idempresa, data.rows.item(fila).fecha_prevista, data.rows.item(fila).fecha, data.rows.item(fila).nombre, data.rows.item(fila).descripcion, data.rows.item(fila).tipo, data.rows.item(fila).idusuario, data.rows.item(fila).responsable, data.rows.item(fila).idlimpiezazona, data.rows.item(fila).idsupervisor);
            //arrayfila.push(data.rows.item[fila]);
            let idUser = data.rows.item(fila).idusuario;
            this.servidor.postObject(URLS.STD_ITEM, limpieza, param).subscribe(
              response => {
                console.log(response);
                response=JSON.parse(response.toString());
                console.log(response);
                if (response["success"]) {
                  this.updateFechaElementoLimpieza(data.rows.item(fila).idelemento,data.rows.item(fila),idUser);
                  //this.sync_incidencias(fila.idLocal, data.id, 'Controles');
                  this.sync_incidencias(data.rows.item(fila).id, response["id"], 'Limpiezas');
                  console.log('limpieza realizada sended', response["id"]);
                  db2.executeSql("DELETE from resultadoslimpieza WHERE id = ?", [ data.rows.item(fila).id]).then((data) => {
                    console.log("deleted",data.rows.length);

                  });
                }
              },
              error => console.log(error),
              () => { });
          }
          localStorage.setItem("syncchecklimpieza", "0");
          this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
          // this.events.publish('sync',{'estado':'stop'});
          this.eventos.setProcesing({'estado':'stop'})
          console.log('***STOP SENDED');
          // let param = "&entidad=limpieza_realizada";
          // this.servidor.postObject(URLS.STD_ITEM, JSON.stringify(arrayfila),param).subscribe(
          //   response => {
          //     if (response["success"]) {
          //     console.log('limpieza realizada sended',response["id"]);
          //   }},
          // error=>console.log(error),
          // ()=>{});
        }
      }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
        alert("error, no se han podido sincronizar todos los datos [limpiezasRealizadas]" + JSON.stringify(error.err));
      });
    }, (error) => {
      console.log("ERROR al abrir la bd: ", error);
    });
  }

  updateFechaElementoLimpieza(idElementoLimpieza,LimpiezaRealizada,idUser) {
    if (this.network.type != 'none') {
      let fecha = moment(new Date()).format('YYYY-MM-DD');
      let proxima_fecha = '';
      console.log("updating elementoLimpieza");
      this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
        //this.checklistList = data.rows;
        db2.executeSql("Select * FROM checklimpieza WHERE idelemento = ? AND fecha >= ? AND idusuario = ?", [idElementoLimpieza, fecha,idUser ]).then((data) => {
          let proxima_fecha;
          for (var index = 0; index < data.rows.length; index++) {
            console.log(data.rows.item(index),data.rows.item(index),LimpiezaRealizada.descripcion,LimpiezaRealizada.fecha_prevista)
            proxima_fecha = moment(data.rows.item(index).fecha).format('YYYY-MM-DD');
          }
          console.log("proxima_fecha ", proxima_fecha);
          let param = "?entidad=limpieza_elemento&id=" + idElementoLimpieza;
          let limpia = { fecha: proxima_fecha };
          this.servidor.putObject(URLS.STD_ITEM, param, limpia).subscribe(
            (resultado) => 
            console.log(resultado)
            ,
            (error) => 
            console.log(error)
            ,
            () => 
            console.log('fin updating fecha')
          );
        });
      });
    }
  }

  sync_data_supervision() {
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      console.log("sync data spervision");

      console.log("send limpiezas: ");
      db2.executeSql("select * from supervisionlimpieza WHERE supervision > 0", []).then((data) => {
        console.log("limpiezas realizadas para sincronizar: ",data.rows.length);
        
        let arrayfila = [];// : limpiezaRealizada[]=[];
        if (data.rows.length > 0) {

          for (let fila = 0; fila < data.rows.length; fila++) {
           // let arrayfila = [];
            //arrayfila.push(new limpiezaRealizada(null, data.rows.item(fila).idelemento, data.rows.item(fila).idempresa, data.rows.item(fila).fecha_prevista, data.rows.item(fila).fecha, data.rows.item(fila).nombre, data.rows.item(fila).descripcion, data.rows.item(fila).tipo, data.rows.item(fila).idusuario, data.rows.item(fila).responsable, data.rows.item(fila).idlimpiezazona))
            let supervision = new Supervision(data.rows.item(fila).idlimpiezarealizada,data.rows.item(fila).idsupervisor, data.rows.item(fila).fecha_supervision, data.rows.item(fila).supervision, data.rows.item(fila).detalles_supervision);
            //arrayfila.push(data.rows.item[fila]);
            let param = "?entidad=limpieza_realizada&id="+data.rows.item(fila).idlimpiezarealizada;
            this.servidor.putObject(URLS.STD_ITEM, param, supervision).subscribe(
              response => {
                response = JSON.parse(response.toString())
                if (response["success"]) {
                  console.log('#Supervision sended', response["id"], supervision);
                  db2.executeSql("DELETE from supervisionlimpieza WHERE id = ?", [ data.rows.item(fila).id]).then((data) => {
                    console.log("deleted",data.rows.length);
                  });
                }
              },
              error => console.log(error),
              () => { });
          }
                localStorage.setItem("syncsupervision", "0");
                this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));

          // let param = "&entidad=limpieza_realizada";
          // this.servidor.postObject(URLS.STD_ITEM, JSON.stringify(arrayfila),param).subscribe(
          //   response => {
          //     if (response["success"]) {
          //     console.log('limpieza realizada sended',response["id"]);
          //   }},
          // error=>console.log(error),
          // ()=>{});
        }
      }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error.err));
        alert("error, no se han podido sincronizar todos los datos [limpiezasRealizadas]" + JSON.stringify(error.err));
      });
    }, (error) => {
      console.log("ERROR al abrir la bd: ", error);
    });
  }

  // sync_mantenimientos(){
  //   this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
  //     db2.executeSql("select * from mantenimientosrealizados", []).then((data) => {
  //       if (data.rows.length > 0) {
  //         console.log('anviar elementos:',data.rows.length);
  //         let param = "&entidad=mantenimientos_realizados";
  //         let entidad;
  //         let arrayfila = [];
  //         for (let fila = 0; fila < data.rows.length; fila++) {
  //           let mantenimiento = new mantenimientoRealizado(null, data.rows.item(fila).idmantenimiento, data.rows.item(fila).idmaquina, data.rows.item(fila).maquina, 
  //           data.rows.item(fila).mantenimiento,data.rows.item(fila).fecha_prevista,data.rows.item(fila).fecha,data.rows.item(fila).idusuario,data.rows.item(fila).responsable,
  //           data.rows.item(fila).descripcion,data.rows.item(fila).elemento,data.rows.item(fila).tipo,data.rows.item(fila).tipo2,
  //           data.rows.item(fila).causas,data.rows.item(fila).tipo_evento,data.rows.item(fila).idempresa,data.rows.item(fila).imagen,data.rows.item(fila).pieza,data.rows.item(fila).cantidadPiezas);
          
  //           this.servidor.postObject(URLS.STD_ITEM, mantenimiento, param).subscribe(
  //             response => {
  //               if (response["success"]) {
  //                 if (data.rows.item(fila).idmantenimiento > 0){
  //                 if(mantenimiento.tipo_evento == "mantenimiento"){
  //                   entidad = "maquina_mantenimiento";
  //                   }else{
  //                   entidad = "maquina_calibraciones";              
  //                   }   
  //                 this.sync_incidencias(data.rows.item(fila).id, response["id"], 'Maquinaria');        
  //                 this.updateFechaElemento(mantenimiento.idmantenimiento,entidad,'idmantenimiento');
  //                   }
  //                 db2.executeSql("DELETE from mantenimientosrealizados WHERE id = ?", [ data.rows.item(fila).id]).then((data) => {
  //                   console.log("deleted 1 item");
  //                 },
  //               (error)=>{console.log('Deleting mantenimientosrelizados ERROR',error)});
  //               }
  //             },
  //             error => console.log(error),
  //             () => { });
  //           }
  //           localStorage.setItem("syncmantenimiento","0");
  //           this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
  //       }
  //     }, (error) => {
  //       console.log(error);
  //       alert("error, no se han podido sincronizar todos los datos [mantenimientosrealizados] " + error.message);
  //     });
  //   }, (error) => {
  //     console.log("ERROR al abrir la bd: ", error);
  //   });
  // }

  sync_incidencias(idElemento,idOrigen, origen){
    console.log('seleccionar incidencias a enviar:',idElemento, idOrigen, origen);
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      db2.executeSql("select * from incidencias WHERE idElemento = ? AND origen = ?", [idElemento, origen]).then((data) => {
        if (data.rows.length > 0) {
          console.log('enviar incidencias:',data.rows.length);
          let param = "&entidad=incidencias";
          let entidad;
          let arrayfila = [];
          for (let fila = 0; fila < data.rows.length; fila++) {
            let incidencia = new Incidencia(null, data.rows.item(fila).fecha, data.rows.item(fila).incidencia, data.rows.item(fila).solucion, 
            data.rows.item(fila).responsable,data.rows.item(fila).idempresa, data.rows.item(fila).origen,idOrigen,
            data.rows.item(fila).origenasociado,data.rows.item(fila).idOrigenasociado,
            data.rows.item(fila).foto,data.rows.item(fila).descripcion,data.rows.item(fila).estado);
          
            this.servidor.postObject(URLS.STD_ITEM, incidencia, param).subscribe(
              response => {
                response = JSON.parse(response.toString())
                if (response["success"]) {
                  console.log('incidencia guardada:',response["id"]);
                  incidencia.id= response["id"];
                  this.sendMailIncidencia(incidencia);
                  db2.executeSql("DELETE from incidencias WHERE id = ?", [ data.rows.item(fila).id]).then((data) => {
                    console.log("deleted 1 item incidencia");
                  },
                (error)=>{console.log('Deleting incidencias ERROR',error)});
                }
              },
              error => console.log(error),
              () => { });
            }
            localStorage.setItem("syncincidencia","0");
            this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
        }
      }, (error) => {
        console.log(error);
        alert("error, no se han podido sincronizar todos los datos [incidencias] " + error.message);
      });
    }, (error) => {
      console.log("ERROR al abrir la bd: ", error);
    });
  }

  sendMailIncidencia(nuevaIncidencia){
    console.log("sendmail start: ");
    this.loadUsuarios().then(
      (respuesta)=>{
    let responsables = respuesta["data"];
    console.log("sendmail got users: ",responsables);
    // let body = "Nueva incidencia creada desde " + nuevaIncidencia.origen + "<BR>Por: " +  responsables[responsables.findIndex((responsable)=>responsable["value"] == nuevaIncidencia.responsable)]["label"]
    // body +=   "<BR>Con fecha y hora: " + moment(nuevaIncidencia.fecha).format('DD-MM-YYYY hh-mm') +  "<BR>"
    // body +=   "<BR>Nombre: " + nuevaIncidencia.incidencia +  "<BR>"
    // body +=   "Descripción: " + nuevaIncidencia.descripcion;
    // body +=   "<BR>Solución inmediata propuesta: " + nuevaIncidencia.solucion;
    // body +=   "<BR>Ir a la incidencia: " + URLS.SERVER + "empresas/"+ localStorage.getItem("idempresa") +"/incidencias/0/" + nuevaIncidencia.id + "";
    // console.log(nuevaIncidencia.origen,nuevaIncidencia.origen != 'incidencias');

    let body =    nuevaIncidencia.incidencia +  "<BR>"
    body +=    nuevaIncidencia.descripcion +  "<BR>";
    if (nuevaIncidencia.solucion.length >0) body +=   "Solución inmediata propuesta: " + nuevaIncidencia.solucion+ "<BR>";
    //body = "Nueva incidencia creada desde " + nuevaIncidencia.origen + "<BR>Por: " +  responsables[responsables.findIndex((responsable)=>responsable["value"] == nuevaIncidencia.responsable)]["label"]
    body +=   moment(nuevaIncidencia.fecha).format('DD-MM-YYYY hh-mm a') +  "<HR>"
    body +=   "<span style='float:lelft'><a href='" + URLS.SERVER + "empresas/"+ localStorage.getItem("idempresa") +"/incidencias/0/" + nuevaIncidencia.id + "'><img src='https://tfc.proacciona.es/assets/images/verIncidencia.png'></a></span>";
    console.log(nuevaIncidencia.origen,nuevaIncidencia.origen != 'incidencias');
    if (nuevaIncidencia.origen != 'incidencias')
    body +=    "<span style='float:right'><a href='" + URLS.SERVER + "empresas/"+ localStorage.getItem("idempresa") +"/"+ nuevaIncidencia.origenasociado +"/"+ nuevaIncidencia.idOrigenasociado +"/" + nuevaIncidencia.idOrigen + "'><img src='https://tfc.proacciona.es/assets/images/verElemento.png'></a></span>";
    let parametros2 = '&idempresa=' + localStorage.getItem("idempresa") + "&body="+body;
        this.servidor.getObjects(URLS.ALERTES, parametros2).subscribe(
          response => {
            response = JSON.parse(response.toString())
            if (response["success"] && response["data"]) {
              console.log('email alerta enviado');
            }
        });
      });
  }
  

  sync_entradasMP(){
    return new Promise((resolve)=>{
      this.idEntradas=[];
      let x=1;
    console.log('seleccionar entradas MP a enviar:');
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      db2.executeSql("select * from entradasMP", []).then((data) => {
        if (data.rows.length > 0) {
          console.log('enviar entradas:',data.rows.length);
          let arrayfila = [];
          for (let fila = 0; fila < data.rows.length; fila++) {
            let nuevaEntrada = new ProveedorLoteProducto(null,data.rows.item(fila).numlote_proveedor,data.rows.item(fila).fecha_entrada, data.rows.item(fila).fecha_caducidad, data.rows.item(fila).cantidad_inicial, 
            data.rows.item(fila).tipo_medida,data.rows.item(fila).cantidad_remanente, data.rows.item(fila).doc,
            data.rows.item(fila).idproducto,data.rows.item(fila).idproveedor,data.rows.item(fila).idempresa,data.rows.item(fila).idResultadoChecklist,data.rows.item(fila).albaran,data.rows.item(fila).idResultadoChecklistLocal);
          
    let param = "&entidad=proveedores_entradas_producto";
      this.servidor.postObject(URLS.STD_ITEM, nuevaEntrada,param).subscribe(
        response => {
          console.log('******************nuevaEntrada id:',response);
          response = JSON.parse(response.toString())
          console.log('******************nuevaEntrada id:',response);
          if (response["success"]) {        
            nuevaEntrada.id = response["id"];
            this.idEntradas.push({'id':nuevaEntrada.id,'idLocal':data.rows.item(fila).id,'idResultadoChecklistLocal':nuevaEntrada.idResultadoChecklistLocal,'albaran':nuevaEntrada.albaran});

            console.log('******************nuevaEntrada id:',nuevaEntrada.id);
            // if (parseInt(localStorage.getItem('triggerEntradasMP')) > 0){
            //   this.setServiciosDeEntrada(nuevaEntrada.id,data.rows.item(fila).albaran,data.rows.item(fila).idempresa,data.rows.item(fila).id,null,null);
            // }
             
              
            db2.executeSql("DELETE from entradasMP WHERE id = ?", [ data.rows.item(fila).id]).then((data) => {
              console.log("deleted 1 item");
            },
          (error)=>{console.log('Deleting entradasMP ERROR',error)});
            // }
          }else{
            console.log('******************nuevaEntrada id: No SUCCESS');
          }
      },
      error =>{
        console.log("Error en nueva entrada producto",error);
        this.idEntradas.push({'id':error,'idLocal':data.rows.item(fila).id});
      },
      () =>{
        x++;
      }

      );
  }
  console.log('RESOLVE ENTRADAS');
  this.intervalo = setInterval(()=>{
    if (x>= this.idEntradas.length){
      resolve ({'resultados1':true});
    }
  },400)
  // setTimeout(()=>{
  // resolve ({'resultados1':true})
  // },900);

}
      });
    });
  });
  }

  sync_serviciosEntrada(id, idlocal,idEntrada1) {
    console.log("entradasMP id: ",idEntrada1);
    let idEntrada=idEntrada1['id'];
    let source=idEntrada1['source'];
    let albaran=idEntrada1['albaran'];
    //this.servidor.setIdEntrada(null);
    this.db.create({ name: "data.db", location: "default" }).then((db2: SQLiteObject) => {
      // console.log("base de datos abierta");
       
      db2.executeSql("select * from entradasMP WHERE id = ?", [idEntrada]).then((data) => {
        if (data.rows.length > 0) {
          console.log('*##RESULTADO TODAVÍA ESTÄ LA ENTRADA EN LOCAL',data);
          db2.executeSql("update entradasMP set idResultadoChecklist = ? WHERE id = ?", [id,idEntrada]).then(
            (data) => {
              console.log('updated entrada local',data);
            },
            (error)=>{console.log('ERROR updated entrada local',error)});
        }else{
          console.log('*##YA NO ESTÄ LA ENTRADA EN LOCAL');
          let param='';
          if (source=='local'){
            param = "?entidad=proveedores_entradas_producto&WHERE=idResultadoChecklistLocal="+idEntrada+" AND albaran='"+albaran+"'";
            // param = "?entidad=proveedores_entradas_producto&WHERE=albaran='"+albaran+"'";
            console.log('*##id LOCAL',param);
          }else{
           param = "?entidad=proveedores_entradas_producto&id="+idEntrada;
          //  param = "?entidad=proveedores_entradas_producto&WHERE=albaran='"+albaran+"'";
           console.log('*##id SERVER',param);
          }
          let entrada={'idResultadoChecklist':id};
          this.servidor.putObject(URLS.STD_ITEM,param,entrada).subscribe(
            response => {
              response = JSON.parse(response.toString())
              if (response["success"]) {
                console.log('**servicio de entrada updated ok',response);
                }else{
                  console.log('**servicio de entrada NOT updated -> ERROR: ',response);
                }
          },
          error => {console.log("Error en nueva entrada producto",error);});
         
        }
      }, (error) => {
        console.log("ERROR -> ",error);
        alert("error, no se han podido sincronizar todos los datos [SYNC_serviciosEntrada]" + error);
      });
    }, (error) => {
      console.log("ERROR al abrir la bd: ", error);
    });

  }




  loadUsuarios(){
    return new Promise((resolve)=>{
      console.log("get users: ");
    let responsables :any[];
    let params = localStorage.getItem("idempresa");
    let parametros2 = "&entidad=usuarios"+'&idempresa=' + params;
        this.servidor.getObjects(URLS.STD_ITEM, parametros2).subscribe(
          response => {
            responsables = [];
            response = JSON.parse(response.toString())
            if (response["success"] && response["data"]) {
            //  console.log(response["data"])
              for (let element of response["data"]) {  
                responsables.push({'label':element.usuario,'value':element.id});
             }
             resolve ({"data":responsables})
            }
        });
      });
  }
//************CALCULOS FECHA */
  nuevaFecha(limpieza: checkLimpieza,descripcion?,fecha_prevista?){
      let periodicidad = JSON.parse(limpieza.periodicidad)
      let hoy = new Date();
      let proximaFecha;
       console.log("nuevaFecha", periodicidad, fecha_prevista);
      switch (periodicidad.repeticion){
        case "diaria":
        proximaFecha = this.nextWeekDay(periodicidad);
        break;
        case "semanal":
        proximaFecha = moment(fecha_prevista).add(periodicidad.frecuencia,"w");
        while (moment(proximaFecha).isSameOrBefore(moment())){
        fecha_prevista = proximaFecha;
        proximaFecha = moment(fecha_prevista).add(periodicidad.frecuencia,"w");
        }
        break;
        case "mensual":
        if (periodicidad.tipo == "diames"){
            proximaFecha = moment(fecha_prevista).add(periodicidad.frecuencia,"M");
        } else{
          proximaFecha = this.nextMonthDay(fecha_prevista,periodicidad);
        }

        break;
        case "anual":
        if (periodicidad.tipo == "diames"){
          let año = moment(fecha_prevista).get('year') + periodicidad.frecuencia;
        proximaFecha = moment().set({"year":año,"month":parseInt(periodicidad.mes)-1,"date":periodicidad.numdia});
        } else{
          proximaFecha = this.nextYearDay(fecha_prevista,periodicidad);
        }
        break;
      }
      let newdate;
      newdate = moment(proximaFecha).toDate();
      return newdate = new Date(Date.UTC(newdate.getFullYear(), newdate.getMonth(), newdate.getDate()))
}


nextWeekDay(periodicidad:any, fecha?:Date) {
  console.log("nextweekday", periodicidad, fecha);
  let hoy = new Date();
  if (fecha) hoy = fecha;
  let proximoDia:number =-1;
  let nextFecha;
  for(let currentDay= hoy.getDay();currentDay<6;currentDay++){
    if (periodicidad.dias[currentDay].checked == true){
      proximoDia = 7 + currentDay - (hoy.getDay()-1);
      break;
    }
  }
  if (proximoDia ==-1){
      for(let currentDay= 0;currentDay<hoy.getDay();currentDay++){
    if (periodicidad.dias[currentDay].checked == true){
      proximoDia = currentDay + 7 - (hoy.getDay()-1);
      break;
    }
  }
}
if(proximoDia >7) proximoDia =proximoDia-7;
nextFecha = moment().add(proximoDia,"days");
return nextFecha;
}

nextMonthDay(fecha_prevista1, periodicidad: any){
  let  proximafecha;
  let fecha_prevista = new Date(fecha_prevista1);
  let mes = fecha_prevista.getMonth() +1 + periodicidad.frecuencia;
 
if (periodicidad.numsemana ==5){
 let ultimodia =  moment(fecha_prevista).add(periodicidad.frecuencia,"M").endOf('month').isoWeekday() - periodicidad.nomdia;
  proximafecha = moment(fecha_prevista).add(periodicidad.frecuencia,"M").endOf('month').subtract(ultimodia,"days");
}else{
let primerdia = 7 - ((moment(fecha_prevista).add(periodicidad.frecuencia,"M").startOf('month').isoWeekday()) - periodicidad.nomdia)
if (primerdia >6) primerdia= primerdia-7;
 proximafecha = moment(fecha_prevista).add(periodicidad.frecuencia,"M").startOf('month').add(primerdia,"days").add(periodicidad.numsemana-1,"w");
}
return  proximafecha;
}
nextYearDay(fecha_prevista1, periodicidad: any){
  let proximafecha;
  let fecha_prevista = new Date(fecha_prevista1);
  let mes = parseInt(periodicidad.mes) -1;
  fecha_prevista = moment(fecha_prevista).month(mes).add(periodicidad.frecuencia,'y').toDate();

if (periodicidad.numsemana ==5){
 let ultimodia =  moment(fecha_prevista).endOf('month').isoWeekday() - periodicidad.nomdia;
 proximafecha = moment(fecha_prevista).endOf('month').subtract(ultimodia,"days");
}else{
let primerdia = 7 - ((moment(fecha_prevista).startOf('month').isoWeekday()) - periodicidad.nomdia)
if (primerdia >6) primerdia= primerdia-7;
 proximafecha = moment(fecha_prevista).startOf('month').add(primerdia,"days").add(periodicidad.numsemana-1,"w");
}
return proximafecha;
}
}
