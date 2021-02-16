import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
// import {  Events } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Initdb } from '../../services/initdb';
import { Servidor } from '../../services/servidor';
import { URLS, Incidencia } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
import { EventosService } from '../../services/eventos.service';
import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
import {SyncPage} from '../sync/sync.page';


//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-control',
  templateUrl: './control.page.html',
  styleUrls: ['./control.page.scss'],
  providers: [SyncPage]
})
export class ControlPage implements OnInit {
  public base64Image: string;
  public nombre: string;
  public pla: string;
  public idcontrol: number;
  public valor: number;
  public valorObjetivo: number;
  public control: any;
  public desactivado: boolean;
  public fecha_prevista: Date;
  public periodicidad: any;
  public hayRetraso: number;
  public autocompletar:boolean=false;
  public hoy: Date = new Date();
  //public teclado: string;
  public hayIncidencia: number = 0;
  public hayIncidenciaAd: number =0;
  public valorText:string="";
  public teclado:string="text";
  public inputActive:boolean=false;




  constructor(
  private platform: Platform,
  public router: Router,
  public translate: TranslateService,
  public initdb: Initdb, 
  public servidor: Servidor, 
  public db :SQLite,
  public camera: Camera,
  public socialsharing: SocialSharing,
  public network:Network, 
  public periodos: PeriodosProvider,
  public sync: SyncPage,
  // public events: Events,
  public eventos: EventosService,
  public alertController: AlertController
  ) {

    this.control = this.servidor.getParam();
    console.log(this.control);
    this.nombre = this.control.nombre;
    this.pla = this.control.pla;
    this.idcontrol = this.control.id;
    this.fecha_prevista = this.control.fecha;
    this.valorObjetivo = this.control.objetivo;
    try{
    this.periodicidad = JSON.parse(this.control.periodicidad);
    }catch(e){
      this.periodicidad = {repeticion:'por uso'}
    }
    //this.base64Image = "false";
    this.desactivado = false;
   // this.storage = new Storage(SqlStorage, {name: 'tfc'});
  //  translate.use('es');
  console.log('VALOR OBJETIVO',this.valorObjetivo);
  if (this.valorObjetivo<0) {
    console.log('VALOR OBJETIVO')
    // this.setValue(this.valorObjetivo);
    //  this.valor=this.valorObjetivo;
    // this.valor = parseInt(String.fromCharCode(45));
  }
  //this.valor = this.valorObjetivo
  }
  
  checkObjetivo(VL){
    console.log(VL);
    if (this.valorObjetivo<0) {
      VL.value = String.fromCharCode(45);
    }
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.teclado=localStorage.getItem('teclado');
    this.sync.login();
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


///ACTIVAR DESACTIVAR BUSCAR Y PERMITIR AUTORRELLENO PARA REPETICIONES PENDIENTES
    // if (this.periodicidad.repeticion!='por uso'){
    // this.hayRetraso = this.periodos.hayRetraso(this.fecha_prevista,this.periodicidad);
    // }



  });
  }

  goTo(link?){
    console.log('GOTO',link);
    if (!link) link='/home/controles'
this.router.navigateByUrl(link, {replaceUrl:true});


  }











  isTokenExired (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    //return JSON.parse(window.atob(base64));
    let jwt = JSON.parse(window.atob(base64));
    console.log (moment.unix(jwt.exp).isBefore(moment()));
   return moment.unix(jwt.exp).isBefore(moment());
}
checkrangoerror(idcontrol){
let fuerarango = "false";
if (!isNaN(this.control.minimo) && this.control.minimo != null){
if (this.valor < this.control.minimo) {
console.debug("valor minimo");
fuerarango = "valorminimo";
} 
}
if (!isNaN(this.control.maximo) && this.control.maximo != null){
if (this.valor > this.control.maximo){
console.debug("valor maximo");
fuerarango = "valormaximo";
} 
}
// if (!isNaN(this.control.tolerancia) && this.control.tolerancia != null){
//   if (this.valor >= this.control.tolerancia){
//    console.debug("valor tolerancia"); 
//     fuerarango = "tolerancia";
//   }  
// }
if (!isNaN(this.control.critico) && this.control.critico != null){
if (this.valor > this.control.critico){
console.debug("valor critico"); 
fuerarango = "critico";
}  
}
if (fuerarango != "false") {
//this.sendalert(fuerarango);
this.creaIncidencia(fuerarango);
}
}

creaIncidencia(incidencia){
  
let control,valorc, minimo,maximo, tolerancia,critico : string;
this.translate.get("control").subscribe(resultado => { control = resultado});
this.translate.get("valorc").subscribe(resultado => { valorc = resultado});
this.translate.get("minimo").subscribe(resultado => { minimo = resultado});
this.translate.get("maximo").subscribe(resultado => { maximo = resultado});
this.translate.get("tolerancia").subscribe(resultado => { tolerancia = resultado});
this.translate.get("critico").subscribe(resultado => { critico = resultado});

let bcontrol =  "control: "+this.control.nombre;
let bvalorc = valorc + this.valor;
let bminimo = minimo+ (this.control.minimo ==null ? "":this.control.minimo);
let bmaximo = maximo+ (this.control.maximo ==null ? "":this.control.maximo);
let btolerancia = tolerancia+ (this.control.tolerancia ==null ? "":this.control.tolerancia);
let bcritico = critico+ (this.control.critico ==null ? "":this.control.critico);
//let cabecera= '<br><img src="assets/img/logo.jpg" /><hr>';
let inci =  this.control.nombre + ' a ' + this.valor + ' ' + this.pla;
let descripcion = bcontrol+'&#10;&#13;'+ bvalorc+'&#10;&#13;'+ bminimo+'&#10;&#13;'+ bmaximo+'&#10;&#13;' +btolerancia+'&#10;&#13;'+bcritico+'&#10;&#13;';
let idcontrol = this.idcontrol;
let fecha = moment(this.hoy).format('YYYY-MM-DD HH:mm');
let mensaje;
this.translate.get("alertas."+incidencia).subscribe(resultado => { mensaje = resultado});
this.db.create({name: 'data.db',location: 'default'})
.then((db2: SQLiteObject) => { db2.executeSql('INSERT INTO incidencias (fecha, incidencia, solucion, responsable, idempresa, origen, idOrigen, origenasociado, idOrigenasociado, foto, descripcion, estado, idElemento) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
[fecha, inci,'',parseInt(sessionStorage.getItem("idusuario")),parseInt(localStorage.getItem("idempresa")),'Controles',idcontrol,'Controles',0,this.base64Image,mensaje,-1,]).then(
(Resultado) => { console.log("insert_incidencia_ok:",Resultado);
this.hayIncidencia= Resultado.insertId;
// if (this.network.type != 'none') {
//   console.debug("conected");
//   this.sync.sync_incidencias();
// }
// else
// {
// console.debug ("suma:" + localStorage.getItem("syncincidencia"));
//   localStorage.setItem("syncincidencia",(parseInt(localStorage.getItem("syncincidencia"))+1).toString());
//   console.debug("this.myapp.badge",this.initdb.badge);
//   this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
// }
},
(error) => {
console.log('ERROR INSERTANDO INCIDENCIA',JSON.stringify(error))
});
});
this.presentAlert();
}

presentAlert() {
  this.translate.get('alertas.rangoerror').subscribe(
    async (valor)=>{
      const alert = await this.alertController.create({
        header: 'Alert',
        //subHeader: 'Subtitle',
        message: valor,
        buttons: ['OK']
      });
    
      await alert.present();

    })
}


terminar(){
// this.valor = parseFloat(this.valorText);
let idcontrol = this.idcontrol;
if (!isNaN(this.valor))
{
let fecha;
this.desactivado = true;
(this.autocompletar)? fecha = moment(this.fecha_prevista).add('h',this.hoy.getUTCHours()).add('m',this.hoy.getUTCMinutes()).format('YYYY-MM-DD HH:mm'): fecha= moment(this.hoy).format('YYYY-MM-DD HH:mm');
console.log(fecha);
this.checkrangoerror(idcontrol);
          //let db= new SQLite();
          this.db.create({name: 'data.db',location: 'default'})
          .then((db2: SQLiteObject) => { db2.executeSql('INSERT INTO resultadoscontrol (idcontrol, resultado, fecha, foto, idusuario) VALUES (?,?,?,?,?)',
          [idcontrol,this.valor, fecha, this.base64Image,sessionStorage.getItem("idusuario")]).then(
(Resultado) => { console.log("insert_ok:",Resultado);
            if (this.hayIncidencia > 0){
              db2.executeSql('UPDATE incidencias set idElemento = ? WHERE id = ?',[Resultado.insertId,this.hayIncidencia]).then(
                (Resultado) => { console.log("update_Incidencia_ok:",Resultado);}
                ,
                (error) => {
                console.log('ERROR UPDATE INCIDENCIA',JSON.stringify(error))
                });
            }
            if (this.hayIncidenciaAd > 0){
              db2.executeSql('UPDATE incidencias set idElemento = ? WHERE id = ?',[Resultado.insertId,this.hayIncidenciaAd]).then(
                (Resultado) => { console.log("update_Incidencia_ok:",Resultado);}
                ,
                (error) => {
                console.log('ERROR UPDATE INCIDENCIA',JSON.stringify(error))
                });
            }                    
//******UPDATE FECHA LOCAL*/
//******UPDATE FECHA LOCAL*/

this.updateFecha(this.fecha_prevista,this.autocompletar);
        },
(error) => {
console.debug(JSON.stringify(error))
});
});
}
else // NO HAY UN NUMERO EN RESULTADO
{
this.translate.get("alertas.errorvalor")
.subscribe(resultado => { alert(resultado);});
//alert(this.translate.instant("errorvalor")); 
} 
}

updateFecha(fecha,completaFechas){
console.log("update fecha",fecha, completaFechas);
let proxima_fecha;
if (moment(fecha).isValid() && this.periodicidad.repeticion != "por uso") {
proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,fecha,completaFechas)).format('YYYY-MM-DD');
} else {
proxima_fecha = moment(this.periodos.nuevaFecha(this.periodicidad,this.hoy)).format('YYYY-MM-DD');
}

console.log("updating fecha",proxima_fecha);
if (moment(proxima_fecha).isAfter(moment(),'day') || this.periodicidad.repeticion == "por uso"){
this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
db2.executeSql('UPDATE controles set  fecha = ? WHERE id = ?',[proxima_fecha, this.idcontrol]).then
((Resultado) => {
   console.log("updated fecha: ", Resultado);
},
(error) => {
console.debug('ERROR ACTUALIZANDO FECHA', error);
}); 
});        
if (this.network.type != 'none') {
console.debug("conected");
this.sync.sync_data_control();
}
else
{
console.debug ("suma:" + localStorage.getItem("synccontrol"));
localStorage.setItem("synccontrol",(parseInt(localStorage.getItem("synccontrol"))+1).toString());
console.debug("this.myapp.badge",this.initdb.badge);
this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
}
this.goTo();
}else{

  console.log("sigue programando: ",proxima_fecha,this.periodicidad.repeticion);
  this.fecha_prevista = proxima_fecha;
  this.terminar();
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
}).then(
  (imageData) => {
// imageData is a base64 encoded string
this.base64Image = "data:image/jpeg;base64," + imageData;
}, 
(err) => {
console.debug(err);
});
}

sendalert(alerta){
console.log(alerta);
let mensaje: string;
let subject: string;
let error: string;
let pie: string;
let control,valorc, minimo,maximo, tolerancia,critico : string;

this.translate.get("alertas."+alerta).subscribe(resultado => { mensaje = resultado});
alert (mensaje);
this.translate.get("email.subject").subscribe(resultado => { subject = resultado});
this.translate.get("email.body").subscribe(resultado => { error = resultado});
this.translate.get("email.pie").subscribe(resultado => { pie = resultado});
this.translate.get("control").subscribe(resultado => { control = resultado});
this.translate.get("valorc").subscribe(resultado => { valorc = resultado});
this.translate.get("minimo").subscribe(resultado => { minimo = resultado});
this.translate.get("maximo").subscribe(resultado => { maximo = resultado});
this.translate.get("tolerancia").subscribe(resultado => { tolerancia = resultado});
this.translate.get("critico").subscribe(resultado => { critico = resultado});
let bcontrol = control +": "+this.control.nombre;
let bvalorc = valorc + this.valor;
let bminimo = minimo+ (this.control.minimo ==null ? "":this.control.minimo);
let bmaximo = maximo+ (this.control.maximo ==null ? "":this.control.maximo);
let btolerancia = tolerancia+ (this.control.tolerancia ==null ? "":this.control.tolerancia);
let bcritico = critico+ (this.control.critico ==null ? "":this.control.critico);
//let cabecera= '<br><img src="assets/img/logo.jpg" /><hr>';
let parametros = bcontrol+'<br>'+ bvalorc+'<br>'+ bminimo+'<br>'+ bmaximo+'<br>' +btolerancia+'<br>'+bcritico+'<br>';
let empresa = '<br><h4>Empresa: ' + localStorage.getItem('empresa') + '</h4><br>'

let body;

if (this.network.type != 'none') {
body = mensaje + '<br>' + parametros + pie;
console.log("conected");
let param = '&idempresa=' + localStorage.getItem("idempresa") + '&body=' +body;
this.servidor.getObjects(URLS.SENDALERT, param).subscribe(
response => {
console.log('respuesta send alert: ', response);
if (response.success == 'true') {
// Guarda token en sessionStorage
//localStorage.setItem('token', response.token);

}
});
}
else
{
body = mensaje + '<br>' + parametros + pie +empresa;
console.log("preparando email:" + alerta);
this.socialsharing.canShareViaEmail().then(() => {
                this.socialsharing.shareViaEmail(
                  body, 
                  subject,
                  [localStorage.getItem("email")],
                  [ "alertes@proacciona.es"],
                  null,
                  this.base64Image).then(() => {
                      console.debug("email ready");
                }).catch(() => {
                      this.translate.get("alertas.nohayemail")
                      .subscribe(resultado => { alert(resultado);});
                });
}).catch(() => {
this.translate.get("alertas.nohayemail")
.subscribe(resultado => { alert(resultado);});
});
}
}

// sendalert2(alerta){
// let mensaje 
// this.translate.get("alertas.rangoerror").subscribe(resultado => { mensaje = resultado});
//   alert (mensaje);

//   EmailComposer.isAvailable().then((available: boolean) =>{
//  if(available) {

//             let email = {
//               to: 'jorged@ntskoala.com',
//              // cc: 'erika@mustermann.de',
//              // bcc: ['john@doe.com', 'jane@doe.com'],
//               attachments: [
//                // 'file://img/logo.png',
//                // 'res://icon.png',
//                 'base64:'+this.base64Image
//                // 'file://README.pdf'
//               ],
//               subject: 'Proacciona -> parametro fuera de rango permitido',
//               body: 'How are you? Nice greetings from Leipzig',
//               isHtml: true
//             };

//             // Send a text message using default options
//             EmailComposer.open(email);


//  }
//  else { this.translate.get("alertas.nohayemail").subscribe(resultado => { alert(resultado)});}
// },
// (error) => { console.debug(error)}
// );


// }

nuevaIncidencia(){
let incidencia =  this.nombre + ' a ' + this.valor + ' ' + this.pla;
let params= new Incidencia(null,null,incidencia,'',parseInt(sessionStorage.getItem("iduser")),
parseInt(localStorage.getItem("idempresa")),'Controles',this.control.id ,'Controles',0,this.base64Image,'',-1)
//this.navCtrl.push(IncidenciasPage,params);
this.servidor.setIncidencia(params);
this.goTo('/incidencias')
this.eventos.incidencia.subscribe((param)=>{
  console.log('Id Incidencia Local', param);
  this.hayIncidenciaAd = param["idLocal"];
  this.servidor.setIncidencia(null);
})
// this.events.subscribe('nuevaIncidencia', (param) => {
// // userEventData is an array of parameters, so grab our first and only arg
// console.log('Id Incidencia Local', param);
// this.hayIncidenciaAd = param.idLocal;
// this.servidor.setIncidencia(null);
// });
}

setValue(valorText:number | string){
if (typeof(valorText)=='string'){
switch(valorText){
case "del":
this.valorText =  this.valorText.substr(0,this.valorText.length-1);
break;
case ".":
this.valorText+=valorText;
break;
case "-":
this.valorText.substr(0,1) == '-'? this.valorText = this.valorText.substr(1,this.valorText.length-1):this.valorText = "-" + this.valorText;
break;
}
}else{
this.valorText+=valorText.toString();
}
}
}
