import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { UserNotification, NotificationServiceProxy } from '../../../shared/service-proxies/service-proxies';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { AppUserNotificationState } from '../../../shared/AppEnums';
import { IFormattedUserNotification, UserNotificationHelper } from '../../shared/notifications/UserNotificationHelper';
import * as moment from 'moment';
import { SharedTopbarNotificationService } from '../../shared/notifications/shared-topbar-notification.service';
import { NotificationsSettingDialogComponent } from './notifications-setting-dialog/notifications-setting-dialog.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent extends AppComponentBase implements OnInit {


  displayedColumns = [
    'actions',
    'text',
    'creationTime',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private dataSource: UserNotificationDataSource;


  constructor(
    injector: Injector,
    private _notificationService: NotificationServiceProxy,
    private _userNotificationHelper: UserNotificationHelper,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _sharedNotificationSrv: SharedTopbarNotificationService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.dataSource = new UserNotificationDataSource(
      this.paginator,
      this.sort,
      this.snackBar,
      this._notificationService,
      this._userNotificationHelper
    );

    this._sharedNotificationSrv.notificationReloadSource.subscribe(_ => {
      this.dataSource.reloadTable();
    });
  }

  openNotificationSettingsDialog(): void {
    const dialogRef = this.dialog.open(NotificationsSettingDialogComponent, {
      width: '400px',
      data: {
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.dataSource.reloadTable();
      }
    });
  }

  fromNow(date: moment.Moment): string {
    return moment(date).fromNow();
  }

  truncateString(text: any, length: number): string {
    return abp.utils.truncateStringWithPostfix(text, length);
  }

  setAsRead(row: any): void {
    this.setNotificationAsRead(row, () => {
      this._sharedNotificationSrv.notificationReloadTrigger(true);
      this.dataSource.reloadTable();
    });
  }

  setNotificationAsRead(userNotification: UserNotification, callback: () => void): void {
    this._userNotificationHelper
      .setAsRead(userNotification.id, () => {
        if (callback) {
          callback();
        }
      });
  }

  setAllNotificationsAsRead(): void {
    this._userNotificationHelper.setAllAsRead(() => {
      this._sharedNotificationSrv.notificationReloadTrigger(true);
      this.dataSource.reloadTable();
    });
  }

  refresh() {
    this.dataSource.reloadTable();
  }
}

export class UserNotificationDataSource extends DataSource<UserNotification> {

  private readStateFilter = 'ALL';
  private isLoadingResults = true;

  reloadBehavior = new BehaviorSubject(false);
  get reload(): boolean { return this.reloadBehavior.value; }
  set reload(reloadActive: boolean) { this.reloadBehavior.next(reloadActive); }
  public reloadTable() {
    this.reloadBehavior.next(true);
  }

  constructor(
    private paginator: MatPaginator,
    private sort: MatSort,
    private snackBar: MatSnackBar,
    private _notificationService: NotificationServiceProxy,
    private _userNotificationHelper: UserNotificationHelper,
  ) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<UserNotification[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.reloadBehavior,
    ];
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    if (this.sort.direction === '') {
      this.sort.direction = 'asc';
    }
    return Observable
      .merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.isLoadingResults = true;
        return this._notificationService.getUserNotifications(
          this.readStateFilter === 'ALL' ? undefined : AppUserNotificationState.Unread,
          this.paginator.pageSize,
          this.paginator.pageIndex * this.paginator.pageSize);
      })
      // .delay(2000)
      .map(result => {
        this.isLoadingResults = false;
        this.paginator.length = result.totalCount;
        if (!result.items || result.items.length === 0) {
          this.snackBar.open('NoData', 'Close', {
            duration: 2000,
          });
        }
        return this.formatNotifications(result.items);
      });
  }

  formatNotifications(records: any[]): any[] {
    const formattedRecords = [];
    for (const record of records) {
      record.formattedNotification = this.formatRecord(record);
      formattedRecords.push(record);
    }
    return formattedRecords;
  }

  formatRecord(record: any): IFormattedUserNotification {
    return this._userNotificationHelper.format(record, false);
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }
}
