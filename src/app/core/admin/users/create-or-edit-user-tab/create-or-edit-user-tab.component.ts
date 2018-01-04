import { Component, OnInit, Injector, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import {
  PasswordComplexitySetting,
  UserServiceProxy,
  ProfileServiceProxy,
  UserEditDto, UserRoleDto,
  OrganizationUnitDto,
  CreateOrUpdateUserInput
} from '../../../../shared/service-proxies/service-proxies';
import { OnChanges, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { AppConsts } from '../../../../shared/AppConsts';
import {
  OrganizationUnitTreeComponent,
  IOrganizationUnitsTreeComponentData
} from '../../shared/organization-unit-tree/organization-unit-tree.component';

import * as _ from 'lodash';
@Component({
  selector: 'app-create-or-edit-user-tab',
  templateUrl: './create-or-edit-user-tab.component.html',
  styleUrls: ['./create-or-edit-user-tab.component.scss']
})
export class CreateOrEditUserTabComponent extends AppComponentBase implements OnInit, OnChanges, AfterViewInit {

  @Input() userId: number;
  private userGroup: FormGroup;
  private passGroup: FormGroup;
  passwordComplexitySetting: PasswordComplexitySetting;
  //  = new PasswordComplexitySetting(
  // {
  //   requireDigit: true,
  //   requireLowercase: true,
  //   requireNonAlphanumeric: false,
  //   requireUppercase: false,
  //   requiredLength: 6,
  // }
  // );
  private user: UserEditDto = new UserEditDto();
  private roles: UserRoleDto[];
  private canChangeUserName = true;

  private allOrganizationUnits: OrganizationUnitDto[];
  private memberedOrganizationUnits: string[];

  private profilePicture: string;

  private active = false;

  private passwordComplexityInfo = '';

  private saving = false;
  private loading = false;


  @Output()
  saveState: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('organizationUnitTree') organizationUnitTree: OrganizationUnitTreeComponent;


  constructor(
    injector: Injector,
    fb: FormBuilder,
    private _userService: UserServiceProxy,
    private _profileService: ProfileServiceProxy
  ) {
    super(injector);

    this.userGroup = fb.group(
      {
        name: [],
        surname: [],
        emailAddress: ['', Validators.email],
        phoneNumber: [],
        userName: [],
        isChangePassword: [false],
        passwordGroup: fb.group({
          setRandomPassword: [false],
          password: [''],
          passwordRepeat: [''],
        }),
        shouldChangePasswordOnNextLogin: [],
        sendActivationEmail: [false],
        isActive: [],
        isLockoutEnabled: []
      }
    );
    this.passGroup = this.userGroup.get('passwordGroup') as FormGroup;

    this._profileService.getPasswordComplexitySetting().subscribe(passwordComplexityResult => {
      this.passwordComplexitySetting = passwordComplexityResult.setting;
      // this.passGroup.setValidators(this.passwordGroupValidator(passwordComplexityResult.setting));
    });
  }

  ngOnInit() {
    this.userGroup.get('isChangePassword').valueChanges.subscribe(value => {
      if (value) {
        this.passGroup.clearValidators();
        this.passGroup.setValidators(this.passwordGroupValidator(this.passwordComplexitySetting));
      } else {
        this.passGroup.clearValidators();
        this.passGroup.setErrors(null);
        this.passGroup.get('setRandomPassword').setValue(false);
        this.passGroup.get('password').setValue('');
        this.passGroup.get('passwordRepeat').setValue('');
        this.passGroup.get('password').setErrors(null);
        this.passGroup.get('passwordRepeat').setErrors(null);
      }
    });
  }

  ngOnChanges() {
    this.getUserForEdit(this.userId);
    if (this.userId) {
      this.userGroup.get('isChangePassword').setValue(false);
    } else {
      this.userGroup.get('isChangePassword').setValue(true);
    }
    this.passGroup.get('setRandomPassword').setValue(false);
    this.passGroup.get('password').setValue('');
    this.passGroup.get('passwordRepeat').setValue('');
  }

  ngAfterViewInit() {

  }

  refresh() {
    this.getUserForEdit(this.userId);
  }

  getUserForEdit(userId: number) {
    this.loading = true;
    this._userService.getUserForEdit(userId)
      // .delay(2000)
      .finally(() => { this.loading = false; })
      .subscribe(userResult => {
        this.user = userResult.user;
        this.roles = userResult.roles;
        this.canChangeUserName = this.user.userName !== AppConsts.userManagement.defaultAdminUserName;
        this.initUser(this.user);

        this.allOrganizationUnits = userResult.allOrganizationUnits;
        this.memberedOrganizationUnits = userResult.memberedOrganizationUnits;

        this.organizationUnitTree.data = <IOrganizationUnitsTreeComponentData>{
          allOrganizationUnits: this.allOrganizationUnits,
          selectedOrganizationUnits: this.memberedOrganizationUnits
        };

        this.getProfilePicture(userResult.profilePictureId);
      });
  }

  initUser(user: UserEditDto) {
    this.userGroup.get('name').setValue(user.name);
    this.userGroup.get('surname').setValue(user.surname);
    this.userGroup.get('emailAddress').setValue(user.emailAddress);
    this.userGroup.get('phoneNumber').setValue(user.phoneNumber);
    this.userGroup.get('userName').setValue(user.userName);
    this.userGroup.get('shouldChangePasswordOnNextLogin').setValue(user.shouldChangePasswordOnNextLogin);
    this.userGroup.get('isActive').setValue(user.isActive);
    this.userGroup.get('isLockoutEnabled').setValue(user.isLockoutEnabled);
    if (!this.canChangeUserName) {
      this.userGroup.get('userName').disable();
    }
  }

  getProfilePicture(profilePictureId: string): void {
    if (!profilePictureId) {
      this.profilePicture = '/assets/common/images/default-profile-picture.png';
    } else {
      this._profileService.getProfilePictureById(profilePictureId).subscribe(result => {

        if (result && result.profilePicture) {
          this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
        } else {
          this.profilePicture = '/assets/common/images/default-profile-picture.png';
        }
      });
    }
  }

  cancel() {
    this.saveState.emit(false);
  }

  save(ev: Event) {
    if (this.userGroup.invalid) {
      return;
    }
    const input = new CreateOrUpdateUserInput();

    input.user = this.user;
    input.user.name = this.userGroup.get('name').value;
    input.user.surname = this.userGroup.get('surname').value;
    input.user.emailAddress = this.userGroup.get('emailAddress').value;
    input.user.phoneNumber = this.userGroup.get('phoneNumber').value;
    input.user.userName = this.userGroup.get('userName').value;
    input.user.shouldChangePasswordOnNextLogin = this.userGroup.get('shouldChangePasswordOnNextLogin').value;
    input.user.isActive = this.userGroup.get('isActive').value;
    input.user.isLockoutEnabled = this.userGroup.get('isLockoutEnabled').value;
    input.user.password = this.passGroup.get('password').value;

    input.setRandomPassword = this.passGroup.get('setRandomPassword').value;
    input.sendActivationEmail = this.userGroup.get('sendActivationEmail').value;

    input.assignedRoleNames =
      _.map(
        _.filter(this.roles, { isAssigned: true }), role => role.roleName
      );

    input.organizationUnits = this.organizationUnitTree.getSelectedOrganizations();

    this.saving = true;
    this._userService.createOrUpdateUser(input)
      .finally(() => { this.saving = false; })
      .subscribe(() => {
        this.saveState.emit(true);
        this.notify.info(this.l('SavedSuccessfully'));
      });
  }

  passwordValidator(passwordComplexitySetting: PasswordComplexitySetting): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {

      if (!control.value || !passwordComplexitySetting) {
        return null;
      }

      if (passwordComplexitySetting.requiredLength) {
        const length = passwordComplexitySetting.requiredLength;
        if (control.value.length < length) {
          return {
            error: { desc: `password require requiredLength ${length}` }
          };
        }
      }

      if (passwordComplexitySetting.requireLowercase) {
        const re = /[a-z]/;
        if (control.value.search(re) === -1) {
          return {
            error: { desc: 'password require lowercase' }
          };
        }
      }

      if (passwordComplexitySetting.requireUppercase) {
        const re = /[A-Z]/;
        if (control.value.search(re) === -1) {
          return {
            error: { desc: 'password require uppercase' }
          };
        }
      }

      if (passwordComplexitySetting.requireDigit) {
        const re = /\d/i;
        if (!re.test(control.value)) {
          return {
            error: { desc: 'password require digit' }
          };
        }
      }

      if (passwordComplexitySetting.requireNonAlphanumeric) {
        const re = /[\W]/;
        if (control.value.search(re) === -1) {
          return {
            error: { desc: 'password require non alphanumeric' }
          };
        }
      }
      return null;
    };
  }

  passwordValidationInfo(
    control: AbstractControl,
    passwordComplexitySetting: PasswordComplexitySetting,
    errorCode: string
  ) {
    if (control.value === undefined || !passwordComplexitySetting) {
      return;
    }
    if (passwordComplexitySetting.requiredLength) {
      const length = passwordComplexitySetting.requiredLength;
      if (control.value.length < length) {
        if (errorCode === 'pwdError') {
          return {
            pwdError: { desc: `password require requiredLength ${length}` }
          };
        } else if (errorCode === 'pwdRptError') {
          return {
            pwdRptError: { desc: `password require requiredLength ${length}` }
          };
        }
      }
    }

    if (passwordComplexitySetting.requireLowercase) {
      const re = /[a-z]/;
      if (control.value.search(re) === -1) {
        if (errorCode === 'pwdError') {
          return {
            pwdError: { desc: 'password require lowercase' }
          };
        } else if (errorCode === 'pwdRptError') {
          return {
            pwdRptError: { desc: 'password require lowercase' }
          };
        }
      }
    }

    if (passwordComplexitySetting.requireUppercase) {
      const re = /[A-Z]/;
      if (control.value.search(re) === -1) {
        if (errorCode === 'pwdError') {
          return {
            pwdError: { desc: 'password require uppercase' }
          };
        } else if (errorCode === 'pwdRptError') {
          return {
            pwdRptError: { desc: 'password require uppercase' }
          };
        }
      }
    }

    if (passwordComplexitySetting.requireDigit) {
      const re = /\d/i;
      if (!re.test(control.value)) {
        if (errorCode === 'pwdError') {
          return {
            pwdError: { desc: 'password require digit' }
          };
        } else if (errorCode === 'pwdRptError') {
          return {
            pwdRptError: { desc: 'password require digit' }
          };
        }

      }
    }

    if (passwordComplexitySetting.requireNonAlphanumeric) {
      const re = /[\W]/;
      if (control.value.search(re) === -1) {
        if (errorCode === 'pwdError') {
          return {
            pwdError: { desc: 'password require non alphanumeric' }
          };
        } else if (errorCode === 'pwdRptError') {
          return {
            pwdRptError: { desc: 'password require non alphanumeric' }
          };
        }
      }
    }
    return null;
  }

  passwordGroupValidator(passwordComplexitySetting: PasswordComplexitySetting): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } => {
      const setRandomPassword = group.get('setRandomPassword') as FormControl;
      const password = group.get('password') as FormControl;
      const passwordRepeat = group.get('passwordRepeat') as FormControl;

      if ((setRandomPassword && setRandomPassword.value)) {
        password.setErrors(null);
        passwordRepeat.setErrors(null);
        return null;
      }

      const pwdResult = this.passwordValidationInfo(password, passwordComplexitySetting, 'pwdError');
      if (pwdResult) {
        password.setErrors(pwdResult);
        // return pwdResult;
      } else {
        password.setErrors(null);
      }

      const pwdRptResult = this.passwordValidationInfo(passwordRepeat, passwordComplexitySetting, 'pwdRptError');

      if (pwdRptResult) {
        passwordRepeat.setErrors(pwdRptResult);
        // return pwdRptResult;
      } else {
        passwordRepeat.setErrors(null);
      }

      if (pwdResult || pwdRptResult) {
        return {
          error: true
        };
      } else if (password.value !== passwordRepeat.value) {
        passwordRepeat.setErrors({
          pwdRptError: { desc: 'inconsistent Password and confirmation password' }
        });
        return { error: true };
      }
      return null;
    };
  }
}
