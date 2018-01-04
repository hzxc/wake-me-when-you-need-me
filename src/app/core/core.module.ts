import { ThemeModule } from './../shared/theme/theme.module';
import { MaterialModule } from './../shared/material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponent } from './core.component';
import { CoreRoutingModule } from './core-routing.module';
import { NavigationComponent } from './navigation/navigation.component';
import { TopbarComponent } from './topbar/topbar.component';
import { NavigationService } from './navigation/navigation.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SideNavAccordionDirective } from './navigation/sidenav-accordion.directive';
import { CoreCommonModule } from './shared/common/core-common.module';
import { AppAuthService } from './shared/common/auth/app-auth.service';
import { AppRouteGuard } from './shared/common/auth/auth-route-guard';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserNotificationHelper } from './shared/notifications/UserNotificationHelper';
import { JqPluginDirective } from './shared/common/libs/jq-plugin.directive';
import { TopbarTimeagoDirective } from './topbar/topbar-timeago.directive';
import { SharedTopbarNotificationService } from './shared/notifications/shared-topbar-notification.service';
import { LinkedAccountsDialogComponent } from './topbar/linked-accounts-dialog/linked-accounts-dialog.component';
import { LinkAccountsDialogComponent } from './topbar/link-accounts-dialog/link-accounts-dialog.component';
import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { HttpModule } from '@angular/http';
import { ImpersonationService } from './admin/users/impersonation.service';
import { AppUrlService } from '../shared/common/nav/app-url.service';
import { UtilsModule } from '../shared/utils/utils.module';
import { ChangePasswordDialogComponent } from './topbar/profile/change-password-dialog/change-password-dialog.component';
import {
  ChangeProfilePictureDialogComponent
} from './topbar/profile/change-profile-picture-dialog/change-profile-picture-dialog.component';
import { MySettingsDialogComponent } from './topbar/profile/my-settings-dialog/my-settings-dialog.component';
import { SmsVerificationDialogComponent } from './topbar/profile/sms-verification-dialog/sms-verification-dialog.component';
import { FileUploadModule } from 'ng2-file-upload';
import { EqualValidator } from '../shared/utils/validation/equal-validator.directive';
import { MinValueValidator } from '../shared/utils/validation/min-value-validator.directive';
import { ChatBarComponent } from './topbar/chat/chat-bar/chat-bar.component';

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MaterialModule,
    FlexLayoutModule,
    ThemeModule,
    FormsModule,
    FileUploadModule,
    UtilsModule
  ],
  providers: [
    NavigationService,
    AppAuthService,
    AppRouteGuard,
    UserNotificationHelper,
    SharedTopbarNotificationService,
  ],
  entryComponents: [
    LinkedAccountsDialogComponent,
    LinkAccountsDialogComponent,
    ChangeProfilePictureDialogComponent,
    ChangePasswordDialogComponent
  ],
  declarations: [
    CoreComponent,
    NavigationComponent,
    JqPluginDirective,
    TopbarComponent,
    SideNavAccordionDirective,
    TopbarTimeagoDirective,
    LinkedAccountsDialogComponent,
    LinkAccountsDialogComponent,
    ChangePasswordDialogComponent,
    ChangeProfilePictureDialogComponent,
    MySettingsDialogComponent,
    SmsVerificationDialogComponent,
    ChatBarComponent,
  ]
})
export class CoreModule { }
