import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Platform, AlertController, IonSelect } from '@ionic/angular';

import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import {SyncPage} from '../sync/sync.page';
import { URLS,Almacen, Cliente, ProveedorLoteProducto, FamiliasProducto, Distribucion, dropDownMedidas,ServicioEntrada } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
import { ConnectableObservable } from 'rxjs';
import { format } from 'url';

//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-entradas-mp',
  templateUrl: './entradas-mp.page.html',
  styleUrls: ['./entradas-mp.page.scss'],
  providers: [SyncPage]
})
export class EntradasMPPage implements OnInit {
  @ViewChild('selProds') selProds:IonSelect;
  private cantidadTraspaso: number;
  public productos: any[]=[];
  public proveedores: any[]=[];
  public clientes: Cliente[]=[];
  public familias: FamiliasProducto[]=[];
  public entrada_productos: any[]=[];
  public proveedor:boolean=false;
  public idProveedorActual:number;
  public idProductoActual:number;
  public loteSelected:ProveedorLoteProducto=new ProveedorLoteProducto(null,'',new Date(),new Date(),null,'',0,'',0,0,parseInt(localStorage.getItem("idempresa")),null,null);
  // public loteSelected:ProveedorLoteProducto=new ProveedorLoteProducto(null,'LOT01',new Date(),new Date(),100,'g',100,'',9,6,2,null,null);
  public idempresa= localStorage.getItem("idempresa");
  public userId= sessionStorage.getItem("login");
  public ok:boolean=true;
  public medidas: object[]=dropDownMedidas;
  public hayTrigger:boolean=false;
  // public albaran:string='ALB001';
  public idsProveedores:any[];
  public synProveedores:any;
  public synProductos:any;
public today: string=moment().add(1,'days').format('YYYY-MM-DD');
public limitDate:string=moment().add(3,'years').format('YYYY-MM-DD');
public myform: FormGroup = new FormGroup({});
  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider,
  public platform: Platform,
  public sync: SyncPage,
  public alertController: AlertController,
  public formBuilder: FormBuilder
  ) {}

  //*************  INIT *************/
  ngOnInit() {
    this.platform.ready().then(() => {
      this.medidas = dropDownMedidas;
      //this.formControl();
      this.sync.login();
      if (this.isTokenExired(localStorage.getItem('token')) && this.network.type != 'none'){
        let param = '?user=' + sessionStorage.getItem("nombre") + '&password=' +sessionStorage.getItem("password");
        this.servidor.login(URLS.LOGIN, param).subscribe(
          response => {
            if (response["success"] == 'true') {
              // Guarda token en sessionStorage
              localStorage.setItem('token', response["token"]);
              this.preLoad();
              }
              });
      }else{
      this.preLoad();
      }
  });
    
  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link, {replaceUrl:true});
  }

  //*************  FUNCTIONS *************/
  isTokenExired (token) {
    if (token){
      console.log(token);
              var base64Url = token.split('.')[1];
              var base64 = base64Url.replace('-', '+').replace('_', '/');
              //return JSON.parse(window.atob(base64));
              console.log(window.atob(base64));
              let jwt = JSON.parse(window.atob(base64));
              console.log (moment.unix(jwt.exp).isBefore(moment()));
             return moment.unix(jwt.exp).isBefore(moment());
    }else{
      return true;
    }
  }

  formControl(){

    
  //   this.myform = this.formBuilder.group({
  //     albaran: ['',Validators.required],
  //     proveedor:['',Validators.required],
  //     producto:['',Validators.required],
  //     lote:['',Validators.required],
  //     fecha:['',Validators.required],
  //     cantidad:['',Validators.required],
  //     tipo_medida: ['',Validators.required]
  //  });
  }

  preLoad(){
    console.log('preload');
    if (this.network.type != 'none') {
    this.hayUpdates().then(
      (resultado)=>{
        console.log('updates results:', resultado);
      },
      (error)=>{console.log(error)}
    );
    this.syncProveedores();
    this.getFamilias();
    this.hayTriggerServiciosEntrada();
    }else{
      this.getProveedores();
      //this.getFamilias();
      //this.hayTriggerServiciosEntrada();      
    }
}

hayUpdates() {
  let updates:number = -1;
  let parametros = '&idempresa=' + localStorage.getItem("idempresa")+"&entidad=empresas";
  return new Promise(resolve => {
    this.servidor.getObjects(URLS.VERSION_USERS, parametros).subscribe(
      response => {
        response = JSON.parse(response.toString())
        if (response["success"] == 'true' && response["data"]) {
          for (let element of response["data"]) {
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

getFamilias() {
  let parametros = '&idempresa=' + this.idempresa+"&entidad=proveedores_familia";

      this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
          response = JSON.parse(response.toString())
          this.familias = [];
          if (response["success"] == 'true' && response["data"]) {
            for (let element of response["data"]) {
              this.familias.push(new FamiliasProducto(element.nombre,element.idempresa,element.nivel_destino,element.id));
            }
           // this.listaZonas.emit(this.limpiezas);
          }
      });
 }


getProveedores(){
  console.log('get proveedores');
  this.proveedores=[];
  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
    db2.executeSql("Select * FROM proveedores",[]).then((data) => {
    console.log ("resultado1 proveedores" + data.rows.length);
    this.proveedores.push({
      "id": 0,
      "nombre": "selecciona"
});    
    for (var index=0;index < data.rows.length;index++){
        this.proveedores.push({
              "id": data.rows.item(index).idproveedor,
              //"idchecklist": data.rows.item(index).idchecklist,
              "nombre": data.rows.item(index).nombre
        });
      }
      console.log(this.proveedores)
}, (error) => {
    console.log("ERROR getProveedores-> " + JSON.stringify(error.err));
    alert("error " + JSON.stringify(error.err));
}); 
    }
    
    );
}
getProductos(idProveedor:number){
  console.log(idProveedor,this.selProds);
  this.productos=[];
  this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
    db2.executeSql("Select * FROM productosProveedor WHERE idproveedor = ?",[idProveedor]).then((data) => {
    console.log ("resultado1 productos" + data.rows.length);
//     this.productos.push({
//       "id": 0,
//       "idproveedor": idProveedor,
//       "nombre": 'Producto'
// });
    for (var index=0;index < data.rows.length;index++){
        this.productos.push({
              "id": data.rows.item(index).idproducto,
              "idproveedor": data.rows.item(index).idproveedor,
              "nombre": data.rows.item(index).nombre
        });
      }
      setTimeout(()=>{this.selProds.open()},300);
}, (error) => {
    console.debug("ERROR -> " + JSON.stringify(error.err));
    alert("error " + JSON.stringify(error.err));
}); 
    });
}


cambioOrigen(){
  // if (this.proveedor){
  //     this.almacenOrigenSelected = null;
  // }
  // else{
  //     this.loteSelected = null;
  // }
}

getEntradasProducto(idProducto){
  // let filtro_inicio = moment(new Date()).format('YYYY-MM-DD').toString();
  // let filtro_fin = moment(new Date ()).format('YYYY-MM-DD').toString();
 this.loteSelected.idproducto=idProducto;
//  this.loteSelected =new ProveedorLoteProducto('nueva entrada',new Date(),new Date(),0,'',0,'',idProducto,this.idProveedorActual,parseInt(localStorage.getItem("idempresa")))
//this.entrada_productos.push(new ProveedorLoteProducto('nueva entrada',new Date(),new Date(),0,'l.',0,'',idProducto,this.idProveedorActual,parseInt(localStorage.getItem("idempresa"))));
 }

//  updateCantidad(){
//    this.loteSelected.cantidad_inicial= this.cantidadTraspaso;
//    this.loteSelected.cantidad_remanente= this.cantidadTraspaso;
//  }


setNuevaEntradaProveedor(){
  return new Promise((resolve)=>{
  this.loteSelected.cantidad_remanente= this.loteSelected.cantidad_inicial;
  this.db.create({name: 'data.db',location: 'default'})
  .then((db2: SQLiteObject) => { db2.executeSql('INSERT INTO entradasMP (numlote_proveedor, fecha_entrada, fecha_caducidad, cantidad_inicial, tipo_medida,cantidad_remanente,doc,idproducto,idproveedor,idempresa,albaran) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  [this.loteSelected.numlote_proveedor,moment(this.loteSelected.fecha_entrada).format('YYYY-MM-DD'), this.loteSelected.fecha_caducidad, this.loteSelected.cantidad_inicial,this.loteSelected.tipo_medida,this.loteSelected.cantidad_remanente,'',this.loteSelected.idproducto,this.loteSelected.idproveedor,this.loteSelected.idempresa,this.loteSelected.albaran]).then(
(Resultado) => {
  console.log(Resultado.insertId);
  console.log(moment(this.loteSelected.fecha_entrada).format('YYYY-MM-DD'));
  console.log(this.loteSelected.fecha_caducidad);
//******NUEVA ENTRADA?? O TERMINAR*/
resolve(true);
    // if (this.hayIncidencia > 0){
    //   db2.executeSql('UPDATE incidencias set idElemento = ? WHERE id = ?',[Resultado.insertId,this.hayIncidencia]).then(
    //     (Resultado) => { console.log("update_Incidencia_ok:",Resultado);}
    //     ,
    //     (error) => {
    //     console.log('ERROR UPDATE INCIDENCIA',JSON.stringify(error))
    //     });
    // }
    // if (this.hayIncidenciaAd > 0){
    //   db2.executeSql('UPDATE incidencias set idElemento = ? WHERE id = ?',[Resultado.insertId,this.hayIncidenciaAd]).then(
    //     (Resultado) => { console.log("update_Incidencia_ok:",Resultado);}
    //     ,
    //     (error) => {
    //     console.log('ERROR UPDATE INCIDENCIA',JSON.stringify(error))
    //     });
    // }                    


},
(error) => {
console.debug(JSON.stringify(error))
});
});

  });


//   let contadorP=0;
// let param = "&entidad=proveedores_entradas_producto"+"&field=idproveedor&idItem="+this.loteSelected.idproveedor;
//   this.servidor.postObject(URLS.STD_ITEM, this.loteSelected,param).subscribe(
//     response => {
//       if (response["success"]) {
//         this.loteSelected.id = response["id"];
//         console.log(this.loteSelected.id);
//         if (this.hayTrigger){
//           this.setServiciosDeEntrada(this.loteSelected.id);
//         }
//       }
//   },
//   error =>console.log("Error en nueva entrada producto",error),
//   () =>console.log('entrada producto ok')
//   );

}

hayTriggerServiciosEntrada(){
  //let where= encodeURI("entidadOrigen=\'proveedores_entradas_producto\' AND entidadDestino=\'checklist\'");
    let parametros = '&idempresa=' + this.idempresa+"&entidad=triggers";
      this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
        response => {
          response = JSON.parse(response.toString())
          console.log('TRIGGER SERVICIOS ENTRADA',response);
          if (response["success"] == 'true' && response["data"]) {
            console.log(response["data"],response["data"].length)

            for (let element of response["data"]) {
              if (element.entidadOrigen == 'proveedores_entradas_producto' && element.entidadDestino=='checklist'){
                this.hayTrigger=true;
                localStorage.setItem('triggerEntradasMP',element.idDestino);
              }
              }
          }
      },
  error =>{
      console.debug(error);
      this.errorEn('hay Trigger servicios entrada' + error);
      },
      ()=>{});
}

// setServiciosDeEntrada(idLote){
// let param = "&entidad=serviciosDeEntrada";
// let servicioEntrada=new ServicioEntrada(null,idLote,null,new Date(),this.albaran, parseInt(this.idempresa),null,null);
//   this.servidor.postObject(URLS.STD_ITEM, servicioEntrada,param).subscribe(
//     response => {
//       if (response["success"]) {
//         console.log('servicio de entrada ok');
//       }
//   },
//   error =>console.log("Error en nueva entrada producto",error),
//   () =>console.log('entrada producto ok')
//   );
// }



errorEn(motivo:string){
  alert ("Se ha producido iun corte en el proceso en: " + motivo);
  this.ok=true;
  }



  doRefresh(event) {
    console.log('Begin async operation');
    this.syncProveedores();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  syncProveedores(){
    let parametros = '&idempresa=' + this.idempresa+"&entidad=proveedores"; 
    this.servidor.getObjects(URLS.STD_ITEM, parametros).subscribe(
      (response:any) => {
        response = JSON.parse(response);
        let valores = '';
        this.idsProveedores=[];
        console.log("items proveedores",response)
        //this.proveedores.push({"id":0,"nombre":"selecciona"});
        if (response["success"] && response["data"]) {
          console.log("items proveedores is true")
          this.db.create({name: 'data.db',location: 'default'})
          .then((db2: SQLiteObject) => {
          db2.executeSql("DELETE from proveedores", []).then((data) => {
            console.log("deleted x items proveedores");
          },
        (error)=>{console.log('Deleting proveedores ERROR',error)});
        }
      );
          for (let element of response["data"]) { 
              //this.proveedores.push({"id":element.id,"nombre":element.nombre});
              valores+="("+element.id+",'"+element.nombre+"'),"
            this.idsProveedores.push(element.id);
         }
         valores = valores.substr(0,valores.length-1);
         this.db.create({name: 'data.db',location: 'default'})
         .then((db2: SQLiteObject) => { db2.executeSql('INSERT INTO proveedores (idproveedor, nombre) VALUES '
          + valores,[]).then(
       (Resultado) => { console.log("insert_proveedores_ok:",Resultado);
       this.syncProductos();
       this.getProveedores();
        },
        (error) => { console.log("ERROR insert_proveedores_ok:",error);
    });
  })
  }
},
    error=>console.log(error),
    ()=>{}
    ); 
  }

  syncProductos(){
    let proveedores=this.idsProveedores[0];
    for (let x=1;x< (this.idsProveedores.length);x++){
      proveedores+= ' OR idproveedor=' +this.idsProveedores[x];
    }
    let param = "&entidad=proveedores_productos"+"&field=idproveedor&idItem="+proveedores;
    this.servidor.getObjects(URLS.STD_SUBITEM, param).subscribe(
      response => {
        response = JSON.parse(response.toString())
        let valores = '';
        //this.proveedores.push({"id":0,"nombre":"selecciona"});
        if (response["success"] && response["data"]) {
          this.db.create({name: 'data.db',location: 'default'})
          .then((db2: SQLiteObject) => {
          db2.executeSql("DELETE from productosProveedor", []).then((data) => {
            console.log("deleted x items productos");
          },
        (error)=>{console.log('Deleting productos ERROR',error)});
        }
      );
          for (let element of response["data"]) { 
              //this.proveedores.push({"id":element.id,"nombre":element.nombre});
              valores += "("+element.id+","+element.idproveedor+",'"+element.nombre+"'),"
         }
         valores = valores.substr(0,valores.length-1);
         this.db.create({name: 'data.db',location: 'default'})
         .then((db2: SQLiteObject) => { db2.executeSql('INSERT INTO productosProveedor (idproducto, idproveedor, nombre) VALUES '
         + valores,[]).then(
       (Resultado) => { console.log("insert_proveedores_ok:",Resultado);
        },
        (error) => { console.log("ERROR insert_proveedores_ok:",error);
    });
  })
  }
},
    error=>console.log(error),
    ()=>{}
    );    

  }


  async askOption() {
    if (this.myform.valid){
    const alert = await this.alertController.create({
      header: 'Entrada MP',
      subHeader: 'Añadir entrada y después,',
      // message: 'Crear nueva entrada del albaran o terminar?',
      buttons: [
        {
          text: 'Nueva entrada',
          handler: () => {
            console.log('Nueva');
            this.setNuevaEntradaProveedor().then(()=>{
            let albaran= this.loteSelected.albaran;
            this.loteSelected = new ProveedorLoteProducto(null,'',new Date(),new Date(),null,'',0,'',0,0,parseInt(localStorage.getItem("idempresa")),null,albaran);
            });
          }
        }, 
        {
          text: 'Terminar y rellena checklist',
          handler: () => {
            this.setNuevaEntradaProveedor().then(()=>{
            this.terminar('check');
            console.log('Checklist');
          });
          }
        }, 
          {
            text: 'Terminar',
            handler: () => {
              this.setNuevaEntradaProveedor().then(()=>{
              console.log('Terminar');
              this.terminar('fin');
            });
            }
          },
          {
            text: 'Cancelar',
            role:'cancel',
            handler: (cancelado) => {
              console.log('cancel',cancelado);
              // let albaran= this.loteSelected.albaran;
              // this.loteSelected = new ProveedorLoteProducto(null,'',new Date(),new Date(),null,'',0,'',0,0,parseInt(localStorage.getItem("idempresa")),null,albaran);
            }
          }
        ]
    });

    await alert.present().then(
      (valor)=>{console.log(valor)}
    )
    }else{
      console.log('FORM Incompleto');
    }
  }


  async terminar(destino){
    if (this.network.type != 'none'){
    let ids = await this.sync.sync_entradasMP();
    console.log(ids);
    this.loteSelected.id = ids['id'];
    }
    switch(destino){
      case "fin":
        this.goTo('/home');
        break;
      case "check":
      let checklist = {'idchecklist':localStorage.getItem('triggerEntradasMP'),'lote':this.loteSelected,'albaran':this.loteSelected.albaran}
        this.servidor.setParam(checklist);
        this.goTo('/check');
        break;
    }
  }
}
