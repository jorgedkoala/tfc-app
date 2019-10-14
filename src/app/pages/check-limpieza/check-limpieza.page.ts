import { Component, OnInit } from '@angular/core';
import { ToastController,ActionSheetController, Events, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { URLS, checkLimpieza,limpiezaRealizada, Incidencia } from '../../models/models';
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
  selector: 'app-check-limpieza',
  templateUrl: './check-limpieza.page.html',
  styleUrls: ['./check-limpieza.page.scss'],
  providers: [SyncPage]
})
export class CheckLimpiezaPage implements OnInit {

  public nombreLimpieza: string;
  public checkLimpiezas:checkLimpieza[]=[];
  public incidencias:Incidencia[]=[];
  public hayIncidencia:any[];
  public indexIncidenciaActivada:number;
  public checks:boolean[];
  public idlimpiezazona:number;
  public limpiezaRealizada: limpiezaRealizada;
  public hoy: Date = new Date();
  public fecha_prevista: Date;
  //public periodicidad: any;
  public hayRetraso: number;
  public autocompletar:boolean=false;
  public numProcesados:number;
  public idempresa = localStorage.getItem("idempresa");
  public idusuario = sessionStorage.getItem("idusuario");


  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  private toastCtrl: ToastController, 
  public actionSheetCtrl: ActionSheetController,
  private sync: SyncPage, 
  private initdb: Initdb,
  public events: Events,
  public platform: Platform
  ) {
    let limpieza = this.servidor.getParam();
    this.idlimpiezazona =  limpieza.idlimpiezazona;
    this.nombreLimpieza = limpieza.nombrelimpieza;
    this.fecha_prevista = limpieza.fecha;
  }

  //*************  INIT *************/
  ngOnInit() {
    this.platform.ready().then(() => {
      if (!this.checks) {
        console.log('crea Checks',this.checks);
        this.checks=[];
      }else{
        if (this.indexIncidenciaActivada>-1){
          this.hayIncidencia[this.indexIncidenciaActivada]=false;
          this.checks[this.indexIncidenciaActivada]=false;
        }
      }
        console.log('ionViewDidEnter CheckLimpiezaPage',this.checks);
    
    
        this.getLimpiezas();
    
    
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
    });
  }

  goTo(link?){
    if (!link) link='/home/checkLimpiezas'
    this.router.navigateByUrl(link);
  }

  //*************  FUNCTIONS *************/


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
  
  
  getLimpiezas(){
    this.checkLimpiezas =[];
    //this.hayIncidencia=[];
     let fecha = moment(new Date()).format('YYYY-MM-DD');
                    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
                    //this.checklistList = data.rows;
                    db2.executeSql("Select * FROM checklimpieza WHERE idlimpiezazona = ? AND idusuario = ? AND fecha <= ?", [this.idlimpiezazona, sessionStorage.getItem("idusuario"),fecha]).then((data) => {
                    
                    console.debug(data.rows.length);
                        for (var index=0;index < data.rows.length;index++){
                          let isbeforedate = moment(data.rows.item(index).fecha).isBefore(this.hoy,'day');
                          let repeticion = this.checkPeriodo(data.rows.item(index).periodicidad);
                          let check =false;

///ACTIVAR DESACTIVAR BUSCAR Y PERMITIR AUTORRELLENO PARA REPETICIONES PENDIENTES
                        //   if (!this.hayRetraso && repeticion != "por uso"){
                        // this.hayRetraso = this.periodos.hayRetraso(data.rows.item(index).fecha,JSON.parse(data.rows.item(index).periodicidad));
                        //   }

                        
                          if(this.checks){
                          if (this.checks[index]) {
                            // this.bloqueaCheck;
                            check = true;
                          };
                          }
  //id , idlimpiezazona ,idusuario , nombrelimpieza , idelemento , nombreelementol , fecha , tipo , periodicidad , productos , protocolo
                          this.checkLimpiezas.push(new checkLimpieza(data.rows.item(index).id,data.rows.item(index).idlimpiezazona,data.rows.item(index).nombrelimpieza,data.rows.item(index).idelemento,
                          data.rows.item(index).nombreelementol,data.rows.item(index).fecha,data.rows.item(index).tipo,data.rows.item(index).periodicidad,data.rows.item(index).productos,
                          data.rows.item(index).protocolo,check,data.rows.item(index).idusuario,data.rows.item(index).responsable,repeticion,isbeforedate,data.rows.item(index).supervisor));
                          //this.checkLimpiezas.push(data.rows.item(index));
                          
                      }
                      if (!this.hayIncidencia) this.hayIncidencia = new Array(this.checkLimpiezas.length)
                      console.log ("hayIncidencias:", this.hayIncidencia);
                    console.log ("checkLimpiezas:", this.checkLimpiezas);
                }, (error) => {
                    console.debug("ERROR home. 342-> " + JSON.stringify(error.err));
                    alert("error home. 342" + JSON.stringify(error.err));
                }); 
                    });
  }
  
  checkPeriodo(periodicidad):string{
  let repeticion;
  repeticion = JSON.parse(periodicidad)
  return repeticion.repeticion;
  }
  
  terminar(){
    console.debug("terminar",this.checkLimpiezas);
    this.numProcesados = this.checkLimpiezas.filter(element=>element.checked==true).length;
    let x = 0;
    this.checkLimpiezas.forEach((elemento)=>{
      console.log("terminar2",elemento.nombreElementoLimpieza,elemento.checked,elemento.periodicidad);
  if (elemento.checked){
    let fecha;
   // (this.autocompletar)? fecha = moment(elemento.fecha_prevista).add('h',this.hoy.getUTCHours()).add('m',this.hoy.getUTCMinutes()).format('YYYY-MM-DD HH:mm'): fecha= moment(this.hoy).format('YYYY-MM-DD HH:mm');
   fecha= moment(this.hoy).format('YYYY-MM-DD HH:mm')
    this.guardarLimpiezaRealizada(elemento,fecha,x)
    console.log("TERMINAR",elemento);
  
  }
  x++;
  });
  
  
  }
  
  guardarLimpiezaRealizada(elemento: checkLimpieza, fecha:Date, x?){
  
    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
      let fecha_prevista =  moment(elemento.fecha_prevista).format('YYYY-MM-DD');
  
      // if (elemento.descripcion =="por uso"){
      //   fecha_prevista = moment(new Date()).format('YYYY-MM-DD');
      // }else{
      //   fecha_prevista =  moment(elemento.fecha_prevista).format('YYYY-MM-DD');
      // }
  
      // (this.autocompletar)? fecha = moment(this.fecha_prevista).add('h',this.hoy.getUTCHours()).add('m',this.hoy.getUTCMinutes()).format('YYYY-MM-DD HH:MM'): fecha= moment(this.hoy).add('h',this.hoy.getUTCHours()).add('m',this.hoy.getUTCMinutes()).format('YYYY-MM-DD HH:MM');
  
        db2.executeSql('INSERT INTO resultadoslimpieza (idelemento, idempresa, fecha_prevista,fecha, nombre, descripcion, tipo, idusuario, responsable,  idlimpiezazona, idsupervisor ) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          //[0,0,'2017-05-29','test','rtest','interno',0,'jorge',0]).then(
          [elemento.idElementoLimpieza,this.idempresa,fecha_prevista,fecha,elemento.nombreLimpieza + " " + elemento.nombreElementoLimpieza,elemento.descripcion,elemento.tipo,this.idusuario,elemento.responsable,elemento.idLimpieza,elemento.supervisor]).then(
    (Resultado) => {
      console.log("INSERTED ResultadoLimpieza:",Resultado, x, this.hayIncidencia[x] )
      if (this.hayIncidencia[x] > 0){
        db2.executeSql('UPDATE incidencias set idElemento = ? WHERE id = ?',[Resultado.insertId,this.hayIncidencia[x]]).then(
          (Resultado) => { console.log("update_Incidencia_ok:",Resultado);}
          ,
          (error) => {
          console.log('ERROR UPDATE INCIDENCIA',JSON.stringify(error))
          });
      }
        this.updateFecha(elemento,fecha);
        localStorage.setItem("syncchecklimpieza", (parseInt(localStorage.getItem("syncchecklimpieza")) + 1).toString());
        this.initdb.badge += 1;
        //console.log("updated fecha: ",proxima_fecha,elemento.fecha_prevista);
    },
    (error) => {console.log("eeror",error)});
  },
    (error) => {console.log("eeror",error)});
  }
  
  
  updateFecha(elemento: checkLimpieza,fecha : Date){
    console.log("###updating fecha",elemento);
  //updateFecha(fecha,completaFechas, idElemento){
    let proxima_fecha;
    let periodicidad = JSON.parse(elemento.periodicidad);
    if (moment(fecha).isValid() && periodicidad.repeticion != "por uso") {
      proxima_fecha = moment(this.periodos.nuevaFecha(periodicidad,fecha,this.autocompletar)).format('YYYY-MM-DD');
    } else {
      proxima_fecha = moment(this.periodos.nuevaFecha(periodicidad,this.hoy)).format('YYYY-MM-DD');
    }
    
    console.log("updating fecha",proxima_fecha);
    if (moment(proxima_fecha).isAfter(moment(),'day') || periodicidad.repeticion == "por uso"){
      console.log("updateFecha 1",elemento);
      this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
    //******UPDATE FECHA LOCAL*/
    //******UPDATE FECHA LOCAL*/
    //db2.executeSql('UPDATE checklimpieza set  fecha = ? WHERE id = ?',[proxima_fecha,elemento.id]).then
    db2.executeSql('UPDATE checklimpieza set  fecha = ? WHERE idelemento = ?',[proxima_fecha,elemento.idElementoLimpieza]).then

    ((Resultado) => {
         console.log("updated fecha:2 ", Resultado);
    },
    (error) => {
      console.debug('ERROR ACTUALIZANDO FECHA', error);
     });
      });      
      this.numProcesados--;  
      if (this.network.type != 'none') {
        console.log("conected**");
        if (this.numProcesados==0) {
          this.events.publish('sync',{'estado':'start'});
          console.log('***START SENDED');
          this.sync.sync_checklimpieza();
        }
      }
      else {
        console.log("update badge syncchecklimpieza");
        //this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"));
      }
      
      if (this.numProcesados==0) setTimeout(()=>{
          //this.navCtrl.pop()
          this.goTo();
          },500);
      
          }else{
  
            // console.log("sigue programando: ",proxima_fecha);
            // this.fecha_prevista = proxima_fecha;
            // this.terminar();
            console.log("sigue programando: ",proxima_fecha);
            elemento.fecha_prevista = proxima_fecha;
            //limpiezaRealizada.fecha_prevista = proxima_fecha;
            //(limpiezaRealizada.fecha = proxima_fecha;
            this.guardarLimpiezaRealizada(elemento,proxima_fecha);
          }
  }
  
  
  
  
  
  
 async   opciones(control) {
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
      let actionSheet = await this.actionSheetCtrl.create({
        header: 'Opciones',
        buttons: [
          {text: correcto,icon:'checkmark-circle',handler: () => {control.checked='true';control.valor = '';}},
          // {text: incorrecto,icon:'close-circle',handler: () => {control.checked='false';control.valor = '';}},
          // {text: aplica,icon:'help-circle',handler: () => {control.checked='na';control.valor = '';}},
        //  {text: valor,icon:'information-circle',handler: () => {this.setValor(control);}},
        //  {text: descrip,icon:'clipboard',handler: () => {this.editar(control);}},
        //  {text: 'Foto',icon:'camera',handler: () => {this.takeFoto(control);}},
          {text: cancel,role: 'cancel',handler: () => {console.debug('Cancel clicked');}}
          ]
           });
      actionSheet.present();
    }
  
  
  
    nuevaFecha(limpieza: checkLimpieza){
        let periodicidad = JSON.parse(limpieza.periodicidad)
        let hoy = new Date();
        let proximaFecha;
        
        switch (periodicidad.repeticion){
          case "diaria":
          proximaFecha = this.nextWeekDay(periodicidad);
          break;
          case "semanal":
          proximaFecha = moment(limpieza.fecha_prevista).add(periodicidad.frecuencia,"w");
          while (moment(proximaFecha).isSameOrBefore(moment())){
          limpieza.fecha_prevista = proximaFecha;
          proximaFecha = moment(limpieza.fecha_prevista).add(periodicidad.frecuencia,"w");
          }
          break;
          case "mensual":
          if (periodicidad.tipo == "diames"){
              proximaFecha = moment(limpieza.fecha_prevista).add(periodicidad.frecuencia,"M");
          } else{
            proximaFecha = this.nextMonthDay(limpieza,periodicidad);
          }
  
          break;
          case "anual":
          if (periodicidad.tipo == "diames"){
            let año = moment(limpieza.fecha_prevista).get('year') + periodicidad.frecuencia;
          proximaFecha = moment().set({"year":año,"month":parseInt(periodicidad.mes)-1,"date":periodicidad.numdia});
          } else{
            proximaFecha = this.nextYearDay(limpieza,periodicidad);
          }
          break;
        }
        let newdate;
        newdate = moment(proximaFecha).toDate();
        return newdate = new Date(Date.UTC(newdate.getFullYear(), newdate.getMonth(), newdate.getDate()))
  }
  
  
  nextWeekDay(periodicidad:any, fecha?:Date) {
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
  
  nextMonthDay(limpieza: checkLimpieza, periodicidad: any){
    let  proximafecha;
    let fecha_prevista = new Date(limpieza.fecha_prevista);
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
  nextYearDay(limpieza: checkLimpieza, periodicidad: any){
    let proximafecha;
    let fecha_prevista = new Date(limpieza.fecha_prevista);
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
  
  nuevaIncidencia(evento,elementoLimpieza,i){
    console.log(evento);
    console.log(this.hayIncidencia[i],typeof(this.hayIncidencia[i]));
    if (this.hayIncidencia[i]){
      this.hayIncidencia[i]=false;
    }else{
      console.log(i,this.hayIncidencia);
    this.checks[i] = true;
    this.indexIncidenciaActivada = i;
    let incidencia = elementoLimpieza.nombreElementoLimpieza + ' en Zona '  + this.nombreLimpieza;
    let descripcion = ''
    let params= new Incidencia(null,null,incidencia,'',parseInt(sessionStorage.getItem("iduser")),
    parseInt(localStorage.getItem("idempresa")),'Limpiezas',null ,'limpieza_realizada',this.idlimpiezazona,null,descripcion,-1)
    //this.navCtrl.push(IncidenciasPage,params);
    this.servidor.setIncidencia(params);
    this.goTo('/incidencias');
    this.events.subscribe('nuevaIncidencia',(param)=>{
      this.hayIncidencia[i] = param.idLocal;
      this.indexIncidenciaActivada=-1;
      console.log(i,this.hayIncidencia);
      
      this.events.unsubscribe('nuevaIncidencia');
      this.servidor.setIncidencia(null);
    })
  }
  
  }
  
  clickCheck(i){
    if (event){
    console.log(event);
    this.checks[i]= !this.checks[i];
    console.log(this.checks);
    }else{
      console.log('bloqueado el cambio por carga inicial');
    }
  }
  
async  showHelp(elem){
    let texto ='';
    this.translate.get("incidenciaTooltip").subscribe((text)=>{texto=text})
    const toast = await this.toastCtrl.create({
      message: texto,
      duration: 3000,
      position: 'top'
    });
  
    toast.onDidDismiss();
    //   () => {
    //   console.log('Dismissed toast');
    // });
  
    toast.present();
  }
  
  
}
