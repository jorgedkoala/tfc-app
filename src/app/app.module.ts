import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';



//**** PLUGINS */
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Device } from '@ionic-native/device/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


import {HttpModule,Http} from '@angular/http';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import {TranslateModule,TranslateLoader,TranslateService  } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { PeriodosProvider } from './services/periodos/periodos';
import { Initdb } from './services/initdb';
// import { EmpresaPage } from './pages/empresa/empresa.page';
import { SharedModule } from './shared.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: 
  [AppComponent,
    // EmpresaPage
  ],

  entryComponents: [
    // EmpresaPage
  ],
  imports: [
    SharedModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  exports:[
  //  EmpresaPage
  ],
  providers: [
    Initdb,
    PeriodosProvider,
    SQLite,
    Network,
    Camera,
    BarcodeScanner,
    SocialSharing,
    FileTransfer,
    File,
    FileOpener,
    StatusBar,
    SplashScreen,
    TranslateService,
    Device,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
