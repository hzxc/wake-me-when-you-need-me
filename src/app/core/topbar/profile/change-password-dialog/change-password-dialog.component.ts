import { Component, OnInit, Injector, Inject } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { ProfileServiceProxy, PasswordComplexitySetting, ChangePasswordInput } from '../../../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent extends AppComponentBase implements OnInit {

  private loading = false;
  passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();
  currentPassword: string;
  password: string;
  newPasswordRepeat: string;

  constructor(
    injector: Injector,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _profileService: ProfileServiceProxy
  ) {
    super(injector);
  }

  ngOnInit() {
    this.loading = true;
    this.currentPassword = '';
    this.password = '';
    this.newPasswordRepeat = '';

    this._profileService.getPasswordComplexitySetting()
      .subscribe(result => {
        this.passwordComplexitySetting = result.setting;
        this.loading = false;
      });
  }

  save(changePasswordForm: NgForm) {
    if (changePasswordForm.invalid) {
      return;
    }

    const input = new ChangePasswordInput();
    input.init(changePasswordForm.value);

    this.loading = true;
    this._profileService.changePassword(input)
      .finally(() => { this.loading = false; })
      .subscribe(() => {
        this.notify.info(this.l('YourPasswordHasChangedSuccessfully'));
        this.dialogRef.close(true);
      });
  }
}
