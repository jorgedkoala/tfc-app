import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { EmpresaPage} from './pages/empresa/empresa.page';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  { path: 'config', loadChildren: './pages/config/config.module#ConfigPageModule' },
  { path: 'empresa', component: EmpresaPage },
  { path: 'check', loadChildren: './pages/check/check.module#CheckPageModule' },
  { path: 'sync', loadChildren: './pages/sync/sync.module#SyncPageModule' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'check-limpieza', loadChildren: './pages/check-limpieza/check-limpieza.module#CheckLimpiezaPageModule' },
  { path: 'control', loadChildren: './pages/control/control.module#ControlPageModule' },
  { path: 'informes', loadChildren: './pages/informes/informes.module#InformesPageModule' },
  { path: 'supervision', loadChildren: './pages/supervision/supervision.module#SupervisionPageModule' },
  { path: 'tanques', loadChildren: './pages/tanques/tanques.module#TanquesPageModule' },
  { path: 'incidencias', loadChildren: './pages/incidencias/incidencias.module#IncidenciasPageModule' },
  { path: 'm-correctivo', loadChildren: './pages/m-correctivo/m-correctivo.module#MCorrectivoPageModule' },
  { path: 'mantenimiento', loadChildren: './pages/mantenimiento/mantenimiento.module#MantenimientoPageModule' },
  { path: 'traspasos', loadChildren: './pages/traspasos/traspasos.module#TraspasosPageModule' },
  { path: 'entradas-mp', loadChildren: './pages/entradas-mp/entradas-mp.module#EntradasMPPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
