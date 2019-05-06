import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//*****CUSTOM TEMPLATE */
import { TranslateService } from '@ngx-translate/core';
import { Servidor } from '../../services/servidor';
import { URLS } from '../../models/models';
import * as moment from 'moment';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PeriodosProvider } from '../../services/periodos/periodos';
import { getInjectionTokens } from '@angular/core/src/render3/discovery_utils';
//*****CUSTOM TEMPLATE */
@Component({
  selector: 'app-tanques',
  templateUrl: './tanques.page.html',
  styleUrls: ['./tanques.page.scss'],
})
export class TanquesPage implements OnInit {
  public almacenes;

  //*************  CONSTRUCTOR *************/
  constructor(
  public router: Router,
  public translate: TranslateService,
  public servidor: Servidor, 
  public db :SQLite,
  public network:Network, 
  public periodos: PeriodosProvider
  ) {
    this.almacenes = this.servidor.getParam();
  }

  //*************  INIT *************/
  ngOnInit() {
  }

  goTo(link?){
    if (!link) link='/home'
    this.router.navigateByUrl(link);
  }

  //*************  FUNCTIONS *************/



  
}
