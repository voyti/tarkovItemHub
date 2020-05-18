import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { BrowserAnimationsModule } from  '@angular/platform-browser/animations'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';

import { BarterViewComponent } from './components/barter-view/barter-view.component';
import { HideoutViewComponent } from './components/hideout-view/hideout-view.component';
import { QuestsViewComponent } from './components/quests-view/quests-view.component';
import { AmmoViewComponent } from './components/ammo-view/ammo-view.component';
import { ParametersInfoDialogComponent } from './components/parameters-info-dialog/parameters-info-dialog.component';
import { AboutInfoDialogComponent } from './components/about-info-dialog/about-info-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    BarterViewComponent,
    HideoutViewComponent,
    QuestsViewComponent,
    AmmoViewComponent,
    ParametersInfoDialogComponent,
    AboutInfoDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  entryComponents: [
    ParametersInfoDialogComponent
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
