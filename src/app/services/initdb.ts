import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
// import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Sync } from './sync';


/*
  Generated class for the Initdb provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable(
    { providedIn: 'root' }
)
export class Initdb {
public users: any;
public gerentes: any;
public empresas: any;
//private storage;
public logged: number;
public badge: number;
public newDB:boolean=false;
//*****************  VERSION BBDD */
//anterior 14 
//Crea nuevas tablas servicios de entrada
//************  */
public versionDBLocal: number=16;
public version:string="v.7.0.0"
//*****************  VERSION BBDD */

public hayConexion:boolean=false;
public momentoCambioEstado:number=0;
//public db: SQLite;

  constructor(
    //   public http: Http, 
      public sync: Sync,
      public db :SQLite,
      private platform: Platform
      ) {
    console.log('Hello Initdb Provider');
    //this.db = new SQLite();
    this.platform.ready().then(() => {
        console.log('Initdb Provider platform ready');
        this.db.create({name: "data.db", location: "default"}).then(() => {
            //this.refresh();
            console.log("init db create db base de datos abierta");
        }, (error) => {
            console.log("ERROR al abrir la bd: ", error);
        });
    });
  }

 inicializa(){
    console.log("***INICIALIZANDO***");
   // this.db = new SQLite();

        this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
            db2.executeSql('DROP TABLE IF EXISTS logins',[]).then((data) => {
                console.log("TABLE DROPPED  LOGINS-> " + JSON.stringify(data));
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error.err));});

    db2.executeSql('CREATE TABLE IF NOT EXISTS logins (id INTEGER PRIMARY KEY, user TEXT, password TEXT, tipouser TEXT, nombre TEXT, superuser NUMBER)',[]).then((data) => {
            console.log("TABLE CREATED  LOGINS-> " + JSON.stringify(data));
            //this.sincronizate();
            //localStorage.getItem("idempresa") === null ? console.log("no hay idempresa"): this.sincronizate();
          //  alert ('creada logins');
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
  });
  db2.executeSql('DROP TABLE IF EXISTS controles',[]);
     db2.executeSql('CREATE TABLE IF NOT EXISTS controles (uid INTEGER PRIMARY KEY AUTOINCREMENT,id INTEGER,idusuario INTEGER, nombre TEXT, pla TEXT, minimo INTEGER, maximo INTEGER, objetivo INTEGER, tolerancia INTEGER, critico INTEGER, fecha DATETIME, periodicidad TEXT, frecuencia TEXT)',[]).then((data) => {
            console.log("TABLE CREATED CONTROLES-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
  });
  db2.executeSql('DROP TABLE IF EXISTS checklist',[]);
       db2.executeSql('CREATE TABLE IF NOT EXISTS checklist (id INTEGER PRIMARY KEY AUTOINCREMENT, idchecklist INTEGER,idusuario INTEGER, nombrechecklist TEXT, idcontrol INT, nombrecontrol TEXT, checked TEXT DEFAULT "false", fecha DATETIME, periodicidad TEXT, frecuencia TEXT)',[]).then((data) => {
            console.log("TABLE CREATED CHECKLIST-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
  });
  db2.executeSql('DROP TABLE IF EXISTS checklimpieza',[]);
       db2.executeSql('CREATE TABLE IF NOT EXISTS checklimpieza (id INTEGER PRIMARY KEY AUTOINCREMENT, idlimpiezazona INTEGER, idusuario INTEGER, nombrelimpieza TEXT, idelemento INT, nombreelementol TEXT, fecha DATETIME, tipo TEXT, periodicidad TEXT, productos TEXT, protocolo TEXT, responsable TEXT, supervisor INTEGER)',[]).then((data) => {
            console.log("TABLE CREATED CHECKLIMPIEZA-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> NO SE CREÓ CHECKLIMPIEZA: ",error);
  });

  db2.executeSql('DROP TABLE IF EXISTS maquina_mantenimiento',[]);
  db2.executeSql('CREATE TABLE IF NOT EXISTS maquina_mantenimiento (id INTEGER PRIMARY KEY AUTOINCREMENT, idmantenimiento INTEGER, idusuario INTEGER, idMaquina INTEGER,  nombreMaquina TEXT,nombre TEXT, fecha DATETIME, tipo TEXT,  periodicidad TEXT,responsable TEXT, orden INTEGER)',[]).then((data) => {
    console.log("TABLE CREATED MANTENIMIENTOS-> " + JSON.stringify(data));
}, (error) => {
    console.log("ERROR -> NO SE CREÓ MANTENIMIENTOS: ",error);
});
    db2.executeSql('DROP TABLE IF EXISTS maquina_calibraciones',[]);
    db2.executeSql('CREATE TABLE IF NOT EXISTS maquina_calibraciones (id INTEGER PRIMARY KEY AUTOINCREMENT, idmantenimiento INTEGER, idusuario INTEGER, idMaquina INTEGER,  nombreMaquina TEXT,nombre TEXT, fecha DATETIME, tipo TEXT,  periodicidad TEXT,responsable TEXT,  orden INTEGER)',[]).then((data) => {
    console.log("TABLE CREATED CALIBRACIONES-> " + JSON.stringify(data));
    }, (error) => {
    console.log("ERROR -> NO SE CREÓ CALIBRACIONES: ",error);
    });

    db2.executeSql('DROP TABLE IF EXISTS resultadoscontrol',[]);
  //*** ATENCION fecha DATETIME DEFAULT CURRENT_TIMESTAMP ES UTC, una hora menos que en españa. se compensa en los informes de backoffice
     db2.executeSql('CREATE TABLE IF NOT EXISTS resultadoscontrol (id INTEGER PRIMARY KEY AUTOINCREMENT, idcontrol INTEGER, resultado INTEGER, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, foto BLOB, idusuario INTEGER)',[]).then((data) => {
            console.log("TABLE CREATED resultadoscontrol-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error));
  });
  db2.executeSql('DROP TABLE IF EXISTS resultadoschecklist',[]);
  //*** ATENCION fecha DATETIME DEFAULT CURRENT_TIMESTAMP ES UTC, una hora menos que en españa. se compensa en los informes de backoffice
     db2.executeSql('CREATE TABLE IF NOT EXISTS resultadoschecklist (idlocal INTEGER PRIMARY KEY AUTOINCREMENT, idchecklist INTEGER, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, foto BLOB, idusuario INTEGER)',[]).then((data) => {
            console.log("TABLE CREATED resultadoschecklist-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error));
  });
  db2.executeSql('DROP TABLE IF EXISTS resultadoscontroleschecklist',[]);
     db2.executeSql('CREATE TABLE IF NOT EXISTS resultadoscontroleschecklist (id INTEGER PRIMARY KEY AUTOINCREMENT, idcontrolchecklist INTEGER, idchecklist INTEGER, resultado TEXT, descripcion TEXT, fotocontrol BLOB, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, idresultadochecklist INTEGER)',[]).then((data) => {
            console.log("TABLE CREATED resultadoscontroleschecklist-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error));
  });
     db2.executeSql('DROP TABLE IF EXISTS resultadosLimpieza',[]);
     db2.executeSql('CREATE TABLE IF NOT EXISTS resultadoslimpieza (id INTEGER PRIMARY KEY AUTOINCREMENT, idelemento INTEGER, idempresa INTEGER, fecha_prevista DATETIME, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, nombre TEXT, descripcion TEXT, tipo TEXT, idusuario INTEGER, responsable TEXT,  idlimpiezazona INTEGER, idsupervisor INTEGER)',[]).then((data) => {
            console.log("TABLE CREATED RESULTADOSLIMPIEZA-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error));
  });
  

    db2.executeSql('DROP TABLE IF EXISTS mantenimientosrealizados',[]);
    db2.executeSql('CREATE TABLE IF NOT EXISTS mantenimientosrealizados (id INTEGER PRIMARY KEY AUTOINCREMENT, idmantenimiento INTEGER, idmaquina INTEGER, maquina TEXT, mantenimiento TEXT, fecha_prevista DATETIME, fecha DATETIME DEFAULT CURRENT_TIMESTAMP,idusuario INTEGER, responsable TEXT, descripcion TEXT, elemento TEXT, tipo TEXT,tipo2 TEXT,causas TEXT,tipo_evento TEXT, idempresa INTEGER, imagen BLOB, pieza,cantidadPiezas)',[]).then((data) => {
        console.log("TABLE CREATED MANTENIMIENTOSREALIZADOS-> " + JSON.stringify(data));
    }, (error) => {
        console.log("ERROR -> " + JSON.stringify(error));
});


    db2.executeSql('DROP TABLE IF EXISTS supervisionlimpieza',[]);
     db2.executeSql('CREATE TABLE IF NOT EXISTS supervisionlimpieza (id INTEGER PRIMARY KEY AUTOINCREMENT, idlimpiezarealizada INTEGER,idElemento INTEGER,  nombrelimpieza TEXT,idZona INTEGER,nombreZona TEXT, fecha DATETIME, tipo TEXT,  responsable TEXT, idsupervisor INTEGER, fecha_supervision DATETIME DEFAULT CURRENT_TIMESTAMP, supervision INTEGER, detalles_supervision TEXT)',[]).then((data) => {
            console.log("TABLE CREATED SUPERVISIONLIMPIEZA-> " + JSON.stringify(data));
        }, (error) => {
            console.log("ERROR -> NO SE CREÓ SUPERVISIONLIMPIEZA: ",error);
  });

  db2.executeSql('DROP TABLE IF EXISTS maquinas',[]);
  db2.executeSql('CREATE TABLE IF NOT EXISTS maquinas (idMaquina INTEGER PRIMARY KEY,  nombreMaquina TEXT)',[]).then((data) => {
         console.log("TABLE CREATED MAQUINAS-> " + JSON.stringify(data));
     }, (error) => {
         console.log("ERROR -> NO SE CREÓ MAQUINAS: ",error);
});
db2.executeSql('DROP TABLE IF EXISTS incidencias',[]);
db2.executeSql('CREATE TABLE IF NOT EXISTS incidencias (id INTEGER PRIMARY KEY AUTOINCREMENT, fecha DATETIME, incidencia TEXT, solucion TEXT, responsable INTEGER, idempresa INTEGER, origen TEXT, idOrigen INTEGER, origenasociado TEXT, idOrigenasociado INTEGER, foto BLOB, descripcion TEXT, estado integer, idElemento INTEGER)',[]).then((data) => {
       console.log("TABLE CREATED INCIDENCIAS-> " + JSON.stringify(data));
   }, (error) => {
       console.log("ERROR -> NO SE CREÓ INCIDENCIAS: ",error);
});
db2.executeSql('DROP TABLE IF EXISTS piezas',[]);
db2.executeSql('CREATE TABLE IF NOT EXISTS piezas (id INTEGER PRIMARY KEY,  idmaquina INTEGER, nombre TEXT)',[]).then((data) => {
       console.log("TABLE CREATED INCIDENCIAS-> " + JSON.stringify(data));
   }, (error) => {
       console.log("ERROR -> NO SE CREÓ INCIDENCIAS: ",error);
});
db2.executeSql('DROP TABLE IF EXISTS entradasMP',[]);
db2.executeSql('CREATE TABLE IF NOT EXISTS entradasMP (id INTEGER PRIMARY KEY,  numlote_proveedor TEXT, fecha_entrada DATETIME,fecha_caducidad DATETIME,cantidad_inicial INTEGER,tipo_medida TEXT,cantidad_remanente INTEGER, doc TEXT,idproducto INTEGER,idproveedor INTEGER, idempresa INTEGER, idResultadoChecklist INTEGER, albaran TEXT,idResultadoChecklistLocal INTEGER)',[]).then((data) => {
       console.log("TABLE CREATED entradasMP-> " + JSON.stringify(data));
   }, (error) => {
       console.log("ERROR -> NO SE CREÓ entradasMP: ",error);
});
db2.executeSql('DROP TABLE IF EXISTS proveedores',[]);
db2.executeSql('CREATE TABLE IF NOT EXISTS proveedores (id INTEGER PRIMARY KEY,  idproveedor INTEGER, nombre TEXT)',[]).then((data) => {
       console.log("TABLE CREATED proveedores-> " + JSON.stringify(data));
   }, (error) => {
       console.log("ERROR -> NO SE CREÓ proveedores: ",error);
});
db2.executeSql('DROP TABLE IF EXISTS productosProveedor',[]);
db2.executeSql('CREATE TABLE IF NOT EXISTS productosProveedor (id INTEGER PRIMARY KEY,  idproducto INTEGER, idproveedor INTEGER,nombre TEXT)',[]).then((data) => {
       console.log("TABLE CREATED productosProveedor-> " + JSON.stringify(data));
   }, (error) => {
       console.log("ERROR -> NO SE CREÓ productosProveedor: ",error);
});
db2.executeSql('DROP TABLE IF EXISTS serviciosEntrada',[]);
// db2.executeSql('CREATE TABLE IF NOT EXISTS serviciosEntrada (id INTEGER PRIMARY KEY,  idEntradaLocal INTEGER, idEntradasMP INTEGER,idResultadoChecklistLocal INTEGER ,idResultadoChecklist INTEGER, fecha DATETIME, albaran TEXT, idempresa INTEGER)',[]).then((data) => {
//        console.log("TABLE CREATED serviciosEntrada-> " + JSON.stringify(data));
//    }, (error) => {
//        console.log("ERROR -> NO SE CREÓ serviciosEntrada: ",error);
// });
        });
localStorage.setItem("inicializado","16")
if (localStorage.getItem("versionusers") === null) {localStorage.setItem("versionusers","0")}
if (localStorage.getItem("versioncontrols") === null) {localStorage.setItem("versioncontrols","0")}
if (localStorage.getItem("synccontrol") === null) {localStorage.setItem("synccontrol","0")}
if (localStorage.getItem("syncchecklist") === null) {localStorage.setItem("syncchecklist","0")}
if (localStorage.getItem("syncchecklimpieza") === null) {localStorage.setItem("syncchecklimpieza","0")}
if (localStorage.getItem("syncsupervision") === null) {localStorage.setItem("syncsupervision","0")}
if (localStorage.getItem("syncmantenimiento") === null) {localStorage.setItem("syncmantenimiento","0")}
if (localStorage.getItem("syncincidencia") === null) {localStorage.setItem("syncincidencia","0")}
if (localStorage.getItem("db") === null) {this.newDB=true;localStorage.setItem("db","true")}else{this.newDB=false;localStorage.setItem("db","true")};
this.badge = parseInt(localStorage.getItem("synccontrol"))+parseInt(localStorage.getItem("syncchecklist"))+parseInt(localStorage.getItem("syncsupervision"))+parseInt(localStorage.getItem("syncchecklimpieza"))+parseInt(localStorage.getItem("syncmantenimiento"))+parseInt(localStorage.getItem("syncincidencia"));
 }




  sincronizate(origin:string,version?:string){
     
      console.log("llamada sincronizando",origin,version);
   //USUARIOS
   //USUARIOS
   // DESCARGA USUARIOS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.
   return new Promise((resolve,reject)=>{
            this.sync.getMisUsers().subscribe(
            data => {
                console.log('USERS',data);
               this.users = JSON.parse(data);
               console.log(this.users.success);
                if (this.users.success){
                    console.log('USERS',this.users.success);
                    this.users = this.users.data;
                    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
                        
                            db2.executeSql("delete from logins",[]).then((data) => {
                            console.log("delete from logins->" + JSON.stringify(data));
                            let valores = '';
                            this.users.forEach (user => {
                            //   this.save(user)
                            
                       
                       valores += "("+user.id+",'"+user.usuario+"','"+user.password+"','"+user.tipouser+"','"+user.usuario+"',"+user.superuser+"),";           
                      });
                      valores = valores.substr(0,valores.length-1);
                     let query = "INSERT INTO logins (id, user, password, tipouser, nombre, superuser) VALUES " + valores;
                      console.log('########',origin,query);                    
                    db2.executeSql(query ,[])
                      .then((data) => {
                        console.log('***********OK INSERT USERS', data)
                      },
                      (error)=>{ console.log('***********ERROR',origin, error)});


                            }, (error) => {
                            console.log("ERROR -> ",origin,JSON.stringify(error.err));
                            });
 

                    });
                    //this.users.forEach (user => this.save(user));
                        }
        },
            err => {
                console.log(err,origin);
                reject('error, getting users. initdb#130');
                },
            () => {console.log('getUsuarios completed',origin);
                resolve('ok1');
                if (version) localStorage.setItem("versionusers",version);
                //return new Promise(resolve => {resolve('ok')});
                }
        );  

        //USUARIOS
        //USUARIOS
        // DESCARGA USUARIOS ENTONCES BORRA LOS LOCALES, LUEGO INSERTA LOS DESCARGADOS EN LOCAL.

        //GERENTES
        this.sync.setGerentes().subscribe(
            data => {
                console.log(data);
               this.gerentes = JSON.parse(data);
                if (this.gerentes.success){
                    this.gerentes = this.gerentes.data;
                    let array = [];
                    this.gerentes.forEach (gerente => {
                            console.log(gerente.email);
                            array.push(gerente.email);
                            });
                        localStorage.setItem("email",array.toString());
                        }
        },
            err => console.error('ERROR GERENTES 273',err,origin),
            () => {console.log('getGerentes completed',origin)
            }
        );

        this.sync.setEmpresa().subscribe(
            data => {
               this.empresas = JSON.parse(data);
                if (this.empresas.success){
                    this.empresas = this.empresas.data;
                    let miempresa = '';
                    let miholding = 0;
                    this.empresas.forEach (empresa => {
                            //console.log(gerente.email);
                            miempresa = empresa.nombre;
                            if(empresa.holding==1){
                            miholding = empresa.id;
                            }
                            if(empresa.holding==2){
                            miholding = empresa.idHolding;
                            }
                            console.log('MI HOLDING',miholding,empresa)
                            });
                        localStorage.setItem("empresa",miempresa);
                        localStorage.setItem("holding",miholding.toString());
                        }
        },
            err => console.error('setempresa error',err,origin),
            () => {console.log('set empresa completed',origin)
            }
        );  

        });


  }


//   save(user){
//       this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
//       db2.executeSql("INSERT INTO logins (id, user, password, tipouser, nombre) VALUES (?,?,?,?,?)",[user.id,user.usuario,user.password,user.tipouser,user.nombre]).then((data) => {
//            console.log("insert login ->" + JSON.stringify(data));
//             }, (error) => {
//                   console.log("ERROR INSERTANDO LOGIN-> " + JSON.stringify(error));
//                   alert("error " + JSON.stringify(error.err));
//               });
//       });
// }

public getLogin(nombre: string, password:string): any{
    return new Promise((resolve,reject)=>{
    console.log('getlogin...')
    this.db.create({name: "data.db", location: "default"}).then((db2: SQLiteObject) => {
        console.log('abierta',db2.databaseFeatures);
    return db2.executeSql('select * from logins WHERE user = ? AND password = ?',[nombre,password]).then((data) => {
        console.log('registros',data.rows)
        if (data.rows.length >0){
            //alert ("id" + data.rows.item(0).id);
            this.logged = data.rows.item(0).id;
           console.log ("logged", this.logged);
            sessionStorage.setItem("login",data.rows.item(0).id);
            //localStorage.setItem("idempresa",data.rows.item(0).idempresa);
            //return new Promise ((resolve,reject) => {resolve(true)});
            resolve(data.rows.item(0))
            }
        else{
            console.log('undefined...')
            this.logged = undefined;

            return reject('no hay registros');
        }
    }, (error) => {
                alert("ERROR executing -> " + JSON.stringify(error));
                //return false;
                return reject('error en la consulta')
            });
    });
    });
}

}