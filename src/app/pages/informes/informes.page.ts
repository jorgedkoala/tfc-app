import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';


import { Network } from '@ionic-native/network/ngx';
import { Servidor } from '../../services/servidor';

//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-informes',
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
})
export class InformesPage implements OnInit {
  public exportar_informes: boolean =false;
  public exportando:boolean=false;
  public innerHtml='';
  public xls:boolean;
  public pdf: boolean;
  public html;
  public progreso:number=0;
  public speed=1200;
  public informeData;
  public informeRecibido;
  public int;


  constructor(
  private router: Router,
  public translate: TranslateService,
  public network:Network, 
  public servidor: Servidor,
  private transfer: FileTransfer, 
  private file: File,
  private fileOpener: FileOpener
  ) {}

  ngOnInit() {
  }




  async download(){
    this.progress(10);
     //let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzIpotMyRcSxISIMvMLWN0-boPG8drRZ9wD8IQO5eQ/dev?idEmpresa='+this.empresasService.seleccionada;
     let url ='https://script.google.com/a/proacciona.es/macros/s/AKfycbzumyP_ybsAfEC_I0xww2Pz5XPOJim-51zCoEnFBhjl/dev';
     let param = '?idempresa='+localStorage.getItem("idempresa")+'&download=pdf';
    this.innerHtml += 'Solicitado<br>...';
    this.servidor.getSimple(url,param).subscribe(
      async (respuesta)=>{
        console.log('########',respuesta.json());
        this.progreso=90;
        this.innerHtml += respuesta.json()["contenido"];
        let descargaUrl = respuesta.json()["url"]; 
        let descargaPdf = respuesta.json()["urlPdf"]; 
        let id = respuesta.json()["id"]; 
        let time=0;

     // if (this.pdf){
        this.innerHtml += 'Descarga Pdf...<br>';
       // time=6000;
      //  let aPdf = document.createElement('a');
        await this.downloadInforme(descargaPdf,url,id);
       // this.pdf = false;
       // if (!this.pdf && !this.xls) 
       // setTimeout(()=>{ this.goTo('/home');},5000);
     //   }
        // if (this.xls){
        //   this.innerHtml += 'Descarga Xls...<br>';
        //   let aXls = document.createElement('a');
        //   setTimeout(async()=>{
        //   await  this.downloadInforme(descargaUrl,aXls,'aXls')
        //   this.xls = false;
        //           if (!this.pdf && !this.xls) 
        //           this.closeIncidenciaPage();
        //         },time)
        //       }
              // let deleteFile={'accion':'delete','id':id}
              // let param2='?accion=delete&id='+id;
              // console.log(deleteFile);
              // this.servidor.getSimple(url,param2).subscribe(
              //   (resultado)=>{
              //     console.log(resultado);
              //   });
        },
        (error)=>{
          console.log('ERROR SCRIPTING ',error);
          this.innerHtml += 'download ERROR: ' + error;
        },
        ()=>{
          this.progress(80);
        }
    )
  }
  progress(start){
    clearInterval(this.int);
    this.progreso=start;
    //for (let x=start;x<100;x++){
      this.int = setInterval(()=>{
        this.progreso+=1;
       // console.log(this.progreso,"*",this.speed);
        if (this.progreso>50 && this.progreso<80) this.speed = 2000;
        if (this.progreso>60 && this.progreso<80) this.speed = 4000;
        if (this.progreso>70 && this.progreso<80) this.speed = 5000;
        if (this.progreso>80 && this.progreso<90) this.speed = 7000;
        if (this.progreso>99 ) clearInterval(this.int)
        },this.speed)
    //}
  }


  downloadInforme(url,urlDelete,id) {
    console.log('download complete: ');
    let fileTransfer = this.transfer.create()
    fileTransfer.download(url, this.file.dataDirectory  + 'informeTFC.pdf').then(
      // fileTransfer.download(url,this.file.externalRootDirectory + '/informeTFC.pdf').then(
      (entry) => {
      console.log('download complete: ' + entry.toURL());
      clearInterval(this.int);
      this.progreso=90;
        this.deleteFile(urlDelete,id);
        this.fileOpener.open(entry.toURL(), 'application/pdf')
  .then(() => {
    console.log('File is opened');
    this.goTo();
  })
  .catch(e => console.log('Error opening file', e));
    }, (error) => {
      console.log('download ERROR: ' + error);
      this.innerHtml += 'download ERROR: ' + error;
    });
  }

deleteFile(url,id){
  let param2='?accion=delete&id='+id;
  this.servidor.getSimple(url,param2).subscribe(
    (resultado)=>{
      console.log(resultado);
      this.progreso=100;
    });
}
  // downloadInforme(file_path,a,id){

  //   a.href = file_path;
  //   a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
  //   a.id=id;
  //   console.log(a,file_path);
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   this.innerHtml += 'descargado<br>';
  //   clearInterval(this.int);
  //   this.progreso=100;
  //   return (true);
  // }

  goTo(link?){
    if (!link) link='/home'
this.router.navigateByUrl(link);
  }




}
