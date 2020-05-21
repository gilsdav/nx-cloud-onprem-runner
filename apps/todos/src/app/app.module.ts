import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { UiModule } from '@myorg/ui';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, UiModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
