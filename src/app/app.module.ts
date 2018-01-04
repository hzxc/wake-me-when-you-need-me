import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, APP_INITIALIZER, LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppConsts } from './shared/AppConsts';
import { AppPreBootstrap } from './AppPreBootstrap';
import { ServiceProxyModule } from './shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from './shared/service-proxies/service-proxies';
import { AbpModule, ABP_HTTP_PROVIDER } from './abp/abp.module';
import { AppSessionService } from './shared/common/session/app-session.service';
import { CommonModule } from './shared/common/common.module';
import { AppAuthService } from './core/shared/common/auth/app-auth.service';
import { UrlHelper } from './shared/helpers/UrlHelper';
import { CustomServiceProxyModule } from './shared/service-proxies/custom/custom-service-proxy.module';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

export function appInitializerFactory(injector: Injector) {
  return () => {

    abp.ui.setBusy();

    handleLogoutRequest(injector.get(AppAuthService));

    return new Promise<boolean>((resolve, reject) => {
      AppPreBootstrap.run(() => {
        const appSessionService: AppSessionService = injector.get(AppSessionService);
        appSessionService.init().then(
          (result) => {
            abp.ui.clearBusy();
            resolve(result);
          },
          (err) => {
            abp.ui.clearBusy();
            reject(err);
          }
        );
      });
    });
  };
}

export function getRemoteServiceBaseUrl(): string {
  return AppConsts.remoteServiceBaseUrl;
}

export function getCurrentLanguage(): string {
  return abp.localization.currentLanguage.name;
}

function handleLogoutRequest(authService: AppAuthService) {
  const currentUrl = UrlHelper.initialUrl;
  const returnUrl = UrlHelper.getReturnUrl();
  if (currentUrl.indexOf(('account/logout')) >= 0 && returnUrl) {
    authService.logout(true, returnUrl);
  }
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AbpModule,
    ServiceProxyModule,
    CustomServiceProxyModule,
    AppRoutingModule,
    MatMomentDateModule
  ],
  providers: [
    AppSessionService,
    AppAuthService,
    ABP_HTTP_PROVIDER,
    { provide: API_BASE_URL, useFactory: getRemoteServiceBaseUrl },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [Injector],
      multi: true
    },
    {
      provide: LOCALE_ID,
      useFactory: getCurrentLanguage
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
