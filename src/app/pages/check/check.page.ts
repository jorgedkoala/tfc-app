import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController,ActionSheetController, Platform, IonSlides } from '@ionic/angular';

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
import { EventosService } from '../../services/eventos.service';
// // import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
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
  public isActualChecklistComplete=false;
  // public templatechecklistcontroles: Checks[] = [];
  public entradasMP: any[] = [];
  public entradasMPGroupByAlbaran: any[]=[];
  public entradaActual:any=null;
  public source: string = null;
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
  public syncOK:boolean=true;
  public slideOpts = {
    initialSlide: 0,
    speed: 400
  };


  public avisos_Incompleto:String[]=[];

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
  // public events: Events,
  public eventos: EventosService
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
          if (response["success"] == 'true') {
            // Guarda token en sessionStorage
            localStorage.setItem('token', response["token"]);
            if (this.idchecklist == parseInt(localStorage.getItem('triggerEntradasMP'))){
              let checklist= this.servidor.getParam();
              this.lote=checklist.lote;
              this.albaran=checklist.albaran;
              console.log(checklist,checklist.lote)
              this.loadEntradas();
            }
            }
            });
    }

///ACTIVAR DESACTIVAR BUSCAR Y PERMITIR AUTORRELLENO PARA REPETICIONES PENDIENTES
    // if (this.periodicidad.repeticion!='por uso'){
    // this.hayRetraso = this.periodos.hayRetraso(this.fecha_prevista,this.periodicidad);
    // }

    });
  }

  goTo(link?){
    if (!link) link='/home/checks'
    this.router.navigateByUrl(link, {replaceUrl:true});
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
      this.albaran=checklist.albaran;
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

  setTemplateControles(){
    let newArrayControles=[];
    this.checklistcontroles.forEach((control)=>{
      newArrayControles.push({
        "id": control.id,
        "idchecklist": control.idchecklist,
        "nombrechecklist": control.nombrechecklist,
        "idcontrol":control.idcontrol,
        "nombrecontrol":control.nombrecontrol,
        "checked":'',
        "valor":'',
        "descripcion":control.descripcion,
        "foto": ""
  });  
    });
    return newArrayControles;
  }

enviar(){
    // console.log('ENVIAR',this.entradasMP.length);
    
    if(this.entradasMP.length>1){
      this.syncOK=false;
      this.entradasMP.forEach(async (entrada)=>{
        // console.log('ENVIAR',entrada,entrada.checklistControles)
        let indiceentradaMPG = this.entradasMPGroupByAlbaran.findIndex((entradaMPG)=>entradaMPG.albaran==entrada.albaran);

        if (indiceentradaMPG >= 0){
          let identrada = entrada.id;
          entrada = this.entradasMPGroupByAlbaran[indiceentradaMPG];
          entrada.id=identrada;
          console.log('##IDENTRADA',indiceentradaMPG,identrada,entrada.id);
        }

        let isfull=true;
        entrada.checklistControles.forEach((control)=>{
          if (control.checked == '') isfull=false;
        });
        this.entradaActual = entrada;
        console.log('***ENVIAR ISFULL',isfull);
        if (isfull){
 
          this.checklistcontroles=entrada.checklistControles;
          this.base64Image=entrada.imagen;
          this.servidor.setIdEntrada({'id':entrada.id,'source':this.source,'albaran':entrada.albaran});
          let next = await this.terminar();
          console.log('NEXT ENTRADA', next);
        }else{
          console.log('***AVISAR SERVICIO INCOMPLETO')
          this.avisos_Incompleto.push(entrada.albaran);
        }
      });
      if(this.avisos_Incompleto.length>0){
        let aviso='';
        this.translate.get('Checklistincompleto').subscribe(async (valor)=>{
          aviso=valor;
          aviso+=this.avisos_Incompleto;
          const prompt = await this.alertCtrl.create({
            message: aviso,
            buttons: [{text: 'Ok'}]
            })
            await prompt.present().then((valor)=>{console.log('AVISO MOSTRADO')})

        })

      }

      if (this.network.type != 'none') {
        console.log("SYNC");
         this.sync.sync_data_checklist('ENVIAR CHECKPAGE');
      }else{
        console.log('SIN NETWORK');
      }
    }else{
      this.syncOK=true;
      this.terminar();
    }
  }

terminar(){
return new Promise((resolve)=>{
    console.log('ENTRADA ACTUAL',this.entradaActual);
    let fecha;
    (this.autocompletar)? fecha = moment(this.fecha_prevista).add('h',this.hoy.getUTCHours()).add('m',this.hoy.getUTCMinutes()).format('YYYY-MM-DD HH:mm'): fecha= moment().format('YYYY-MM-DD HH:mm:ss');
    if (this.entradaActual){
      let indice=this.entradasMP.findIndex((ent)=>ent.id == this.entradaActual.id);
      let RT = Math.random()*10;
      fecha= moment(fecha).add(indice,'minutes').add(RT,'seconds').format('YYYY-MM-DD HH:mm:ss');
    }
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
          console.log('UPDATING servicio entrada Local 2',Resultado.insertId,this.entradaActual.id,this.entradaActual);
          this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            db2.executeSql('UPDATE entradasMP set idResultadoChecklistLocal =? WHERE id=?',
            [Resultado.insertId,this.entradaActual.id]).then(
          (Resultado2) => {
            console.log('UPDATED  ENTRADAS Local',Resultado2);
            resolve(true);
          },
          (error)=>{
            console.log('ERROR UPDATE entrada Local',error);
          });
            });
          //this.updateEntrada();
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

  });//******FIN PROMISE*/
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
      if (this.network.type != 'none' && this.syncOK) {
        console.debug("conected");
        this.sync.sync_data_checklist('UPDATEFECHA CHECKPAGE');
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
  async editar(control){
            const prompt = await this.alertCtrl.create({
              message: 'Descripcion',
              inputs: [{name: 'descripcion'}],
              buttons: [
                  {text: 'Cancel'},
                  {text: 'Add',handler: data => {control.descripcion = data.descripcion;}
                  }]
              })
          prompt.present().then(
            (respuesta)=>{console.log('prompt mostrado',respuesta)});
  }

  setOpcion(control,opcion){
    control.checked = opcion;
    control.valor = opcion;
  }
 async setValor(control){
            const prompt = await this.alertCtrl.create({
              message: 'Valor',
              inputs: [{name: 'valor'}],
              buttons: [
                  {text: 'Cancel'},
                  {text: 'Ok',handler: data => {control.checked = data.valor;control.valor = data.valor;}
                  }]
              })
         prompt.present().then((respuesta)=>{
           console.log('prompt mostrado');
         })
  }
async  opciones(control) {
  console.log('CONTROL',control);
  let todosOk;
  let correcto;
  let incorrecto;
  let aplica;
  let valor;
  let descrip;
  let cancel;
  this.translate.get("todosOk").subscribe(resultado => {todosOk = resultado;});
  this.translate.get("correcto").subscribe(resultado => {correcto = resultado;});
  this.translate.get("incorrecto").subscribe(resultado => { incorrecto = resultado;});
  this.translate.get("no aplica").subscribe(resultado => { aplica = resultado;});
  this.translate.get("valor").subscribe(resultado => { valor = resultado;});
  this.translate.get("descripcion").subscribe(resultado => { descrip = resultado;});
  this.translate.get("cancel").subscribe(resultado => { cancel = resultado;});
  if (this.entradaActual)
  this.entradaActual['checklist']=true;
  let botones=[]
  if (control.nombrecontrol.indexOf('//')>0){
    let opciones = control.nombrecontrol.split('//');
    opciones.forEach((opcion)=>{
      botones.push({
        text:opcion,handler:()=>{this.setOpcion(control,opcion);}
      });
      botones.push({text: cancel,role: 'cancel',handler: () => {console.debug('Cancel clicked');}});
    })

  }else{
    botones= [
      {text: todosOk,icon:'checkmark-circle',handler: () => {this.todosOk()}},
      {text: correcto,icon:'checkmark-circle',handler: () => {control.checked='true';control.valor = '';}},
      {text: incorrecto,icon:'close-circle',handler: () => {control.checked='false';control.valor = '';}},
      {text: aplica,icon:'help-circle',handler: () => {control.checked='na';control.valor = '';}},
      {text: valor,icon:'information-circle',handler: () => {this.setValor(control);}},
      {text: descrip,icon:'clipboard',handler: () => {this.editar(control);}},
      {text: 'Foto',icon:'camera',handler: () => {this.takeFoto(control);}},
      {text: cancel,role: 'cancel',handler: () => {console.debug('Cancel clicked');}}
      ]
          }
          const actionSheet = await this.actionSheetCtrl.create({
            header: 'Opciones',
            buttons: botones
               });
      actionSheet.present().then(()=>{  this.checkControles();})
         
    }
  
  todosOk(){
    this.checklistcontroles.forEach((control)=>{
      control.checked='true';
    });
    this.checkControles();
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
this.eventos.incidencia.subscribe((param)=>{
  console.log('Id Incidencia Local', param);
  this.hayIncidencia = param["idLocal"];
  this.servidor.setIncidencia(null);
})
    // this.events.subscribe('nuevaIncidencia', (param) => {
    //   // userEventData is an array of parameters, so grab our first and only arg
    //   console.log('Id Incidencia Local', param);
    //   this.hayIncidencia = param.idLocal;
    //   this.servidor.setIncidencia(null);
    // });
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
  this.entradaActual = this.entradasMPGroupByAlbaran[index];
        this.getProveedores(this.entradasMPGroupByAlbaran[index].idproveedor)
        this.getProductos(this.entradasMPGroupByAlbaran[index].idproducto,this.entradasMPGroupByAlbaran[index].idproveedor)
   //     this.servidor.setIdEntrada({'id':this.entradaActual.id,'source':this.source,'albaran':this.entradaActual.albaran});
  //this.albaran = this.servicios[this.servicios.findIndex((servicio)=>servicio.idEntrada == this.entradasMP[index].id)]['albaran'];
    this.checklistcontroles=this.entradaActual['checklistControles'];
    console.log('SETLOTE',index,this.checklistcontroles);
    this.base64Image=this.entradaActual['imagen'];
  this.checkControles();
}


checkSlide(slide){
  if(this.lote){
    console.log('####LOTE',this.lote);
    setTimeout(()=>{
    let indice = this.entradasMPGroupByAlbaran.findIndex((entrada)=>entrada.albaran == this.albaran)
    if (indice > -1){
      console.log('####LOTE',indice);
    this.setLote(indice);
    slide.slideTo(indice);
    }else{
      alert('lote no encontrado'+indice );
      console.log(this.lote,this.entradasMPGroupByAlbaran);
    }
  },1100);
  }
}


  loadEntradas(){
    this.entradasMP=[]
    if (this.network.type != 'none') {
      console.log('ENTRADAS PRODUCTO ONLINE');
      let param = "&entidad=proveedores_entradas_producto&idempresa="+localStorage.getItem('idempresa')+"&WHERE=albaran is not null AND idResultadoChecklist is null";
        this.servidor.getObjects(URLS.STD_ITEM,param).subscribe(
          response => {
            if (response["success"]) {
              console.log('servicio de entrada ok',response["data"]);
              let entradas = response["data"];
              console.log('resultado entradas: ' + entradas);
              this.source='server';
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
                  "idResultadoChecklist":entrada.idResultadoChecklist,
                  "albaran":entrada.albaran,
                  // "checklist":true,
                  "checklistControles":this.setTemplateControles(),
                  "imagen":null
            });
                });
                // if (this.entradasMP.length > 0)
                // this.setLote(0);
                this.loadEntradasMPG();
            }
        },
        error =>console.log("Error en nueva entrada producto",error),
        () =>console.log('entrada producto ok')
        );
    }else{
          console.log('ENTRADAS PRODUCTO OFFLINE');
    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      db2.executeSql("Select * FROM entradasMP",[]).then((data) => {
      console.log ("resultado entradas" + data.rows.length);
      this.source='local';
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
                "idResultadoChecklist":data.rows.item(index).idResultadoChecklist,
                "albaran":data.rows.item(index).albaran,
                // "checklist":true,
                "checklistControles":this.setTemplateControles(),
                "imagen":null
          });
        }
        // console.log("entradas -> ",this.entradasMP);
        // if (this.entradasMP.length > 0)
        // this.setLote(0);
        this.loadEntradasMPG();
  }, (error) => {
      console.log("ERROR -> " + JSON.stringify(error.err));
      alert("error " + JSON.stringify(error.err));
  }); 
      });

    }
  }

  loadEntradasMPG(){
    this.entradasMPGroupByAlbaran=[];
    console.log("entradas -> ",this.entradasMP,this.entradasMPGroupByAlbaran);
    let x=0;
    this.entradasMP.forEach((entradaMP)=>{
      let indiceEntrada = this.entradasMPGroupByAlbaran.findIndex((entrada)=>entrada.albaran==entradaMP.albaran);
      if (indiceEntrada<0){
        this.entradasMPGroupByAlbaran.push(entradaMP);
        this.entradasMPGroupByAlbaran[x]["checklistControles"]=this.setTemplateControles();
        x++;
      }
    });
    console.log("entradas -> ",this.entradasMPGroupByAlbaran);
    if (this.entradasMPGroupByAlbaran.length > 0)
    this.setLote(0);
  }
//   getServicios(){
//     return new Promise((resolve,reject)=>{
//       if (this.network.type != 'none') {
//     let param = "&entidad=serviciosDeEntrada&idempresa="+localStorage.getItem('idempresa')+"&WHERE=idResultadoChecklist is null";
//     setTimeout(()=>{
//     this.servidor.getObjects(URLS.STD_ITEM,param).subscribe(
//       response => {
//         this.servicios=[];
//         if (response["success"] && response["data"]) {
//           console.log('servicio de entrada ok',response["data"]);
//           let resultado = '';
//           let entradas = response["data"];
//           console.log('resultado entradas: ' + entradas);
//             entradas.forEach (entrada => {
//               this.servicios.push({
//                 'idEntrada':entrada.idEntradasMP,
//                 'albaran':entrada.albaran
//               }
//               )
//               resultado += entrada.idEntradasMP + ' OR id=';
//             });
//             resultado = resultado.substr(0,resultado.length-7);
//             resolve (resultado);
//         }
//         else{
//           resolve (false)
//         }
//     },
//     error => {
//       console.log("Error en nueva entrada producto",error);
//       resolve (false);
//     },
//     () =>console.log('entrada producto ok')
//     );
//   },1000);
// }else{
//   this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
//     db2.executeSql("Select * FROM serviciosEntrada",[]).then((data) => {
//     console.log ("resultado servicios" + data.rows.length);
//     this.servicios=[];
//     // console.log('servicio de entrada ok',response["data"]);
//      let resultado = '';
//     // let entradas = response["data"];
//     // console.log('resultado entradas: ' + entradas);
//     //   entradas.forEach (entrada => {
//     //     this.servicios.push({
//     //       'idEntrada':entrada.idEntradasMP,
//     //       'albaran':entrada.albaran
//     //     }
//     //     )
//     //     resultado += entrada.idEntradasMP + ' OR id=';
//     //   });
//     //   resultado = resultado.substr(0,resultado.length-7);
//     //   resolve (resultado);
//     for (var index=0;index < data.rows.length;index++){
//         this.servicios.push({
//           'idEntrada':data.rows.item(index).idEntradaLocal,
//           'albaran':data.rows.item(index).albaran
//         });
//         resultado += data.rows.item(index).idEntradaLocal + ' OR id=';
//       }
//       resultado = resultado.substr(0,resultado.length-7);
//       resolve (resultado);
// }, (error) => {
//     console.log("ERROR -> " + JSON.stringify(error.err));
//     alert("error " + JSON.stringify(error.err));
//     resolve (false)
// }); 
//     });
// }
//   });
//   }

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
console.log('ENTRADA (ALBARAN) SELECCIONADA',idLote);
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

checkControles(){
  console.log('checkControles',this.isActualChecklistComplete);
  this.isActualChecklistComplete=true;
  this.checklistcontroles.forEach((control)=>{
      if (control.checked == '') this.isActualChecklistComplete=false;
  });
  console.log(this.isActualChecklistComplete);

}

updateEntrada(){


}

}
