import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';

//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { URLS } from '../../models/models';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Initdb } from '../../services/initdb';

//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.page.html',
  styleUrls: ['./empresa.page.scss'],
})
export class EmpresaPage implements OnInit {
  public empresa:number;
  public koala: boolean=false;
  public debug: boolean = false;
  public loader: any;
  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public initdb: Initdb,
  public db :SQLite,
  public network:Network, 
  public loadingCtrl: LoadingController,
  //public navCtrl: NavController,
  public mdlCtrl: ModalController
  ) {}

  //*************  INIT *************/
  ngOnInit() {
    console.log('EMPRESA INIT');
  }

  goTo(link?){
    if (!link) link='/home'
    console.log('goto',link);
    this.router.navigateByUrl(link).then(
      (valor)=>{console.log('ok going1',valor)},
      (error)=>{console.log('error going',error)}
      )
  }

  //*************  FUNCTIONS *************/


  setEmpresa(){
    console.log("es debug",this.debug);
  if (this.debug) {
   // this.sync.baseurl = 'http://tfc.ntskoala.com/api';
   // localStorage.setItem("modo","debug");
  }
  else
  {
   // this.sync.baseurl = 'http://tfc.proacciona.es/api';
    localStorage.setItem("modo","prod");
  }
  
  if (!isNaN(this.empresa)){
    let id = this.empresa.toString();
    let control1 = id.substring(0,2);
    let control2 = id.substring(id.length -2);
      if (control1 == '24' && control2 == '53'){
        let codigo = id.substring(2,id.length -2);
        localStorage.setItem("idempresa",codigo);
        this.presentLoading();
        console.log('go  sincronizado');
        this.initdb.sincronizate('EMPRESA').then(
          (data)=>{
            console.log('ok sincronizado',data);
            this.closeLoading();
            // if (this.routerOutlet.canGoBack()){
            // this.navCtrl.pop();
            // }else{
            //   this.goTo('/login');
            // }
            // this.dismiss();
            this.mdlCtrl.dismiss({'result': 'ok','idEmpresa':codigo}).then(
              (valor)=>{console.log('EMPRESA DISSMISED',valor)},
              (error)=>{console.log('EMPRESA DISSMISED',error)});
            this.dismiss();
          },
          (error)=>{
            console.log('ERROR Sincronizando',error)
            this.closeLoading();
            alert('error actualizando usuarios, vuelve a intentarlo. Prueba estirando hacia abajo');
          }
        );
       
       // this.navCtrl.pop();
        //this.viewCtrl.dismiss(codigo);
        
      }
      else //CODIGO ERRONEO
      {
            this.translate.get("empresa.errorcodigo")
      .subscribe(resultado => { alert(resultado);});
      }
    }
   else // NO HAY UN NUMERO EN RESULTADO
    {
      this.translate.get("alertas.errorvalor")
      .subscribe(resultado => { alert(resultado);});
     } 
  }
  dismiss(){
    console.log('going to login');
  this.goTo('/login');
  }
  
   async presentLoading() {
     console.debug('##SHOW LOADING');
      this.loader = await this.loadingCtrl.create({
        message: "Actualizando...",
       // duration: 3000
      });
      return await this.loader.present();
      //loader.dismiss();
    }
    closeLoading(){
      console.log('##CLOSE LOADING');
     setTimeout(() => {
        console.debug('Async operation has ended');
        this.loader.dismiss()
      }, 1000);
    }
  
}
