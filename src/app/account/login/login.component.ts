import {
  Component,
  Injector,
  ViewChild,
  ElementRef,
  Output,
  OnDestroy,
  OnInit,
  AfterContentInit,
} from '@angular/core';
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton, MatInput } from '@angular/material';
import { LoginService, ExternalLoginProvider } from '../services/login.service';
import { AbpSessionService } from '../../abp/session/abp-session.service';
import { SessionServiceProxy, UpdateUserSignInTokenOutput } from '../../shared/service-proxies/service-proxies';
import { UrlHelper } from '../../shared/helpers/UrlHelper';
import { AppComponentBase } from '../../shared/common/app-component-base';
import { SharedAccountLoginService } from '../services/shared-account-login.service';

@Component({
  selector: 'app-account-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends AppComponentBase implements OnInit, AfterContentInit {


  @ViewChild(MatInput) matInput: MatInput;
  @ViewChild(MatButton) submitButton: MatButton;
  private loginModel: FormGroup;
  submitting = false;

  constructor(injector: Injector,
    public loginService: LoginService,
    private _router: Router,
    private _sessionService: AbpSessionService,
    fb: FormBuilder,
    private _sessionAppService: SessionServiceProxy,
    private sharedAccountLoginService: SharedAccountLoginService) {
    super(injector);
    this.loginModel = fb.group({
      userNameOrEmailAddress: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberClient: false,
    }
    );
  }

  get multiTenancySideIsTeanant(): boolean {
    return this._sessionService.tenantId > 0;
  }

  get isSelfRegistrationAllowed(): boolean {
    if (!this._sessionService.tenantId) {
      return false;
    }
    return this.setting.getBoolean('App.UserManagement.AllowSelfRegistration');
  }

  userNameOrEmailAddressErrorMessage(): string {
    return this.loginModel.hasError('required', ['userNameOrEmailAddress']) ? 'You must enter a value' :
      this.loginModel.hasError('minlength', ['userNameOrEmailAddress']) ? 'minLength length 4' : '';
  }
  passwordErrorMessage(): string {
    return this.loginModel.hasError('required', ['password']) ? 'You must enter a value' :
      this.loginModel.hasError('minlength', ['password']) ? 'minLength length 6' : '';
  }

  ngAfterContentInit() {
    this.matInput.focus();
  }

  progressBarChange() {
    this.submitting = !this.submitting;
    this.sharedAccountLoginService.progressBarChange(this.submitting);
  }

  login(): void {
    if (this.loginModel.invalid) {
      return;
    }
    this.progressBarChange();
    this.submitButton.disabled = true;
    this.loginService.authenticate(
      () => { this.submitButton.disabled = false; this.progressBarChange(); }
    );
  }

  externalLogin(provider: ExternalLoginProvider) {
    this.loginService.externalAuthenticate(provider);
  }

  ngOnInit(): void {
    if (this._sessionService.userId > 0 && UrlHelper.getReturnUrl() && UrlHelper.getSingleSignIn()) {
      this._sessionAppService.updateUserSignInToken()
        .subscribe((result: UpdateUserSignInTokenOutput) => {
          const initialReturnUrl = UrlHelper.getReturnUrl();
          const returnUrl = initialReturnUrl + (initialReturnUrl.indexOf('?') >= 0 ? '&' : '?') +
            'accessToken=' + result.signInToken +
            '&userId=' + result.encodedUserId +
            '&tenantId=' + result.encodedTenantId;

          location.href = returnUrl;
        });
    }
  }
}
