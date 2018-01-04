import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class SharedAccountLoginService {
  // Observable boolean sources
  private progressBarSource = new Subject<boolean>();
  // Observable string streams
  progressBar$ = this.progressBarSource.asObservable();
  // Service message commands
  progressBarChange(progress: boolean) {
    this.progressBarSource.next(progress);
  }
}
