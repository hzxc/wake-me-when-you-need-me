import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SharedAccountLoginService } from './services/shared-account-login.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit {

  private submitting = false;
  constructor(
    private sharedAccountLoginService: SharedAccountLoginService) {
  }

  ngOnInit() {
    this.sharedAccountLoginService.progressBar$.subscribe(submitting => {
      this.submitting = submitting;
    });
  }
}
