import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account.component';
import { AccountRoutingModule } from './account-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ServiceProxyModule } from '../shared/service-proxies/service-proxy.module';
import { LoginService } from './services/login.service';
import { LoginComponent } from './login/login.component';
import { LanguagesComponent } from './languages/languages.component';
import { AbpModule } from '../abp/abp.module';
import { MaterialModule } from '../shared/material/material.module';
import { ThemeModule } from '../shared/theme/theme.module';
import { SharedAccountLoginService } from './services/shared-account-login.service';

@NgModule({
  imports: [
    CommonModule,
    AccountRoutingModule,
    FormsModule,
    HttpModule,
    HttpModule,
    ServiceProxyModule,
    ReactiveFormsModule,
    MaterialModule,
    AbpModule,
    ThemeModule
  ],
  providers: [
    LoginService,
    SharedAccountLoginService
  ],
  declarations: [
    AccountComponent,
    LoginComponent,
    LanguagesComponent
  ]
})
export class AccountModule { }
