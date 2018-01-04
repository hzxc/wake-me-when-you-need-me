
import * as moment from 'moment';
import { API_BASE_URL } from '../service-proxies';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { Http, Headers, ResponseContentType, Response } from '@angular/http';

import 'rxjs/add/operator/finally';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

@Injectable()
export class CustomEditionService {
  private http: Http;
  private baseUrl: string;
  protected jsonParseReviver: (key: string, value: any) => any = undefined;

  constructor( @Inject(Http) http: Http, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : '';
  }

  /**
   * @selectedEditionId (optional)
   * @addAllItem (optional)
   * @onlyFreeItems (optional)
   * @return Success
   */
  getEditionComboboxItems(
    selectedEditionId: number,
    addAllItem: boolean,
    onlyFreeItems: boolean): Observable<SubscribableEditionComboboxItemDto> {
    let url_ = this.baseUrl + '/api/services/app/Edition/GetEditionComboboxItems?';
    if (selectedEditionId !== undefined) {
      url_ += 'selectedEditionId=' + encodeURIComponent('' + selectedEditionId) + '&';
    }
    if (addAllItem !== undefined) {
      url_ += 'addAllItem=' + encodeURIComponent('' + addAllItem) + '&';
    }

    if (onlyFreeItems !== undefined) {
      url_ += 'onlyFreeItems=' + encodeURIComponent('' + onlyFreeItems) + '&';
    }
    url_ = url_.replace(/[?&]$/, '');

    const options_: any = {
      method: 'get',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
    // return this.http.request(url_, options_)
    //   .map(res => res.json());

    return this.http.request(url_, options_)
      .do(res => console.log(res.json() as SubscribableEditionComboboxItemDto))
      .flatMap((response_: any) => {
        return this.processGetEditionComboboxItems(response_);
      });
      // .catch((response_: any) => {
      //   if (response_ instanceof Response) {
      //     try {
      //       return this.processGetEditionComboboxItems(response_);
      //     } catch (e) {
      //       return <Observable<SubscribableEditionComboboxItemDto[]>><any>Observable.throw(e);
      //     }
      //   } else {
      //     return <Observable<SubscribableEditionComboboxItemDto[]>><any>Observable.throw(response_);
      //   }
      // });
  }

  protected processGetEditionComboboxItems(response: Response): Observable<SubscribableEditionComboboxItemDto> {
    const status = response.status;

    const _headers: any = response.headers ? response.headers.toJSON() : {};
    if (status === 200) {
      console.log(response);
      const _responseText = response.text();
      let result200: any = null;
      const resultData200 = _responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver);
      if (resultData200 && resultData200.constructor === Array) {
        result200 = [];
        for (const item of resultData200) {
          result200.push(SubscribableEditionComboboxItemDto.fromJS(item));
        }
      }
      return Observable.from<SubscribableEditionComboboxItemDto>(result200);
    } else if (status !== 200 && status !== 204) {
      const _responseText = response.text();
      return throwException('An unexpected server error occurred.', status, _responseText, _headers);
    }
    return Observable.of<SubscribableEditionComboboxItemDto>(<any>null);
  }
}



export interface ISubscribableEditionComboboxItemDto {
  isFree: boolean;
  value: string;
  displayText: string;
  isSelected: boolean;
}

export class SubscribableEditionComboboxItemDto implements ISubscribableEditionComboboxItemDto {
  isFree: boolean;
  value: string;
  displayText: string;
  isSelected: boolean;

  constructor(data?: ISubscribableEditionComboboxItemDto) {
    if (data) {
      for (const property in data) {
        if (data.hasOwnProperty(property)) {
          (<any>this)[property] = (<any>data)[property];
        }
      }
    }
  }

  static fromJS(data: any): SubscribableEditionComboboxItemDto {
    const result = new SubscribableEditionComboboxItemDto();
    result.init(data);
    return result;
  }

  init(data?: any) {
    if (data) {
      this.isFree = data['isFree'];
      this.value = data['value'];
      this.displayText = data['displayText'];
      this.isSelected = data['isSelected'];
    }
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['isFree'] = this.isFree;
    data['value'] = this.value;
    data['displayText'] = this.displayText;
    data['isSelected'] = this.isSelected;
    return data;
  }

  clone() {
    const json = this.toJSON();
    const result = new SubscribableEditionComboboxItemDto();
    result.init(json);
    return result;
  }
}

export class SwaggerException extends Error {
  message: string;
  status: number;
  response: string;
  headers: { [key: string]: any; };
  result: any;

  constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
    super();

    this.message = message;
    this.status = status;
    this.response = response;
    this.headers = headers;
    this.result = result;
  }

  protected isSwaggerException = true;

  static isSwaggerException(obj: any): obj is SwaggerException {
    return obj.isSwaggerException === true;
  }
}

function throwException(
  message: string,
  status: number,
  response: string,
  headers: { [key: string]: any; },
  result?: any): Observable<any> {
  if (result !== null && result !== undefined) {
    return Observable.throw(result);
  } else {
    return Observable.throw(new SwaggerException(message, status, response, headers, null));
  }
}

