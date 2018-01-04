import { Component, OnInit, Injector, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import {
  GetNotificationSettingsOutput,
  NotificationServiceProxy,
  UpdateNotificationSettingsInput,
  NotificationSubscriptionDto
} from '../../../../shared/service-proxies/service-proxies';
import * as _ from 'lodash';

@Component({
  selector: 'app-notifications-setting-dialog',
  templateUrl: './notifications-setting-dialog.component.html',
  styleUrls: ['./notifications-setting-dialog.component.scss']
})
export class NotificationsSettingDialogComponent extends AppComponentBase implements OnInit {

  private loading = false;
  private settings: GetNotificationSettingsOutput = new GetNotificationSettingsOutput();

  constructor(
    injector: Injector,
    public dialogRef: MatDialogRef<NotificationsSettingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _notificationService: NotificationServiceProxy

  ) {
    super(injector);
  }

  ngOnInit() {
    this.getSettings(() => {
      this.loading = false;
    });
  }

  save(): void {
    const input = new UpdateNotificationSettingsInput();
    input.receiveNotifications = this.settings.receiveNotifications;
    input.notifications = _.map(this.settings.notifications,
      (n) => {
        const subscription = new NotificationSubscriptionDto();
        subscription.name = n.name;
        subscription.isSubscribed = n.isSubscribed;
        return subscription;
      });

    this.loading = true;
    this._notificationService.updateNotificationSettings(input)
      .finally(() => this.loading = false)
      .subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.dialogRef.close();
      });
  }

  private getSettings(callback: () => void) {
    this.loading = true;
    this._notificationService.getNotificationSettings().subscribe((result: GetNotificationSettingsOutput) => {
      this.settings = result;
      callback();
    });
  }

}
