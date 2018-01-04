import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { TenantsComponent } from './tenants/tenants.component';
import { RolesComponent } from './roles/roles.component';
import { LanguagesComponent } from './languages/languages.component';
import { LanguageTextsComponent } from './languages/language-texts/language-texts.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  { path: 'users', component: UsersComponent },
  { path: 'tenants', component: TenantsComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'languages', component: LanguagesComponent },
  { path: 'languages/:name/texts', component: LanguageTextsComponent, data: { permission: 'Pages.Administration.Languages.ChangeTexts' } },
  { path: 'notifications', component: NotificationsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
