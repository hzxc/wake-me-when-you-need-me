import { Component, OnInit, AfterViewInit, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import * as _ from 'lodash';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { LanguageTextListDto, LanguageServiceProxy } from '../../../../shared/service-proxies/service-proxies';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { EditTextDialogComponent } from '../edit-text-dialog/edit-text-dialog.component';

@Component({
  selector: 'app-language-texts',
  templateUrl: './language-texts.component.html',
  styleUrls: ['./language-texts.component.scss']
})
export class LanguageTextsComponent extends AppComponentBase implements AfterViewInit, OnInit {
  displayedColumns = [
    'actions',
    'key',
    'baseValue',
    'targetValue',
  ];
  private sourceNames: string[] = [];
  private filters: FilterDto = new FilterDto();
  private languages: abp.localization.ILanguageInfo[] = [];
  private currentLanguage: abp.localization.ILanguageInfo;
  private targetLanguage: abp.localization.ILanguageInfo;
  private dataSource: LanguageTextDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    injector: Injector,
    private _languageService: LanguageServiceProxy,
    private _activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    super(injector);
  }

  ngOnInit() {
    this.sourceNames = _.map(_.filter(
      abp.localization.sources,
      source => source.type === 'MultiTenantLocalizationSource'),
      value => value.name);
    this.languages = abp.localization.languages;
    this.init();

    this.dataSource = new LanguageTextDataSource(
      this._languageService,
      this.paginator,
      this.sort,
      this.filters,
      this.snackBar,
    );
  }

  init(): void {
    this._activatedRoute.params.subscribe((params: Params) => {
      this.filters.baseLanguageName = params['baseLanguageName'] || abp.localization.currentLanguage.name;
      this.currentLanguage = this.languages.find(item => item.name === this.filters.baseLanguageName);
      this.filters.targetLanguageName = params['name'];
      this.targetLanguage = this.languages.find(item => item.name === this.filters.targetLanguageName);
      this.filters.sourceName = params['sourceName'] || 'AbpZeroTemplate';
      this.filters.targetValueFilter = params['targetValueFilter'] || 'ALL';
      this.filters.filterText = params['filterText'] || '';
    });
  }

  baseLanguageChange(language: abp.localization.ILanguageInfo) {
    this.filters.baseLanguageName = language.name;
  }
  targetLanguageChange(language: abp.localization.ILanguageInfo) {
    this.filters.targetLanguageName = language.name;
  }

  openEditDialog(row: LanguageTextListDto): void {
    const dialogRef = this.dialog.open(EditTextDialogComponent, {
      width: '400px',
      data: {
        baseLanguageName: this.filters.baseLanguageName,
        targetLanguageName: this.filters.targetLanguageName,
        sourceName: this.filters.sourceName,
        key: row.key,
        baseValue: row.baseValue,
        targetValue: row.targetValue,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.reloadTable();
      }
    });
  }

  ngAfterViewInit() {
  }

  truncateString(text): string {
    return abp.utils.truncateStringWithPostfix(text, 32, '...');
  }

  search() {
    this.dataSource.reloadTable();
  }
}

class FilterDto {
  sourceName: string;
  baseLanguageName: string;
  targetLanguageName: string;
  targetValueFilter: string;
  filterText: string;
}

export class LanguageTextDataSource extends DataSource<LanguageTextListDto> {

  private isLoadingResults = true;
  private _languageService: LanguageServiceProxy;
  private paginator: MatPaginator;
  private sort: MatSort;
  constructor(
    _languageService: LanguageServiceProxy,
    paginator: MatPaginator,
    sort: MatSort,
    private filters: FilterDto,
    private snackBar: MatSnackBar,
  ) {
    super();
    this._languageService = _languageService;
    this.paginator = paginator;
    this.sort = sort;
  }

  reloadBehavior = new BehaviorSubject(false);
  get reload(): boolean { return this.reloadBehavior.value; }
  set reload(reloadActive: boolean) { this.reloadBehavior.next(reloadActive); }
  public reloadTable() {
    this.reloadBehavior.next(true);
  }

  connect(collectionViewer: CollectionViewer): Observable<LanguageTextListDto[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.reloadBehavior,
    ];

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    // if (!this.sort.active) {
    //   this.sort.active = 'key';
    // }
    if (this.sort.direction === '') {
      this.sort.direction = 'asc';
    }

    return Observable
      .merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.isLoadingResults = true;
        return this._languageService.getLanguageTexts(
          this.paginator.pageSize,
          this.paginator.pageIndex * this.paginator.pageSize,
          this.sort.active ? this.sort.active + ' ' + this.sort.direction : '',
          this.filters.sourceName,
          this.filters.baseLanguageName,
          this.filters.targetLanguageName,
          this.filters.targetValueFilter,
          this.filters.filterText);
      }).map(result => {
        this.isLoadingResults = false;
        this.paginator.length = result.totalCount;
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
