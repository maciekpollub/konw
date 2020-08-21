
import { ExcelService } from './services/excel.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromBrothers from './brothers/store/brothers.reducer';
import * as fromAccommodations from './accommodations/store/accommodation.reducer';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrothersListComponent } from './brothers/brothers-list/brothers-list.component';
import { HeaderComponent } from './header/header.component';
import { NoFileChosenComponent } from './brothers/no-file-chosen/no-file-chosen.component';
import { BrotherComponent } from './brothers/brothers-list/brother/brother.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AccommodationComponent } from './accommodations/accommodation/accommodation.component';
import { NightsComponent } from './brothers/brothers-list/brother/nights/nights.component';
import { NameOfSinglePipe } from './brothers/pipes/name-of-single.pipe';
import { FullAccommodationNameComponent } from './brothers/brothers-list/brother/full-accommodation-name/full-accommodation-name.component';
import { ModalComponent } from './shared/modal/modal.component';
import { AccommodationsListComponent } from './accommodations/accommodations-list/accommodations-list.component';


@NgModule({
  declarations: [
    AppComponent,
    BrothersListComponent,
    HeaderComponent,
    NoFileChosenComponent,
    BrotherComponent,
    AccommodationComponent,
    NightsComponent,
    NameOfSinglePipe,
    FullAccommodationNameComponent,
    ModalComponent,
    AccommodationsListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({
      brothers_: fromBrothers.brothersReducer,
      accommodations_: fromAccommodations.accommodationsReducer,
    }),
    MDBBootstrapModule.forRoot(), 
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }



