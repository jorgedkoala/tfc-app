import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';
import { EmpresaPage } from './pages/empresa/empresa.page';

// const routes: Routes = [
//     {
//       path: '',
//       component: EmpresaPage
//     }
//   ];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild(),
        //
        //RouterModule.forRoot(routes)
    ],
    declarations: [
        EmpresaPage
    ],
    exports: [
        EmpresaPage
    ]
})
  export class SharedModule {}
  