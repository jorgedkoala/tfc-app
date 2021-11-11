import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { EmpresaPage} from './pages/empresa/empresa.page';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  { path: 'home',loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'home/:source',loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  { path: 'config', loadChildren: () => import('./pages/config/config.module').then(m => m.ConfigPageModule) },
  { path: 'empresa', component: EmpresaPage },
  { path: 'empresa/:idEmpresa', component: EmpresaPage },
  { path: 'check', loadChildren: () => import('./pages/check/check.module').then(m => m.CheckPageModule) },
  { path: 'sync', loadChildren: () => import('./pages/sync/sync.module').then(m => m.SyncPageModule) },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'login/:menu', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'check-limpieza', loadChildren: () => import('./pages/check-limpieza/check-limpieza.module').then(m => m.CheckLimpiezaPageModule) },
  { path: 'control', loadChildren: () => import('./pages/control/control.module').then(m => m.ControlPageModule) },
  { path: 'informes', loadChildren: () => import('./pages/informes/informes.module').then(m => m.InformesPageModule) },
  { path: 'supervision', loadChildren: () => import('./pages/supervision/supervision.module').then(m => m.SupervisionPageModule) },
  { path: 'tanques', loadChildren: () => import('./pages/tanques/tanques.module').then(m => m.TanquesPageModule) },
  { path: 'incidencias', loadChildren: () => import('./pages/incidencias/incidencias.module').then(m => m.IncidenciasPageModule) },
  // { path: 'm-correctivo', loadChildren: './pages/m-correctivo/m-correctivo.module#MCorrectivoPageModule' },
  // { path: 'mantenimiento', loadChildren: './pages/mantenimiento/mantenimiento.module#MantenimientoPageModule' },
  { path: 'traspasos', loadChildren: () => import('./pages/traspasos/traspasos.module').then(m => m.TraspasosPageModule) },
  { path: 'entradas-mp', loadChildren: () => import('./pages/entradas-mp/entradas-mp.module').then(m => m.EntradasMPPageModule) },
  // { path: 'lector', loadChildren: './pages/lector/lector.module#LectorPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
