import {
  Component,
  OnInit,
  Injector,
  Inject,
  ViewChild,
  AfterViewInit,
  ElementRef
} from '@angular/core';

import { AppComponentBase } from '../../../../shared/common/app-component-base';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  FileUploader,
  FileUploaderOptions,
  Headers
} from 'ng2-file-upload/ng2-file-upload';
import { AppConsts } from '../../../../shared/AppConsts';
import { ProfileServiceProxy, UpdateProfilePictureInput } from '../../../../shared/service-proxies/service-proxies';
import { TokenService } from '../../../../abp/auth/token.service';
import { IAjaxResponse } from '../../../../abp/abpHttp';


@Component({
  selector: 'app-change-profile-picture-dialog',
  templateUrl: './change-profile-picture-dialog.component.html',
  styleUrls: ['./change-profile-picture-dialog.component.scss']
})
export class ChangeProfilePictureDialogComponent extends AppComponentBase implements OnInit, AfterViewInit {

  private loading = false;
  public uploader: FileUploader;
  public temporaryPictureUrl: string;

  private temporaryPictureFileName: string;
  private _uploaderOptions: FileUploaderOptions = {};
  private _$profilePictureResize: JQuery;
  private _$jcropApi: any;

  @ViewChild('ProfilePictureResize') profilePictureResize: ElementRef;

  constructor(
    injector: Injector,
    public dialogRef: MatDialogRef<ChangeProfilePictureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _profileService: ProfileServiceProxy,
    private _tokenService: TokenService
  ) {
    super(injector);
  }

  ngOnInit() {
    console.log(this.profilePictureResize.nativeElement);
  }

  ngAfterViewInit() {
    this.initializeModal();
  }

  initializeModal(): void {
    this.loading = true;
    this.temporaryPictureUrl = '';
    this.temporaryPictureFileName = '';
    this._$profilePictureResize = null;
    this._$jcropApi = null;
    this.initFileUploader();
    this.loading = false;
  }

  initFileUploader(): void {
    const self = this;
    self._$profilePictureResize = $(this.profilePictureResize.nativeElement);
    self.uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + '/Profile/UploadProfilePicture' });
    self._uploaderOptions.autoUpload = true;
    self._uploaderOptions.authToken = 'Bearer ' + self._tokenService.getToken();
    self._uploaderOptions.removeAfterUpload = true;
    self.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    self.uploader.onSuccessItem = (item, response, status) => {
      const resp = <IAjaxResponse>JSON.parse(response);
      if (resp.success) {
        self.temporaryPictureFileName = resp.result.fileName;
        self.temporaryPictureUrl =
          AppConsts.remoteServiceBaseUrl
          + '/Temp/Downloads/'
          + resp.result.fileName
          + '?v='
          + new Date().valueOf();

        const newCanvasHeight = resp.result.height * self._$profilePictureResize.width() / resp.result.width;
        self._$profilePictureResize.height(newCanvasHeight + 'px');

        if (self._$jcropApi) {
          self._$jcropApi.destroy();
        }

        self._$profilePictureResize.attr('src', self.temporaryPictureUrl);
        self._$profilePictureResize.attr('originalWidth', resp.result.width);
        self._$profilePictureResize.attr('originalHeight', resp.result.height);

        self._$profilePictureResize.Jcrop({
          setSelect: [0, 0, 100, 100],
          aspectRatio: 1,
          boxWidth: 400,
          boxHeight: 400
        }, function () {
          self._$jcropApi = this;
        });

      } else {
        this.message.error(resp.error.message);
      }
    };

    self.uploader.setOptions(self._uploaderOptions);
  }

  save(): void {
    const self = this;
    if (!self.temporaryPictureFileName) {
      return;
    }

    let resizeParams = { x: 0, y: 0, w: 0, h: 0 };
    if (self._$jcropApi) {
      resizeParams = self._$jcropApi.getSelection();
    }

    const containerWidth = parseInt(self._$jcropApi.getContainerSize()[0], 10);
    const containerHeight = self._$jcropApi.getContainerSize()[1];

    let originalWidth = containerWidth;
    let originalHeight = containerHeight;

    if (self._$profilePictureResize) {
      originalWidth = parseInt(self._$profilePictureResize.attr('originalWidth'), 10);
      originalHeight = parseInt(self._$profilePictureResize.attr('originalHeight'), 10);
    }

    const widthRatio = originalWidth / containerWidth;
    const heightRatio = originalHeight / containerHeight;

    const input = new UpdateProfilePictureInput();
    input.fileName = self.temporaryPictureFileName;
    input.x = Math.floor(resizeParams.x * widthRatio);
    input.y = Math.floor(resizeParams.y * heightRatio);
    input.width = Math.floor(resizeParams.w * widthRatio);
    input.height = Math.floor(resizeParams.h * heightRatio);

    this.loading = true;
    self._profileService.updateProfilePicture(input)
      .finally(() => { this.loading = false; })
      .subscribe(() => {
        const self = this;
        self._$jcropApi.destroy();
        self._$jcropApi = null;
        this.notify.info(this.l('SavedSuccessfully'));
        this.dialogRef.close(true);
      });
  }
}
