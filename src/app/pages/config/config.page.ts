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
  public teclado:string;
  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    console.log('On init works on config page')
    this.lang=localStorage.getItem('lang');
    this.teclado=localStorage.getItem('teclado');
  }


  selectlang(){
    //  alert ("idioma" + this.lang);
      localStorage.setItem("lang",this.lang);
      this.translate.use(this.lang);
      this.translate.setDefaultLang(this.lang);
    }
    selectTeclado(){
      localStorage.setItem("teclado",this.teclado);
    }
    setmail(){
    //alert (this.email);
    //localStorage.setItem("email",this.email);
    }
}
