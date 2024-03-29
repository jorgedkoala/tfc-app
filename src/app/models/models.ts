 //let server = 'https://tfc.proacciona.es/'; //prod
// let server = 'http://tfc.ntskoala.com/';//DESARROLLO
// let server = 'https://tfc1-181808.appspot.com/';
import { server } from '../../environments/environment'
let base = server + 'api/';

export const URLS = {
  SERVER: server,
  BASE : base,
  LOGIN: base + 'actions/login.php',
  SENDALERT: base + 'alertes.php',
  UPLOAD_DOCS: base + 'uploads.php',
  STD_ITEM: base + 'std_item.php',
  STD_SUBITEM: base + 'std_subitem.php',
  STD_FECHA: base + 'std_fecha.php',
  VERSION_USERS: base + 'actions/version_users.php',
  ALERTES: base + 'alertes.php',
  OPCIONES_EMPRESA: base + 'opcionesempresa.php',
  HOLDING: base+'views/getHolding.php',
  //**********TRAZABILIDAD */
  TRAZA_ORDENES:  base + 'traza_ordenes.php',
  UPDATE_REMANENTE: base+ 'update_remanente.php',

  UPLOAD_LOGO: base + 'logoempresa.php',
  FOTOS: server +'controles/',
  LOGOS: server + 'logos/',
  DOCS: server + 'docs/'
}

export class Almacen {
  constructor(
    public id: number,
    public idempresa:number,
    public nombre:string,
    public capacidad: number,
    public estado: number,
    public idproduccionordenactual: number,
    public level?: number,
    public fechaIniciado?: Date
  ) {}
}

export class ProduccionDetalle {
  constructor(
    public id: number,  
    public idorden: number,
    public proveedor:string,
    public producto:string,
    public numlote_proveedor:string,
    public idmateriaprima: number,
    public idloteinterno: number,
    public cantidad: number,
    public tipo_medida: string,
    public cantidad_remanente_origen?: number,
    public cantidad_real_origen?: number
){}
}

export class ProduccionOrden {
  constructor(
    public id: number,  
    public 	idempresa: number,
    public numlote: string,
    public fecha_inicio: Date,
    public fecha_fin: Date,
    public fecha_caducidad?: Date,
    public responsable?: string,
    public cantidad?: number,
    public remanente?: number,
    public tipo_medida?: string,
    public idproductopropio?: number,
    public nombre?: string,
    public familia?: string,
    public estado?: string,
    public idalmacen?: number,
    public idcliente?: number
){}
}

export class Cliente {
  constructor(
    public nombre: string,
    public idEmpresa: number,
    public contacto?: string,
    public telf?: string,
    public email?: string,
    public id?: number
  ) {}
}

export class Distribucion {
  constructor(
    public id: number,
    public idempresa: number,   
    public idcliente: number,
    public idproductopropio: number,
    public idordenproduccion: number,
    public numlote: string,
    public fecha:Date,
    public fecha_caducidad:Date,
    public responsable: string,
    public cantidad: number,
    public tipo_medida: string,
    public alergenos: string
  ) {}
}

export class FamiliasProducto {
  constructor(
    public nombre: string,
    public idempresa: number,
    public nivel_destino?: number,
    public id?: number,

  ) {}
}

export class ProveedorLoteProducto {
  constructor(
    public id: number,
    public numlote_proveedor: string,
    public fecha_entrada: Date,
    public fecha_caducidad: Date,
    public cantidad_inicial: number,
    public tipo_medida:string,
    public cantidad_remanente:number,
    public doc: string,
    public idproducto: number,
    public idproveedor: number,
    public idempresa: number,
    public idResultadoChecklist: number,
    public albaran: string,
    public idResultadoChecklistLocal?: number
  ) {}
}

export class ResultadoControl {
  constructor(
    public idcontrol: number,
    public resultado: number, 
    public fecha: string,  
    public foto: string,
    public idusuario: number
  ) {}
}
export class ResultadoControlLocal {
  constructor(
    public idcontrol: number,
    public resultado: number, 
    public fecha: string,  
    public foto: string,
    public idusuario: number,
    public idLocal?: number
  ) {}
}
export class ResultadoCechklist {
  constructor(
    public idlocal: number,
    public idchecklist: number,
    public fecha: string,
    public foto: string,
    public idusuario: number,

  ) {}
}
export class ResultadosControlesChecklist {
  constructor(
    public idcontrolchecklist: number,
    public idresultadochecklist: number, 
    public resultado: string,  
    public descripcion: string,
    public fotocontrol: string,
  ) {}
}

export class controlesList {
  constructor(
  id: number,
  nombre: string,
  pla: string,
  minimo: number,
  maximo: number,
  tolerancia: number,
  critico: number,
  fecha?: Date,
  periodicidad2?:string,
  frecuencia?:string,
  isbeforedate?: boolean
  ){}
}

export class checklistList {
  constructor(
  id: number,
  idchecklist: number,
  nombrechecklist: string,
  idcontrol:number,
  nombrecontrol:string,
  checked:boolean,
  idusuario: string,
  descripcion: string,
  fecha?: Date,
  periodicidad2?:string,
  frecuencia?:string,
  isbeforedate?: boolean 
  ){}
}

export class checkLimpieza {
  constructor(
  public id: number,
  public idLimpieza: number,
  public nombreLimpieza: string,
  public idElementoLimpieza:number,
  public nombreElementoLimpieza:string,
  public fecha_prevista: Date,
  public tipo: string,
  public periodicidad: string,
  public productos: string,
  public protocolo: string,
 public  checked:boolean,
  public idusuario: number,
  public responsable:string,
  public descripcion: string,
  public isbeforedate?: boolean,
  public supervisor?: number
  ){}
}

export class limpiezaRealizada {
  constructor(
  public id: number,
  public idelemento: number,
  public idempresa: number,
  public fecha_prevista:Date,
  public fecha:Date,
  public nombre:string,
  public descripcion: string,
  public tipo: string,
  public idusuario: number,
  public responsable: string,
  public idlimpiezazona:number,
  public idsupervisor?:number,
  public fecha_supervision?:Date,
  public supervision?:number,
  public detalles_supervision?:string
  ){}
}

export class supervisionLimpieza {
  constructor(
  public id: number,
  public idlimpiezarealizada:number,
  public idElemento:number,
  public nombrelimpieza: string, 
  public idZona:number,  
  public nombreZona: string, 
  public fecha: Date, 
  public tipo: string,  
  public responsable: string,
  public idsupervisor?:number,
  public fecha_supervision?:Date,
  public supervision?:number,
  public detalles_supervision?:string
  ){}
}

export class Supervision {
  constructor(
  public id: number,
  public idsupervisor:number,
  public fecha_supervision:Date,
  public supervision:number,
  public detalles_supervision:string
  ){}
}

export class maquina {
  constructor(
  public idMaquina: number,
  public nombreMaquina: string
  ){}
}
export class pieza {
  constructor(
  public id:number,
  public idmaquina: number,
  public nombre: string
  ){}
}
export class mantenimiento {
  constructor(
  public id: number,
  public idMaquina: number,
  public nombreMaquina: string,
  public idMantenimiento:number,
  public nombreMantenimiento:string,
  public fecha_prevista: Date,
  public tipo: string,
  public periodicidad: string,
  public checked:boolean,
  public idusuario: number,
  public responsable:string,
  public descripcion: string,
  public isbeforedate?: boolean,
  public tipoMantenimiento?: string
  ){}
}

export class mantenimientoRealizado {
  constructor(
  public id: number,
  public idmantenimiento: number,
  public idmaquina: number,
  public maquina: string,
  public mantenimiento: string,
  public fecha_prevista:Date,
  public fecha:Date,
  public idusuario:number,
  public responsable: string,
  public descripcion: string,
  public elemento:string,
  public tipo: string,
  public tipo2: string,
  public causas: string,
  public tipo_evento: string,
  public idempresa: number,
  public imagen:string,
  public pieza?:number,
  public cantidadPiezas?:number
  
  ){}
}

export class Incidencia {
  constructor(
  public id: number,
  public fecha:Date,
  public incidencia: string,
  public solucion: string,
  public responsable: number,
  public idempresa: number,
  public origen: string,
  public idOrigen: number,
  public origenasociado:string,
  public idOrigenasociado:number,
  public foto:string,
  public descripcion: string,
  public estado:number  
  ){}
}
export class ServicioEntrada {
  constructor(
  public id: number,
  public idEntradasMP:number,
  public idResultadoChecklist: number,
  public fecha: Date,
  public albaran: string,
  public idempresa: number,
  public idEntradaLocal:number,
  public idRCLocal:number
  ){}
}



let medidas;
if (localStorage.getItem("lang")=='es'){
medidas = [{'label':'Kg.','value':'Kg.'},{'label':'g.','value':'g.'},{'label':'l.','value':'l.'},{'label':'ml.','value':'ml.'},{'label':'unidades','value':'unidades'}];
}
if (localStorage.getItem("lang")=='ca'){
medidas = [{'label':'Kg.','value':'Kg.'},{'label':'g.','value':'g.'},{'label':'l.','value':'l.'},{'label':'ml.','value':'ml.'},{'label':'unitats','value':'unidades'}];
}
export const dropDownMedidas=medidas;