import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController,ActionSheetController, Platform, Events, IonSlides } from '@ionic/angular';

import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { URLS, Incidencia, ProveedorLoteProducto } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import {SyncPage} from '../sync/sync.page';
import { Initdb } from '../../services/initdb';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
// import { ConsoleReporter } from 'jasmine';
//*****CUSTOM TEMPLATE */

export class Checks {
  id: number;
  idchecklist: number;
  nombrechecklist: string;
  idcontrol:number;
  nombrecontrol:string;
  checked:string;
  valor:string;
  descripcion: string;
  foto: string;
}


@Component({
  selector: 'app-check',
  templateUrl: './check.page.html',
  styleUrls: ['./check.page.scss'],
  providers: [SyncPage]
})

export class CheckPage implements OnInit {
  @ViewChild('slides') slides:IonSlides;
  public checklistcontroles: Checks[] = [];
  public entradasMP: any[] = [];
  public entradaActual:any=null;
  public servicios: any[] = [];
  public resultadoschecklistcontroles: any;
  public checks: any;
  //private storage: Storage;
  public idchecklist;
  public nombrechecklist: string;
  public base64Image;
  public checkvalue:string;
  public selectedValue:string;
  public fecha_prevista: Date;
  public periodicidad: any;
  public hayRetraso: number;
  public autocompletar:boolean=false;
  public hoy: Date = new Date();
  public hayIncidencia: number = 0;
  public lote:ProveedorLoteProducto=null;
  public albaran:string=null;
  public proveedor:string = null;
  public producto:string=null;
  public slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  constructor(
  private platform: Platform,
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  public initdb: Initdb, 
  public sync: SyncPage, 
  public camera: Camera,
  private alertCtrl: AlertController,  
  public actionSheetCtrl: ActionSheetController,
  public events: Events
  ) {
let checklist= this.servidor.getParam();
    this.idchecklist =  checklist.idchecklist;
    this.nombrechecklist = checklist.nombrechecklist;
    this.fecha_prevista = checklist.fecha;
    try{
    this.periodicidad = JSON.parse(checklist.periodicidad);
    }catch(e){
      this.periodicidad = {repeticion:'por uso'}
    }
    //this.db = new SQLite();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.db.create({name: "data.db", location: "default"}).then(() => {
        //this.refresh();
        this.getChecklists(this.idchecklist);
        console.debug("base de datos abierta");
    }, (error) => {
        console.debug("ERROR al abrir la bd: ", error);
    });

    if (this.isTokenExired(localStorage.getItem('token')) && this.network.type != 'none'){
      let param = '?user=' + sessionStorage.getItem("nombre") + '&password=' +sessionStorage.getItem("password");
      this.servidor.login(URLS.LOGIN, param).subscribe(
        response => {
          if (response.success == 'true') {
            // Guarda token en sessionStorage
            localStorage.setItem('token', response.token);
            }
            });
    }
    if (this.periodicidad.repeticion!='por uso'){
    this.hayRetraso = this.periodos.hayRetraso(this.fecha_prevista,this.periodicidad);
    }

    });
  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link);
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
  
  
  getChecklists(idchecklist){
    if (idchecklist == parseInt(localStorage.getItem('triggerEntradasMP'))){

      let checklist= this.servidor.getParam();
      this.lote=checklist.lote;
      console.log(checklist,checklist.lote)
      this.loadEntradas();
    }
                    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
                    db2.executeSql("Select * FROM checklist WHERE idchecklist = ? and idusuario = ?",[idchecklist, sessionStorage.getItem("idusuario")]).then((data) => {
                    console.log ("resultado1" + data.rows.length);
                    this.nombrechecklist=data.rows.item(0).nombrechecklist;
                    for (var index=0;index < data.rows.length;index++){
                        this.checklistcontroles.push({
                              "id": data.rows.item(index).id,
                              "idchecklist": data.rows.item(index).idchecklist,
                              "nombrechecklist": data.rows.item(index).nombrechecklist,
                              "idcontrol":data.rows.item(index).idcontrol,
                              "nombrecontrol":data.rows.item(index).nombrecontrol,
                              "checked":'',
                              "valor":'',
                              "descripcion":data.rows.item(index).descripcion,
                              "foto": ""
                        });
                      }
                }, (error) => {
                    console.log("ERROR -> " + JSON.stringify(error.err));
                    alert("error " + JSON.stringify(error.err));
                }); 
                    });
  }
  
  
  terminar(){
    console.debug(this.checklistcontroles);
    let fecha;
    
    (this.autocompletar)? fecha = moment(this.fecha_prevista).add('h',this.hoy.getUTCHours()).add('m',this.hoy.getUTCMinutes()).format('YYYY-MM-DD HH:mm'): fecha= moment(this.hoy).format('YYYY-MM-DD HH:mm');
    
    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
        db2.executeSql('INSERT INTO resultadoschecklist (idchecklist,fecha, foto,idusuario) VALUES (?,?,?,?)',
        [this.idchecklist, fecha, this.base64Image,sessionStorage.getItem("idusuario")]).then(
    (Resultado) => { 
      if (this.hayIncidencia > 0){
        db2.executeSql('UPDATE incidencias set idElemento = ? WHERE id = ?',[Resultado.insertId,this.hayIncidencia]).then(
          (Resultado) => { console.log("update_Incidencia_ok:",Resultado);}
          ,
          (error) => {
          console.log('ERROR UPDATE INCIDENCIA',JSON.stringify(error))
          });
      }
      if (this.idchecklist == parseInt(localStorage.getItem('triggerEntradasMP'))){
        if (this.entradaActual){
          this.updateEntrada();
        }
      }

            // console.debug("resultado: " + Resultado.res.insertId);
             console.debug("resultado2: " + Resultado.insertId);
            let idresultadochecklist = Resultado.insertId;
            //localStorage.setItem("sync",(parseInt(localStorage.getItem("sync"))+1).toString());
            for(var index in this.checklistcontroles) { 
              var attr = this.checklistcontroles[index];
              db2.executeSql('INSERT INTO resultadoscontroleschecklist (idcontrolchecklist,idchecklist, resultado, descripcion, fotocontrol, idresultadochecklist) VALUES (?,?,?,?,?,?)',[attr.idcontrol,this.idchecklist,attr.checked,attr.descripcion,attr.foto,idresultadochecklist]).then(
            (Resultado) => { console.debug(Resultado);},
            (error) => {console.log('ERROR al INSERT RESULTADOSCHECKLIST DDBB',error)});
          }
  
    //******CALCULAR FECHA */
    //******CALCULAR FECHA */
  
    // let proxima_fecha;
    // if (this.periodicidad['repeticion'] =="por uso"){
    //   proxima_fecha = moment(new Date()).format('YYYY-MM-DD');
    // }else{
    //   proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,this.fecha_prevista)).format('YYYY-MM-DD');
    // }
    // console.log('PROXIMA_FECHA:',this.periodicidad.repeticion, proxima_fecha);
  
    //******UPDATE FECHA LOCAL*/
    //******UPDATE FECHA LOCAL*/
    this.updateFecha(this.fecha_prevista,this.autocompletar);
  
  },
    (error) => {console.log('ERROR al abrir DDBB',error)});
    });
  
  
  }
  
  updateFecha(fecha,completaFechas){
    let proxima_fecha;
    if (moment(fecha).isValid() && this.periodicidad.repeticion != "por uso") {
      proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,fecha,completaFechas)).format('YYYY-MM-DD');
    } else {
      proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,this.hoy)).format('YYYY-MM-DD');
    }
    
    console.log("updating fecha",proxima_fecha);
    if (moment(proxima_fecha).isAfter(moment(),'day') || this.periodicidad.repeticion == "por uso"){
      this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
    //******UPDATE FECHA LOCAL*/
    //******UPDATE FECHA LOCAL*/
    db2.executeSql('UPDATE checklist set  fecha = ? WHERE idchecklist = ?',[proxima_fecha, this.idchecklist]).then
    ((Resultado) => {
         console.log("updated fecha: ", Resultado);
    },
    (error) => {
      console.debug('ERROR ACTUALIZANDO FECHA', error);
     });
      });        
      if (this.network.type != 'none') {
        console.debug("conected");
        this.sync.sync_data_checklist();
      }
      else {
        localStorage.setItem("syncchecklist", (parseInt(localStorage.getItem("syncchecklist")) + 1).toString());
        this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
      }
      //this.navCtrl.pop();
      this.goTo();
          }else{
  
            console.log("sigue programando: ",proxima_fecha);
            this.fecha_prevista = proxima_fecha;
            this.terminar();
          }
  }
  
  
  takeFoto(control ?){
    //this.base64Image = "data:image/jpeg;base64,";
    this.camera.getPicture({
          destinationType: this.camera.DestinationType.DATA_URL,
          quality: 50,
          targetWidth: 300,
          targetHeight: 300,
          correctOrientation: true
      }).then((imageData) => {
        // imageData is a base64 encoded string
        if (control){
          control.foto = "data:image/jpeg;base64," + imageData;
        }else{
          this.base64Image = "data:image/jpeg;base64," + imageData;
        }
          
      }, (err) => {
          console.debug(err);
      });
      console.debug(this.checklistcontroles);
    }
  editar(control){
            let prompt = this.alertCtrl.create({
              message: 'Descripcion',
              inputs: [{name: 'descripcion'}],
              buttons: [
                  {text: 'Cancel'},
                  {text: 'Add',handler: data => {control.descripcion = data.descripcion;}
                  }]
              }).then(()=>console.log('prompt mostrado'));
          //prompt.present();
  }
  setValor(control){
            let prompt = this.alertCtrl.create({
              message: 'Valor',
              inputs: [{name: 'valor'}],
              buttons: [
                  {text: 'Cancel'},
                  {text: 'Ok',handler: data => {control.checked = data.valor;control.valor = data.valor;}
                  }]
              }).then(()=>console.log('prompt mostrado'))
          //prompt.present();
  }
async  opciones(control) {
      let correcto;
      let incorrecto;
      let aplica;
      let valor;
      let descrip;
      let cancel;
      this.translate.get("correcto").subscribe(resultado => {correcto = resultado;});
      this.translate.get("incorrecto").subscribe(resultado => { incorrecto = resultado;});
      this.translate.get("no aplica").subscribe(resultado => { aplica = resultado;});
      this.translate.get("valor").subscribe(resultado => { valor = resultado;});
      this.translate.get("descripcion").subscribe(resultado => { descrip = resultado;});
      this.translate.get("cancel").subscribe(resultado => { cancel = resultado;});
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Opciones',
        buttons: [
          {text: correcto,icon:'checkmark-circle',handler: () => {control.checked='true';control.valor = '';}},
          {text: incorrecto,icon:'close-circle',handler: () => {control.checked='false';control.valor = '';}},
          {text: aplica,icon:'help-circle',handler: () => {control.checked='na';control.valor = '';}},
          {text: valor,icon:'information-circle',handler: () => {this.setValor(control);}},
          {text: descrip,icon:'clipboard',handler: () => {this.editar(control);}},
          {text: 'Foto',icon:'camera',handler: () => {this.takeFoto(control);}},
          {text: cancel,role: 'cancel',handler: () => {console.debug('Cancel clicked');}}
          ]
           })
      actionSheet.present();
    }
  
  changeSelected(){
    this.selectedValue = this.checkvalue;
  }
  
  changeValor(control){
    if (control.valor === null || control.valor === null || control.valor === undefined || isNaN(control.valor)){
      this.translate.get("alertas.errorvalor")
    .subscribe(resultado => { alert(resultado);});
    }
  }
  
  nuevaIncidencia(){
    let incidencia = this.nombrechecklist
    let params= new Incidencia(null,null,incidencia,'',parseInt(sessionStorage.getItem("iduser")),
    parseInt(localStorage.getItem("idempresa")),'Checklists',this.idchecklist ,'Checklists',this.idchecklist,this.base64Image,'',-1)
    this.servidor.setIncidencia(params);
    
    //this.navCtrl.push(IncidenciasPage,params);
    this.goTo('/incidencias')
    this.events.subscribe('nuevaIncidencia', (param) => {
      // userEventData is an array of parameters, so grab our first and only arg
      console.log('Id Incidencia Local', param);
      this.hayIncidencia = param.idLocal;
      this.servidor.setIncidencia(null);
    });
  }




  //***************AREA ENTRADAS DE MATERIA PRIMA */
  setLoteActivo(swiper, evento){
    console.log(evento);
    swiper.getActiveIndex().then(
      (index)=>{
        this.setLote(index);
        // this.entradaActual = this.entradasMP[index];
        // this.getProveedores(this.entradasMP[index].idproveedor)
        // this.getProductos(this.entradasMP[index].idproducto,this.entradasMP[index].idproveedor)
        // this.albaran = this.servicios[this.servicios.findIndex((servicio)=>servicio.idEntrada == this.entradasMP[index].id)]['albaran'];
      });
  }
setLote(index){

  this.entradaActual = this.entradasMP[index];
        this.getProveedores(this.entradasMP[index].idproveedor)
        this.getProductos(this.entradasMP[index].idproducto,this.entradasMP[index].idproveedor)
  this.albaran = this.servicios[this.servicios.findIndex((servicio)=>servicio.idEntrada == this.entradasMP[index].id)]['albaran'];
}
  loadEntradas(){
    this.entradasMP=[]
    if (this.network.type != 'none') {
      this.getServicios().then(
        (resultados)=>{
          console.log(resultados);
      let param = "&entidad=proveedores_entradas_producto&idempresa="+localStorage.getItem('idempresa')+"&WHERE=id="+resultados;
        this.servidor.getObjects(URLS.STD_ITEM,param).subscribe(
          response => {
            if (response.success) {
              console.log('servicio de entrada ok',response.data);
              let entradas = response.data;
              console.log('resultado entradas: ' + entradas);

                entradas.forEach (entrada => {
                //  this.saveLimpiezaRealizada(limpiezarealizada)
                this.entradasMP.push({
                  "id": entrada.id,
                  "numlote_proveedor": entrada.numlote_proveedor,
                  "fecha_entrada": entrada.fecha_entrada,
                  "fecha_caducidad": entrada.fecha_caducidad,
                  "cantidad_inicial":entrada.cantidad_inicial,
                  "tipo_medida":entrada.tipo_medida,
                  "cantidad_remanente":entrada.cantidad_remanente,
                  "doc":entrada.doc,
                  "idproducto":entrada.idproducto,
                  "idproveedor": entrada.idproveedor,
                  "idempresa":entrada.idempresa,
                  "albaran":entrada.albaran
            });


                });
                if(this.lote){
                  console.log('####LOTE',this.lote);
                  let indice = this.entradasMP.findIndex((entrada)=>entrada.numlote_proveedor == this.lote.numlote_proveedor && entrada.idproducto == this.lote.idproducto)
                  if (indice > -1){
                  this.setLote(indice);
                  }else{
                    alert('lote no encontrado'+indice );
                    console.log(this.lote,this.entradasMP);
                  }
                }else{
                this.setLote(0);
                }
                // this.getProveedores()
                // this.getProductos(this.entradasMP[0].idproducto,this.entradasMP[0].idproveedor)
                // this.entradaActual=this.entradasMP[0];
            }
        },
        error =>console.log("Error en nueva entrada producto",error),
        () =>console.log('entrada producto ok')
        );
    });
    }else{
    ;
    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      db2.executeSql("Select * FROM entradasMP",[]).then((data) => {
      console.log ("resultado2" + data.rows.length);
      for (var index=0;index < data.rows.length;index++){
          this.entradasMP.push({
                "id": data.rows.item(index).id,
                "numlote_proveedor": data.rows.item(index).numlote_proveedor,
                "fecha_entrada": data.rows.item(index).fecha_entrada,
                "fecha_caducidad": data.rows.item(index).fecha_caducidad,
                "cantidad_inicial":data.rows.item(index).cantidad_inicial,
                "tipo_medida":data.rows.item(index).tipo_medida,
                "cantidad_remanente":data.rows.item(index).cantidad_remanente,
                "doc":data.rows.item(index).doc,
                "idproducto":data.rows.item(index).idproducto,
                "idproveedor": data.rows.item(index).idproveedor,
                "idempresa":data.rows.item(index).idempresa,
                "albaran":data.rows.item(index).albaran
          });
        }
        console.log("entradas -> ",this.entradasMP);
  }, (error) => {
      console.log("ERROR -> " + JSON.stringify(error.err));
      alert("error " + JSON.stringify(error.err));
  }); 
      });
    }
  }

  getServicios(){
    return new Promise((resolve,reject)=>{
    let param = "&entidad=serviciosDeEntrada&idempresa="+localStorage.getItem('idempresa')+"&WHERE=idResultadoChecklist is null";
    this.servidor.getObjects(URLS.STD_ITEM,param).subscribe(
      response => {
        this.servicios=[];
        if (response.success && response.data) {
          console.log('servicio de entrada ok',response.data);
          let resultado = '';
          let entradas = response.data;
          console.log('resultado entradas: ' + entradas);
            entradas.forEach (entrada => {
              this.servicios.push({
                'idEntrada':entrada.idEntradasMP,
                'albaran':entrada.albaran
              }
              )
              resultado += entrada.idEntradasMP + ' OR id=';
            });
            resultado = resultado.substr(0,resultado.length-7);
            resolve (resultado);
        }
        else{
          resolve (false)
        }
    },
    error => {
      console.log("Error en nueva entrada producto",error);
      resolve (false);
    },
    () =>console.log('entrada producto ok')
    );
  });
  }

  async verEntradas(){
    let botones=[];
    this.entradasMP.forEach((entrada)=>{
      botones.push(
        {'text':entrada.numlote_proveedor,
        handler:this.selectEntrada(entrada.id)}
      )
    })
    const prompt = await this.alertCtrl.create({
      message: 'texto',
      inputs: [{name: 'valor'}],
      buttons: botones
      });
    await prompt.present();  
}
selectEntrada(idLote){
console.log('ENTRADA SELECCIONADA',idLote);
}



getProveedores(idproveedor){
  console.log('get proveedor');
  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
    db2.executeSql("Select * FROM proveedores WHERE idproveedor = ?",[idproveedor]).then((data) => {
    console.log ("resultado1 proveedores" + data.rows.length);
    for (var index=0;index < data.rows.length;index++){
        this.proveedor = data.rows.item(index).nombre
      }
}, (error) => {
    console.debug("ERROR -> " + JSON.stringify(error.err));
    alert("error " + JSON.stringify(error.err));
}); 
    });
}
getProductos(idproducto:number, idproveedor:number){
  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
    db2.executeSql("Select * FROM productosProveedor WHERE idproducto = ? AND idproveedor=?",[idproducto,idproveedor]).then((data) => {
    console.log ("resultado1 productos" + data.rows.length);
    for (var index=0;index < data.rows.length;index++){
        this.producto = data.rows.item(index).nombre;
      }
}, (error) => {
    console.debug("ERROR -> " + JSON.stringify(error.err));
    alert("error " + JSON.stringify(error.err));
}); 
    });
}

swipe(slide:IonSlides ,sentido){
  if (sentido=='right'){
slide.slideNext();
  }else{
slide.slidePrev();
  }
}


updateEntrada(){

}

}
