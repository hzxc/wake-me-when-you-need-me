import { Component, OnInit, Input, Injector, ViewChild } from '@angular/core';
import * as domHelper from '../../shared/helpers/dom.helper';
import { ThemeService } from '../../shared/theme/theme.service';
import * as moment from 'moment';
import { AppComponentBase } from '../../shared/common/app-component-base';
import {
  ChangeUserLanguageDto,
  ProfileServiceProxy,
  NotificationServiceProxy,
  UserNotification,
  SessionServiceProxy,
  GetCurrentLoginInformationsOutput,
  TenantLoginInfoDto,
  LinkedUserDto,
  UserLinkServiceProxy
} from '../../shared/service-proxies/service-proxies';
import { IFormattedUserNotification, UserNotificationHelper } from '../shared/notifications/UserNotificationHelper';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatMenuTrigger, MatDialog } from '@angular/material';
import { SharedTopbarNotificationService } from '../shared/notifications/shared-topbar-notification.service';
import { AbpSessionService } from '../../abp/session/abp-session.service';
import { AbpMultiTenancyService } from '../../abp/multi-tenancy/abp-multi-tenancy.service';
import { LinkedAccountsDialogComponent } from './linked-accounts-dialog/linked-accounts-dialog.component';
import { AppAuthService } from '../shared/common/auth/app-auth.service';
import { ChangeProfilePictureDialogComponent } from './profile/change-profile-picture-dialog/change-profile-picture-dialog.component';
import { ChangePasswordDialogComponent } from './profile/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-core-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @Input() sidenav;
  @Input() chatBar;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  private isTrigger = false;

  private languages: abp.localization.ILanguageInfo[];
  private currentLanguage: abp.localization.ILanguageInfo;
  private isImpersonatedLogin = false;
  private shownLoginNameTitle = '';
  private shownLoginName = '';
  private tenant: TenantLoginInfoDto = new TenantLoginInfoDto();
  private recentlyLinkedUsers: LinkedUserDto[];
  private profilePicture = '/assets/common/images/default-profile-picture.png';

  private notifications: IFormattedUserNotification[] = [];
  private unreadNotificationCount = 0;

  constructor(
    injector: Injector,
    private themeService: ThemeService,
    private _profileServiceProxy: ProfileServiceProxy,
    private _notificationService: NotificationServiceProxy,
    private _userNotificationHelper: UserNotificationHelper,
    private _sharedNotificationSrv: SharedTopbarNotificationService,
    private _abpSessionService: AbpSessionService,
    private _sessionService: SessionServiceProxy,
    private _abpMultiTenancyService: AbpMultiTenancyService,
    private _userLinkServiceProxy: UserLinkServiceProxy,
    public dialog: MatDialog,
    private _authService: AppAuthService,

  ) {
    super(injector);
    // this.themes = this.themeService.themes;
  }

  ngOnInit() {
    this.languages = this.localization.languages.filter(l => (<any>l).isDisabled === false);
    this.languages.unshift(this.languages.pop());
    this.currentLanguage = this.languages.find(item => item.name === this.localization.currentLanguage.name);
    this.loadNotifications();
    this.trigger.onMenuOpen.subscribe(_ => {
      this.isTrigger = true;
    }
    );

    this._sharedNotificationSrv.notificationReloadSource.subscribe(_ => {
      this.loadNotifications();
    });

    this.isImpersonatedLogin = this._abpSessionService.impersonatorUserId > 0;
    this.shownLoginNameTitle = this.isImpersonatedLogin ? this.l('YouCanBackToYourAccount') : '';

    this.getCurrentLoginInformations();

    this.getProfilePicture();
    this.getRecentlyLinkedUsers();

  }

  ngAfterViewInit() {
  }

  getCurrentLoginInformations(): void {
    this.shownLoginName = this.appSession.getShownLoginName();
    this._sessionService.getCurrentLoginInformations()
      .subscribe((result: GetCurrentLoginInformationsOutput) => {
        this.tenant = result.tenant;
      });
  }

  getProfilePicture(): void {
    this._profileServiceProxy.getProfilePicture().subscribe(result => {
      if (result && result.profilePicture) {
        this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
      }
    });
  }

  getRecentlyLinkedUsers(): void {
    this._userLinkServiceProxy.getRecentlyUsedLinkedUsers().subscribe(result => {
      this.recentlyLinkedUsers = result.items;
    });
  }

  get multiTenancySideIsTenant(): boolean {
    return this._abpSessionService.tenantId > 0;
  }

  getShownUserName(linkedUser: LinkedUserDto): string {
    if (!this._abpMultiTenancyService.isEnabled) {
      return linkedUser.username;
    }

    return (linkedUser.tenantId ? linkedUser.tenancyName : '.') + '\\' + linkedUser.username;
  }

  showLinkedAccounts() {
    const dialogRef = this.dialog.open(LinkedAccountsDialogComponent, {
      width: '550px',
      data: {
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getRecentlyLinkedUsers();
      }
    });
  }

  changePassword(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
      data: {
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  changeProfilePicture(): void {
    const dialogRef = this.dialog.open(ChangeProfilePictureDialogComponent, {
      width: '450px',
      data: {
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProfilePicture();
      }
    });
  }

  logout(): void {
    this._authService.logout();
  }

  loadNotifications(): void {
    this._notificationService.getUserNotifications(undefined, 3, undefined).subscribe(result => {
      this.unreadNotificationCount = result.unreadCount;
      this.notifications = [];
      $.each(result.items, (index, item: UserNotification) => {
        this.notifications.push(this._userNotificationHelper.format(<any>item));
      });
    });
  }

  gotoUrl(url): void {
    if (url) {
      location.href = url;
    }
  }

  changeLanguage(languageName: string): void {
    const input = new ChangeUserLanguageDto();
    input.languageName = languageName;

    this._profileServiceProxy.changeLanguage(input).subscribe(() => {
      abp.utils.setCookieValue(
        'Abp.Localization.CultureName',
        languageName,
        new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
        abp.appPath
      );

      window.location.reload();
    });
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }
  toggleCollapse() {
    const appBody = document.body;
    domHelper.toggleClass(appBody, 'collapsed-menu');
    domHelper.removeClass(document.getElementsByClassName('has-submenu'), 'open');
  }

  setAllNotificationsAsRead() {
    console.log('setAllNotificationsAsRead');
  }
  openNotificationSettingsModal() {
    console.log('openNotificationSettingsModal');
  }

  setNotificationAsRead(notification: IFormattedUserNotification) {
    console.log('setNotificationAsRead');
  }
}
