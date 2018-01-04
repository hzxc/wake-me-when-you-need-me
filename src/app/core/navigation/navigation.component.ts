import { Component, OnInit, Injector } from '@angular/core';
import { NavigationService } from './navigation.service';
import { Router } from '@angular/router';
import { SideBarMenu } from './side-bar-menu';
import { SideBarMenuItem } from './side-bar-menu-item';
import { AppComponentBase } from '../../shared/common/app-component-base';
import { PermissionCheckerService } from '../../abp/auth/permission-checker.service';
import { AppSessionService } from '../../shared/common/session/app-session.service';

@Component({
  selector: 'app-core-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent extends AppComponentBase implements OnInit {
  // menuItems: any[];
  constructor(
    private navService: NavigationService,
    injector: Injector,
    public permission: PermissionCheckerService,
    private _appSessionService: AppSessionService
  ) {
    super(injector);
  }

  menus: SideBarMenu = new SideBarMenu('MainMenu', 'MainMenu', [
    new SideBarMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'home', '/main/dashboard'),
    // new SideBarMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'home', '/main/dashboard'),
    new SideBarMenuItem('Tenants', 'Pages.Tenants', 'public', '/admin/tenants'),
    new SideBarMenuItem('Editions', 'Pages.Editions', 'grid_on', '/admin/editions'),
    new SideBarMenuItem('Administration', '', 'build', '', [
      new SideBarMenuItem('OrganizationUnits', 'Pages.Administration.OrganizationUnits', 'layers', '/admin/organization-units'),
      new SideBarMenuItem('Roles', 'Pages.Administration.Roles', 'assignment_ind', '/admin/roles'),
      new SideBarMenuItem('Users', 'Pages.Administration.Users', 'people', '/admin/users'),
      new SideBarMenuItem('Languages', 'Pages.Administration.Languages', 'flag', '/admin/languages'),
      new SideBarMenuItem('AuditLogs', 'Pages.Administration.AuditLogs', 'lock', '/admin/auditLogs'),
      new SideBarMenuItem('Maintenance', 'Pages.Administration.Host.Maintenance', 'cached', '/admin/maintenance'),
      new SideBarMenuItem('Subscription', 'Pages.Administration.Tenant.SubscriptionManagement',
        'refresh', '/app/admin/subscription-management'),
      new SideBarMenuItem('Settings', 'Pages.Administration.Host.Settings', 'settings', '/admin/hostSettings'),
      new SideBarMenuItem('Settings', 'Pages.Administration.Tenant.Settings', 'settings', '/admin/tenantSettings')
    ]),
    new SideBarMenuItem('DemoUiComponents', 'Pages.DemoUiComponents', 'polymer', '/admin/demo-ui-components'),
  ]);


  checkChildMenuItemPermission(menuItem): boolean {

    for (let i = 0; i < menuItem.items.length; i++) {
      const subMenuItem = menuItem.items[i];

      if (subMenuItem.permissionName && this.permission.isGranted(subMenuItem.permissionName)) {
        return true;
      }

      if (subMenuItem.items && subMenuItem.items.length) {
        return this.checkChildMenuItemPermission(subMenuItem);
      } else if (!subMenuItem.permissionName) {
        return true;
      }
    }

    return false;
  }

  showMenuItem(menuItem): boolean {
    if (menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement'
      && this._appSessionService.tenant &&
      !this._appSessionService.tenant.edition) {
      return false;
    }

    if (menuItem.permissionName) {
      return this.permission.isGranted(menuItem.permissionName);
    }

    if (menuItem.items && menuItem.items.length) {
      return this.checkChildMenuItemPermission(menuItem);
    }

    return true;
  }

  ngOnInit() {
    // Loads menu items from NavigationService
    // this.navService.menuItems$.subscribe(menuItem => {
    //   this.menuItems = menuItem;
    // });
  }

}
