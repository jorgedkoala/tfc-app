import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Http, Headers } from '@angular/http';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { map,tap } from 'rxjs/operators';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';
import {Observable, Subject} from 'rxjs';
import { Device } from '@ionic-native/device/ngx';

//import { Config } from '../config/config';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { LoadingController } from '@ionic/angular';
import { URLS } from '../models/models'
/*
  Generated class for the Sync provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable(
    { providedIn: 'root' }
)
export class Sync {
private posturl: string;

public idchecklist;
public platform;
proveedoresActivo = new BehaviorSubject(null);
public deletedLocalRows: Subject<Boolean> = new Subject();

 //public baseurl: string = "https://tfc.proacciona.es/api";
//public baseurl: string = "http://tfc.ntskoala.com/api";
public baseurl: string = URLS.BASE;
 public idempresa= localStorage.getItem("idempresa");
 public loader:any;
createAuthorizationHeader(headers:Headers) {
    headers.append('token', 'qwerty123456'); 
  }
  constructor(
      public http: HttpClient,
      public loadingCtrl: LoadingController,
      public db :SQLite,
      public device:Device) {
    console.log('Hello Sync Provider');
    if (localStorage.getItem("modo")=="debug"){
    //    this.baseurl = "http://tfc.ntskoala.com/api";
    }
    else{
     //   this.baseurl = "http://tfc.proacciona.es/api";
    }
    this.platform= device.platform+'V:'+localStorage.getItem("v");
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
        message: 'Please wait...',
        spinner: 'crescent',
        duration: 2000
    });

  }

public getMisControles(userid): Observable<any>
{
    console.log ('baseurl',this.baseurl);
   // this.loader.present();
            let headers = new Headers();
            this.createAuthorizationHeader(headers);
//        let miscontroles = this.http.get(`${this.config.baseurl}/views/getcontroles.php?userid=${userid}&_dc=1470480375978`,{headers:headers});
       let miscontroles = this.http.get(`${this.baseurl}views/getcontroles.php?idempresa=${this.idempresa}&_dc=1470480375978`);
        return miscontroles;
        
    }

public getMisChecklists(userid): Observable<any>
{
        let miscontroles = this.http.get(`${this.baseurl}views/getchecklists.php?idempresa=${this.idempresa}&_dc=1470480375978`);
        return miscontroles;
}

public getMisLimpiezas(userid): Observable<any>
{
    console.log ('baseurl',this.baseurl);
   // this.loader.present();
            let headers = new Headers();
            this.createAuthorizationHeader(headers);
//        let miscontroles = this.http.get(`${this.config.baseurl}/views/getcontroles.php?userid=${userid}&_dc=1470480375978`,{headers:headers});
       let mislimpiezas = this.http.get(`${this.baseurl}views/getlimpiezas.php?idempresa=${this.idempresa}&_dc=1470480375978`);
        return mislimpiezas;
        
    }
// public getMisMantenimientos(userid): Observable<any>
// {
//     let miscontroles = this.http.get(`${this.baseurl}views/getmantenimientos.php?idempresa=${this.idempresa}&_dc=1470480375978`);
//     return miscontroles;
// }
// public getMisCalibraciones(userid): Observable<any>
// {
//     let miscontroles = this.http.get(`${this.baseurl}views/getcalibraciones.php?idempresa=${this.idempresa}&_dc=1470480375978`);
//     return miscontroles;
// }

public getMisMaquinas(userid): Observable<any>
{
    let mismaquinas = this.http.get(`${this.baseurl}views/getmaquinas.php?idempresa=${this.idempresa}&_dc=1470480375978`);
    return mismaquinas;
}

public getMisPiezas(userid): Observable<any>
{
    let mispiezas = this.http.get(`${this.baseurl}views/getpiezas.php?idempresa=${this.idempresa}&_dc=1470480375978`);
    return mispiezas;
}

public getMisLimpiezasRealizadas(userid): Observable<any>
{
    console.log ('baseurl',this.baseurl);
   // this.loader.present();
            let headers = new Headers();
            this.createAuthorizationHeader(headers);
//        let miscontroles = this.http.get(`${this.config.baseurl}/views/getcontroles.php?userid=${userid}&_dc=1470480375978`,{headers:headers});
       let mislimpiezas = this.http.get(`${this.baseurl}views/getlimpiezasrealizadas.php?idempresa=${this.idempresa}&_dc=1470480375978`);
        return mislimpiezas;
        
}


public getMisUsers(): Observable<any>
{
    this.idempresa = localStorage.getItem("idempresa");
    console.log("sincro misusers, empresa:" + this.idempresa);
    //alert ('idempresa' + this.config.idempresa);
        let misusers = this.http.get(`${this.baseurl}views/getusers.php?idempresa=${this.idempresa}&_dc=1470480375978`);
        return misusers;
    }

public setGerentes(): Observable<any>
{

    this.idempresa = localStorage.getItem("idempresa");
    console.log("sincro setgerentes, empresa:" + this.idempresa);
    //alert ('idempresa' + this.config.idempresa);
        let misgerentes = this.http.get(`${this.baseurl}views/getgerentes.php?idempresa=${this.idempresa}&_dc=1470480375978`);
        
        return misgerentes;
    }
    public setEmpresa(): Observable<any>
    {
        this.idempresa = localStorage.getItem("idempresa");
            let misempresas = this.http.get(`${this.baseurl}views/getempresas.php?idempresa=${this.idempresa}&_dc=1470480375978`);
            return misempresas;
        }

setResultados(resultados,table):any
{
   console.log('resultados ' + table + ": " +resultados);
    this.posturl = this.baseurl+'actions/set'+table+'.php?idempresa='+this.idempresa+"&userId="+localStorage.getItem("idusuario")+"&plataforma=app"+this.platform;
    console.log(this.posturl);
        let params = resultados;
        //let headers = new Headers();
        //headers.append('Content-type', 'application/x-www-form-urlencoded');
        //headers.append('Content-type', 'form-data');
        // devuelve un Observable
       return this.http.post(this.posturl, params)
            .pipe(
            // map(res => JSON.parse(res.json())),       
            //map (res => JSON.parse(res.json()))
            tap(((data:any) => {
                data = JSON.parse(data)
                console.log(data);

                        //alert("data" + data);
                        console.log("control2" + table);
                         if (data["success"]== "true"){
                             console.log("insert correcto " + table);
                            ///BORRAR DATOS TABLA 
                                //this.storage = new Storage(SqlStorage, {name:'tfc'});
                 // let db= new SQLite();
                  this.db.create({name: 'data.db',location: 'default'})
                  .then((db2: SQLiteObject) => { db2.executeSql("delete from " + table, []).then(
                                (data) => { 
                                    console.log ("%cDELETE LOCAL ROWS FROM TABLE " + table ,"background:red;");
                                    console.log (JSON.stringify(data));
                                    console.log (data["rowsAffected"]+">0",data["rowsAffected"]>0);
                                    if (data["rowsAffected"]>0){
                                    this.deletedLocalRows.next(true);
                                    }
                                }, 
                                (error) => { 
                                    console.log("ERROR -> " + JSON.stringify(error.err));
                                    this.deletedLocalRows.next(true);
                                });
                         });//FIN DB
                             }
                         else {
                             console.log ("ERROR EN EL INSERT " + table);
                             this.deletedLocalRows.next(true);
                             }
                        })));
            
            //console.debug()
            //.subscribe(res => {
            //              console.debug("SUCCESS" + res.success);},
            //              console.debug (JSON.parse(res.json()).id);
            //              let respuesta = JSON.parse(res.json()).success;
            //              console.debug ("respuesta= " + respuesta);
            //              if (respuesta== "true"){
            //                  console.debug("insert correcto " + table);
            // //                 ///BORRAR DATOS TABLA 
            // //                     // this.storage = new Storage(SqlStorage, {name:'tfc'});
            // //                     // this.storage.query("delete from " + table).then(
            // //                     // (data) => { console.debug (JSON.stringify(data.res));}, 
            // //                     // (error) => { console.debug("ERROR -> " + JSON.stringify(error.err));});  
            // //                     return respuesta.id;
            //                  }
            //              else {
            //                  console.debug ("ERROR EN EL INSERT " + table);
            //                  }
            //              },
            //              error => {
            //                  console.debug("error post: " + error);
            //              },
            //              () => {console.debug("FIN")} );
                    
 //   this.http.post(`${this.config.baseurl}/actions/getusers.php?idempresa=${this.config.idempresa}&_dc=1470480375978`,);

}








}
