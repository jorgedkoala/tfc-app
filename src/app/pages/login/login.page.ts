import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, Event as NavigationEvent, NavigationEnd, } from '@angular/router';
import { AlertController,ActionSheetController, Platform, IonSlides, NavController } from '@ionic/angular';

//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { EventosService } from '../../services/eventos.service';
import { Initdb } from '../../services/initdb';
import { LoadingController } from '@ionic/angular';
import { URLS } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
// import {usuario} from '../../../environments/environment';

//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  public nombre: string="";
  public password: string="";
  public miDistancia: any;
  public logged;
  public accesomenu: any;
  public local: Storage;
  public result;
  public introvista;
  public logoempresa;
  public empresa = 0;
  public holding = 0;
  public nombreEmpresa:string='';
  public empresasHolding:any[]=[];
  public loader:any;
  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public data: Initdb,
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  public loadingCtrl: LoadingController,
  public eventos:EventosService,
  private alertCtrl: AlertController
  ) {}

  //*************  INIT *************/
  ngOnInit() {
    console.log('INIT login');

    console.log('LOGIN ROUTER EVENT: ',this.router.url,this.router.routerState)
    // console.log('LOGIN ROUTER MENU: ',this.router.url != '/login/menu');
            if (this.checkLogin() == true && this.router.url != '/login/menu'){
               console.log('GO HOME: ',this.checkLogin() == true,this.router.url != '/login/menu',this.router.url);
              this.goTo();
            }else{
               console.log('NO GO HOME: ',this.router.url != '/login/menu',this.router.url);
              this.permanentLoginDelete();
              // this.goTo('/config');
            }

    
    this.empresa = parseInt(localStorage.getItem("idempresa"));
    this.nombreEmpresa = localStorage.getItem("empresa");
    this.holding = parseInt(localStorage.getItem("holding"));
    this.logoempresa = URLS.SERVER +"logos/"+localStorage.getItem("idempresa")+"/logo.jpg";
    if (this.empresa > 0 && this.data.newDB){
      //this.doRefresh()
    }
    console.log(this.holding)
    if (this.holding > 0) {
      this.getHoldingCompanies();
    }
  }



  resetEmpresa() {
    this.empresa = parseInt(localStorage.getItem("idempresa"));
    this.nombreEmpresa = localStorage.getItem("empresa");
    this.holding = parseInt(localStorage.getItem("holding"));
    this.logoempresa = URLS.SERVER +"logos/"+localStorage.getItem("idempresa")+"/logo.jpg";
    console.log(this.holding)
  }


  goTo(link?){
    //this.appComponent.checkProveedores();
    if (!link) link='/home';
    console.log('GOTO ',link);
    this.router.navigateByUrl(link, {replaceUrl:true}).then(
      (valor)=>{console.log('went To:',valor)},
      (error)=>{console.log('error going: ',error)}
    )
  }

  //*************  FUNCTIONS *************/



  login(){
    console.log('comienza el proceso de login');
    if (this.nombre == "koala"){
      //sessionStorage.setItem("idusuario","koala");
  
      this.goTo('/empresa');
    }
    else{
    
    let mensaje: string;
  this.data.getLogin(this.nombre,this.password).then((data) => { 
        console.log("getlogin:", data);
        if (!isNaN(this.data.logged)){
          console.log('PERMANENT LOGIN');
          this.permanentLogin(data);
  
            this.goTo();
            }
          else{
              this.translate.get("alertas.maluser").subscribe(resultado => { mensaje = resultado});
              alert (mensaje);
          }
      },
      (error)=> {
              this.translate.get("alertas.maluser").subscribe(resultado => { mensaje = resultado});
              alert (mensaje);
        console.debug ("error: " + error)}
      );
    }
  }
  

  
  permanentLogin(user){
    let fecha =new Date().toString();
          localStorage.setItem("loggedTime",fecha);
          localStorage.setItem("nombre",this.nombre);
          localStorage.setItem("password",this.password);
          localStorage.setItem("idusuario",this.data.logged.toString());
          localStorage.setItem("tipoUser",user.tipouser);
          localStorage.setItem("superuser",user.superuser);
          localStorage.setItem("login",this.data.logged.toString());
          sessionStorage.setItem("nombre",this.nombre);
          sessionStorage.setItem("password",this.password);
          sessionStorage.setItem("idusuario",this.data.logged.toString());
  }
  permanentLoginDelete(){
    let fecha =new Date().toString();
          localStorage.removeItem("loggedTime");
          localStorage.removeItem("nombre");
          localStorage.removeItem("password");
          localStorage.removeItem("idusuario");
          localStorage.removeItem("tipoUser");
          localStorage.removeItem("superuser");
          localStorage.removeItem("login");
          sessionStorage.removeItem("nombre");
          sessionStorage.removeItem("password");
          sessionStorage.removeItem("idusuario");
          console.log('logged deleted')
  }
  checkLogin():boolean{
    console.log('CHECKLOGIN');
      let resultado:boolean;
    if (localStorage.getItem("loggedTime")){
    let ahora = moment(new Date());
    let fecha = moment(new Date(localStorage.getItem("loggedTime"))).add(24,"h");
    console.log(ahora,fecha);
    if (moment(fecha).isAfter(moment(ahora))){
      console.log('logged ok');
        resultado = true;
          this.data.logged = parseInt(localStorage.getItem("idusuario"));
          sessionStorage.setItem("nombre",localStorage.getItem("nombre"));
          sessionStorage.setItem("password",localStorage.getItem("password"));
          sessionStorage.setItem("idusuario",localStorage.getItem("idusuario"));
          sessionStorage.setItem("login",localStorage.getItem("login"));        
  
    }else{
      console.log('logged timeout');
      resultado = false;
    }
    }else{
      resultado = false;
    }
    console.log('CHECKLOGIN RESULTS',resultado);
    return resultado;
  }
  
  // onconect(){
  //   let connectSubscription = this.network.onConnect().subscribe(() => {
  //   //alert (Network.type);
  //       if (this.network.type != 'none') {
  //       if (parseInt(localStorage.getItem("synccontrol")) > 0) { this.sync.sync_data_control();}
  //       if (parseInt(localStorage.getItem("syncchecklist")) > 0) { this.sync.sync_data_checklist();}
  //     }
  // });
  // }
  
  
    doRefresh(refresher?) {
      console.debug('Begin async operation', refresher);
    //  this.presentLoading();
      this.data.sincronizate('LOGIN REFRESH').then(
      (response)=>{
        console.debug('######',response);
     //   this.loader.dismiss();
            setTimeout(() => {
        console.debug('Async operation has ended');
        refresher.target.complete();
      }, 2000);
    });
  
    }
  
  async  presentLoading() {
      this.loader = await this.loadingCtrl.create({
        message: "Actualizando...",
       // duration: 3000
      });
      return await this.loader.present();
      //loader.dismiss();
    }
      closeLoading(){
     setTimeout(() => {
        console.debug('Async operation has ended');
        this.loader.dismiss()
      }, 1000);
    }


    test(){
      console.log('testing1....');
      let param = '?user=pepa&password=pepa';
      this.servidor.login(URLS.LOGIN, param).subscribe(
        response => {
          if (response["success"] == 'true') {
            // Guarda token en sessionStorage
            localStorage.setItem('token', response["token"]);
            }
            });
 
    }
  

    getHoldingCompanies(){
      let param = '&idHolding='+this.holding;
      this.empresasHolding=[];
      this.servidor.getObjects(URLS.HOLDING,param).subscribe(
        (response)=>{
          response = JSON.parse(response.toString())
          if (response["success"] && response["data"]) {
            //  console.log(response["data"])
              for (let element of response["data"]) {  
                this.empresasHolding.push({'id':element.id,'nombre':element.nombre});
             }
             console.log('holding',this.empresasHolding);
             this.resetEmpresa();
            }else{
              console.log('error holding',response);
            }
        }
      )
    }
    selectEmpresa(event){
      console.log(event.detail.value);
      let navigationExtras: NavigationExtras = {
        state: {
          idEmpresa: event.detail.value
        },
        replaceUrl:true
      };
      this.router.navigateByUrl('/empresa', navigationExtras).then(
        (valor)=>{console.log('went To:',valor)},
        (error)=>{console.log('error going: ',error)}
      )
    }

    async confirmaChangeEmpresa(){
      let botones=[];
      
        botones.push(
          {'text':'ok',
          handler:'ok'}
        )
      const prompt = await this.alertCtrl.create({
        message: 'texto',
        inputs: [{name: 'valor'}],
        buttons: botones
        });
      await prompt.present();  
    }

}
