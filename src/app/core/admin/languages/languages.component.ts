import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { ApplicationLanguageListDto, LanguageServiceProxy, SetDefaultLanguageInput } from '../../../shared/service-proxies/service-proxies';
import { Observable } from 'rxjs/Observable';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent extends AppComponentBase implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private dataSource: UsersDataSource | null;
  displayedColumns = [
    'actions',
    'displayName',
    'name',
    'creationTime',
    'isDisabled'
  ];

  constructor(
    injector: Injector,
    private _languageService: LanguageServiceProxy,
    private snackBar: MatSnackBar,
    private _router: Router
  ) {
    super(injector);
  }

  ngOnInit() {
    this.dataSource = new UsersDataSource(
      this._languageService,
      this.paginator,
      this.sort,
      this.snackBar,
    );
  }

  setAsDefaultLanguage(language: ApplicationLanguageListDto): void {
    const input = new SetDefaultLanguageInput();
    input.name = language.name;
    this._languageService.setDefaultLanguage(input).subscribe(() => {
      this.dataSource.reload = true;
      this.notify.success(this.l('SuccessfullySaved'));
    });
  }
  changeTexts(language: ApplicationLanguageListDto): void {
    this._router.navigate(['admin/languages', language.name, 'texts']);
  }
}

export class UsersDataSource extends DataSource<ApplicationLanguageListDto> {

  private isLoadingResults = true;
  private defaultLanguageName: string;

  reloadBehavior = new BehaviorSubject(false);
  get reload(): boolean { return this.reloadBehavior.value; }
  set reload(reloadActive: boolean) { this.reloadBehavior.next(reloadActive); }
  private paginator: MatPaginator;
  private _languageService: LanguageServiceProxy;
  private sort: MatSort;
  private snackBar: MatSnackBar;
  constructor(
    _languageService: LanguageServiceProxy,
    paginator: MatPaginator,
    sort: MatSort,
    snackBar: MatSnackBar,
  ) {
    super();
    this._languageService = _languageService;
    this.paginator = paginator;
    this.sort = sort;
    this.snackBar = snackBar;
  }
  connect(collectionViewer: CollectionViewer): Observable<ApplicationLanguageListDto[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.reloadBehavior,
    ];
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    if (!this.sort.active) {
      this.sort.active = 'userName';
    }
    if (this.sort.direction === '') {
      this.sort.direction = 'asc';
    }
    return Observable
      .merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.isLoadingResults = true;
        const result = this._languageService
          .getLanguages();
        return result;
      })
      // .delay(2000)
      .map(result => {
        this.isLoadingResults = false;
        this.paginator.length = result.items.length;
        this.defaultLanguageName = result.defaultLanguageName;
        if (!result.items || result.items.length === 0) {
          this.snackBar.open('NoData', 'Close', {
            duration: 2000,
          });
        }
        return result.items;
      });
  }
  disconnect(collectionViewer: CollectionViewer): void {

  }
}
