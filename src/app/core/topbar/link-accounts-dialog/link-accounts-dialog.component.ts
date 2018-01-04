import { Component, OnInit, Injector, Inject, ViewChild } from '@angular/core';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { LinkToUserInput, UserLinkServiceProxy } from '../../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-link-accounts-dialog',
  templateUrl: './link-accounts-dialog.component.html',
  styleUrls: ['./link-accounts-dialog.component.scss']
})
export class LinkAccountsDialogComponent extends AppComponentBase implements OnInit {

  private loading = false;
  private linkAccountGroup: FormGroup;
  private linkUser: LinkToUserInput = new LinkToUserInput();

  constructor(
    injector: Injector,
    public dialogRef: MatDialogRef<LinkAccountsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _userLinkService: UserLinkServiceProxy

  ) {
    super(injector);

  }

  ngOnInit() {
  }

  save(linkAccountForm: NgForm) {
    if (linkAccountForm.invalid) {
      return;
    }

    this.loading = true;
    this.linkUser.init(linkAccountForm.value);
    this._userLinkService.linkToUser(this.linkUser)
      .finally(() => { this.loading = false; })
      .subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.dialogRef.close(true);
      });
  }

}





