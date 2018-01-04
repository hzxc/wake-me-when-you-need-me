import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Injectable()
export class SharedTopbarNotificationService {
  notificationReloadSource = new BehaviorSubject(false);

  notificationReloadTrigger(reload: boolean) {
    this.notificationReloadSource.next(reload);
  }
}
