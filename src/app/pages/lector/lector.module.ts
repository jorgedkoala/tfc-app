import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
//import { CheckLimpiezaPageModule } from '../check-limpieza/check-limpieza.module'
 import { LectorPage } from './lector.page';

const routes: Routes = [
  {
    path: '',
    component: LectorPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
 //   CheckLimpiezaPageModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [LectorPage]
})
export class LectorPageModule {}
