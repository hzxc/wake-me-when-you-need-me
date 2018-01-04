import { Injectable } from '@angular/core';
import { FileDto } from '../service-proxies/service-proxies';
import { AppConsts } from '../AppConsts';

@Injectable()
export class FileDownloadService {

  downloadTempFile(file: FileDto) {
    const url = AppConsts.remoteServiceBaseUrl +
      '/File/DownloadTempFile?fileType=' + file.fileType + '&fileToken=' + file.fileToken + '&fileName=' + file.fileName;
    location.href = url; // TODO: This causes reloading of same page in Firefox
  }
}
