import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';
import {TranslateService  } from '@ngx-translate/core';
import { LoadingController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { EmpresaPage } from './pages/empresa/empresa.page';

import { Initdb } from './services/initdb';
import { Servidor } from './services/servidor';
import { URLS } from './models/models';
import { environment,vaqueria } from '../environments/environment';
const traspasos = vaqueria;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public loader:any;
  
  public produccion=environment['production']
  public appPages = [
    {title: 'menu.home',url: '/home',icon: 'home'},
   {title: 'menu.entradasMP',url: '/entradas-mp',icon: 'cart'},
    {title: 'menu.informes',url: '/informes',icon: 'print'},
    // {title: 'menu.supervision', url: '/supervision',icon: 'done-all'},
    {title: 'menu.incidencia', url: '/incidencias',icon: 'information-circle' },
    { title: 'menu.sync' , url: '/sync',icon: 'sync' },
    {title: 'menu.config',url: '/config',icon: 'cog'},
    { title: 'menu.login' , url: '/login',icon: 'key' },
  ];

  //if (localStorage.getItem("idempresa") == "26"){//Entorno produccion
  //if (localStorage.getItem("idempresa") == "33"){//Entorno produccion koala TESTS
   // if (localStorage.getItem("idempresa") == "77"){//Entorno Desarrollo
   // this.pages.push({title:'menu.traspaso',url: '/traspasos',icon: 'cog'})
  //}



  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public initdb: Initdb,
    private servidor: Servidor, 
    public translate: TranslateService,
    public network:Network,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      console.log('Produccion',this.produccion);
      console.log('versionusers',localStorage.getItem("versionusers"));
if (localStorage.getItem("versionusers") === null) {localStorage.setItem("versionusers","0")}
if (localStorage.getItem("synccontrol") === null) {localStorage.setItem("synccontrol","0")}
if (localStorage.getItem("syncchecklist") === null) {localStorage.setItem("syncchecklist","0")}
if (localStorage.getItem("syncchecklimpieza") === null) {localStorage.setItem("syncchecklimpieza","0")}
if (localStorage.getItem("syncsupervision") === null) {localStorage.setItem("syncsupervision","0")}
if (localStorage.getItem("syncmantenimiento") === null) {localStorage.setItem("syncmantenimiento","0")}
if (localStorage.getItem("syncincidencia") === null) {localStorage.setItem("syncincidencia","0")}
if (localStorage.getItem("lang") === null) {localStorage.setItem("lang","es")}

if (isNaN(parseInt(localStorage.getItem("inicializado")))) localStorage.setItem("inicializado","1");


//****************CHECK & START IDIOMA ***********/
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      if (localStorage.getItem("lang") =='ca'){
        this.translate.use(localStorage.getItem("lang"));
        this.translate.setDefaultLang(localStorage.getItem("lang"));
      }
//****************CHECK VERSION ******************/
      if (parseInt(localStorage.getItem("inicializado")) < this.initdb.versionDBLocal){
        console.log("iniciar",this.initdb.versionDBLocal);
        if (this.network.type != 'none') {
          console.log("hay red,--> inicializa()");
        this.initdb.inicializa();
        }else{
          alert ('No hay conexión, para sincronizar los datos');
        }
    }else{
      this.initdb.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
      console.log('Badge...',this.initdb.badge );
        this.hayUpdates().then(
        (versionActual)=>{
          if (versionActual == -1){
            console.log('ha habido un error # app.component:89');
          }else{
      console.debug("versionActual Usuarios",versionActual);
      if (versionActual > parseInt(localStorage.getItem("versionusers"))) {
        this.presentLoading();
        this.initdb.sincronizate('APP COMPONENT',versionActual.toString()).then(
          ()=>{
            this.closeLoading();
          }
        );
      }
          }
      });
}
      this.splashScreen.hide();
      console.log(localStorage.getItem("idempresa"));
//****************CHECK EMPRESA ******************/
      if (localStorage.getItem("idempresa") === null || localStorage.getItem("idempresa") == 'undefined'){
        console.log('dentro');
        this.presentEmpresa();
  

    //    modalEmpresa.present();
    //  this.nav.push(Empresa,null,null,()=>this.existe())
      }else{
        console.log('fuera');
        if (localStorage.getItem("idempresa") == traspasos && !this.existe()){
          this.appPages.push({title:'menu.traspasos',url:"/traspasos",icon:'repeat'})
        }

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
              }
          }else{
            localStorage.setItem('triggerEntradasMP','0');
          }
      },
  error =>{console.debug('hay Trigger servicios entrada', error);});
    }

      }



    });//************END PLATFORM READY */ 
  }

  async presentEmpresa(){
    //let opciones =  {showBackdrop: true,enableBackdropDismiss:true}
    console.log('presentModal1');
    const modalEmpresa = await this.modalCtrl.create({component:EmpresaPage,componentProps:{}});
    modalEmpresa.present();
    console.log('presentModal2');
    // .then(
    //   (valor)=>{
    //     console.log('VALOR EMPRESA',valor)
    //     if (localStorage.getItem("idempresa") == traspasos && !this.existe()){
    //       this.appPages.push({title:'menu.traspaso',url:"/traspasos",icon:''})
    //     }

    //   }
      
    // )
    const { data } = await modalEmpresa.onDidDismiss();
    console.log('VALOR EMPRESA',data)

    if (localStorage.getItem("idempresa") == traspasos && !this.existe()){
      this.appPages.push({title:'menu.traspaso',url:"/traspasos",icon:''})
    }
   
  // modalEmpresa.onDidDismiss((data) => {
  //  if (localStorage.getItem("idempresa") == "26" && !this.existe()){
  //    this.pages.push({title:'menu.traspaso',component:"TraspasosPage"})
  //  }
  // });
  }

  hayUpdates() {
    console.log('hay updates');
    let updates:number = -1;
    let parametros = '&idempresa=' + localStorage.getItem("idempresa")+"&entidad=empresas";
    return new Promise(resolve => {
        this.servidor.getObjects(URLS.VERSION_USERS, parametros).subscribe(
          response => {
            if (response.success == 'true' && response.data) {
              for (let element of response.data) {
                updates = element.updateusers;
              }
            }
        },
        (error)=>{
          console.log(error)
          resolve(updates);
      },
        ()=>{
            resolve(updates);
        });
    });
        //return updates;
    }

    existe(){
      let resultado;
    let indice = this.appPages.findIndex((page)=>page.url=="/traspasos");
    (indice < 0)? resultado = false: resultado = true;
    return resultado;
    }

    presentLoading() {
      console.debug('##SHOW LOADING 1');
      // this.loader = this.loadingCtrl.create({
      //   message: "Actualizando...",
      //  // duration: 3000
      // });
      this.loader=true;
      //loader.dismiss();
    }
      closeLoading(){
        console.debug('##HIDE LOADING 1');
     setTimeout(() => {
        console.debug('Async operation has ended');
        this.loader=false;
      }, 600);
    }

}
