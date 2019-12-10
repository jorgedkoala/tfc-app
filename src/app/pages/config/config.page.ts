import { Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit {
  public lang:string;
  public email:string;
  public teclado:string="text";
  public version:string;
  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    console.log('On init works on config page')
    this.lang=localStorage.getItem('lang');
    this.teclado=localStorage.getItem('teclado');
    this.version='TFC-v:'+localStorage.getItem("v");
  }


  selectlang(evento){
    console.log(this.lang,evento);
    //  alert ("idioma" + this.lang);
      localStorage.setItem("lang",evento.value);
      this.translate.use(evento.value);
      this.translate.setDefaultLang(evento.value);
    }
    selectTeclado(evento){
      console.log(this.teclado,evento);
      localStorage.setItem("teclado",evento.value);
    }
    setmail(){
    //alert (this.email);
    //localStorage.setItem("email",this.email);
    }
}
