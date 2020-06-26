import { BrotherComponent } from './brothers/brothers-list/brother/brother.component';
import { NoFileChosenComponent } from './brothers/no-file-chosen/no-file-chosen.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrothersListComponent } from './brothers/brothers-list/brothers-list.component';


const routes: Routes = [
  {path: '', redirectTo: 'brothers', pathMatch: 'full'},
  {path: 'brothers', component: BrothersListComponent,
    // children: [
    //   {path: ':id', component: BrotherComponent}
    // ]
  },
  {path: 'brothers/:id', component: BrotherComponent},
  {path: 'brothers/:new', component: BrotherComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
