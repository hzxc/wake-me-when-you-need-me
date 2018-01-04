import { MaterialModule } from './../../shared/material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { AdminRoutingModule } from './admin-routing.module';
import {
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
} from '@angular/material';
import { TenantsComponent } from './tenants/tenants.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ImpersonationService } from './users/impersonation.service';
import { AppUrlService } from '../../shared/common/nav/app-url.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UtilsModule } from '../../shared/utils/utils.module';
import { EditTenantModalComponent } from './tenants/edit-tenant-modal/edit-tenant-modal.component';
import { RolesComponent } from './roles/roles.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { CreateOrEditRoleComponent } from './roles/create-or-edit-role/create-or-edit-role.component';
import { PermissionTreeComponent } from './shared/permission-tree.component';
import { PermissionComboComponent } from './shared/permission-combo/permission-combo.component';
import { RoleComboComponent } from './shared/role-combo/role-combo.component';
import { CreateOrEditUserTabComponent } from './users/create-or-edit-user-tab/create-or-edit-user-tab.component';
import { OrganizationUnitTreeComponent } from './shared/organization-unit-tree/organization-unit-tree.component';
import { EditUserPermissionsTabComponent } from './users/edit-user-permissions-tab/edit-user-permissions-tab.component';
import { LanguagesComponent } from './languages/languages.component';
import { LanguageTextsComponent } from './languages/language-texts/language-texts.component';
import { EditTextDialogComponent } from './languages/edit-text-dialog/edit-text-dialog.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationsSettingDialogComponent } from './notifications/notifications-setting-dialog/notifications-setting-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    UtilsModule
  ],
  entryComponents: [
    EditTenantModalComponent,
    ConfirmDialogComponent,
    EditTextDialogComponent,
    NotificationsSettingDialogComponent
  ],
  providers: [
    ImpersonationService,
    AppUrlService
  ],
  declarations: [
    UsersComponent,
    TenantsComponent,
    EditTenantModalComponent,
    RolesComponent,
    CreateOrEditRoleComponent,
    PermissionTreeComponent,
    ConfirmDialogComponent,
    PermissionComboComponent,
    RoleComboComponent,
    CreateOrEditUserTabComponent,
    OrganizationUnitTreeComponent,
    EditUserPermissionsTabComponent,
    LanguagesComponent,
    LanguageTextsComponent,
    EditTextDialogComponent,
    NotificationsComponent,
    NotificationsSettingDialogComponent,
  ]
})
export class AdminModule { }
