import * as ngCommon from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppAuthService } from './auth/app-auth.service';
import { JqPluginDirective } from './libs/jq-plugin.directive';
import { AppRouteGuard } from './auth/auth-route-guard';
import { UtilsModule } from '../../../shared/utils/utils.module';
import { AbpModule } from '../../../abp/abp.module';
import { CommonModule } from '../../../shared/common/common.module';
import { AppLocalizationService } from './localization/app-localization.service';

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        UtilsModule,
        AbpModule,
        CommonModule,
    ],
    declarations: [
        JqPluginDirective,
    ],
    exports: [
        JqPluginDirective,
    ],
    providers: [
        AppLocalizationService
    ]
})
export class CoreCommonModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreCommonModule,
            providers: [
                AppAuthService,
                AppRouteGuard
            ]
        };
    }
}
