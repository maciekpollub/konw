import { ExcelService } from './services/excel.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrothersListComponent } from './brothers/brothers-list/brothers-list.component';

@NgModule({
  declarations: [
    AppComponent,
    BrothersListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
