import { Component, OnInit, Injector, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import {
  TenantServiceProxy,
  CommonLookupServiceProxy,
  TenantListDto,
  ComboboxItemDto,
  EditionServiceProxy,
  PagedResultDtoOfTenantListDto,
  TenantEditDto,
} from '../../../shared/service-proxies/service-proxies';
import { ActivatedRoute } from '@angular/router';
import { ImpersonationService } from '../users/impersonation.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DataSource } from '@angular/cdk/collections';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/last';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { MatPaginator, MatSort, MatSnackBar, MatDialog, MatTable } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EditTenantModalComponent } from './edit-tenant-modal/edit-tenant-modal.component';
@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss']
})
export class TenantsComponent extends AppComponentBase implements OnInit {

  // ForTable
  displayedColumns = [
    'actions',
    'tenancyName',
    'name',
    'editionDisplayName',
    'subscriptionEndDateUtc',
    'isActive',
    'creationTime'
  ];
  dataSource: TenantsDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('tenantsForm') tenantsForm: ElementRef;

  private tenantsGroup: FormGroup;
  editions: ComboboxItemDto[] = [];
  filteredEditions: ComboboxItemDto[] = [];
  private filters: FilterDto = new FilterDto();
  name: string;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  constructor(
    injector: Injector,
    fb: FormBuilder,
    private _editionService: EditionServiceProxy,
    private _tenantService: TenantServiceProxy,
    private _activatedRoute: ActivatedRoute,
    private _commonLookupService: CommonLookupServiceProxy,
    private _impersonationService: ImpersonationService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    super(injector);
    this.setFiltersFromRoute();
    this.tenantsGroup = fb.group({
      filterText: [''],
      subscriptionDateGroup: fb.group({
        subscriptionEndDateRangeActive: [false],
        subscriptionEndDateStart: [],
        subscriptionEndDateEnd: [],
      }),
      creationDateGroup: fb.group({
        creationDateRangeActive: [false],
        creationDateStart: [],
        creationDateEnd: [],
      }),
      selectedEdition: [],
    });
    // this.tenantsGroup = new FormGroup({
    //   filterText: new FormControl(),
    //   subscriptionDateGroup: new FormGroup({
    //     subscriptionEndDateRangeActive: new FormControl(),
    //     subscriptionEndDateStart: new FormControl({ value: null, disabled: true }, Validators.required),
    //     subscriptionEndDateEnd: new FormControl({ value: null, disabled: true }, Validators.required),
    //   }),
    //   creationDateGroup: new FormGroup({
    //     creationDateRangeActive: new FormControl(),
    //     creationDateStart: new FormControl({ value: null, disabled: true }, Validators.required),
    //     creationDateEnd: new FormControl({ value: null, disabled: true }, Validators.required),
    //   }),
    //   selectedEdition: new FormControl(),
    // });
  }

  openEditDialog(tenantId: number): void {
    const dialogRef = this.dialog.open(EditTenantModalComponent, {
      width: '400px',
      data: {
        tenantId: tenantId,
        snackBar: this.snackBar
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reloadEvent.emit(result);
        // this.paginator.page.
        // this.tenantsForm.nativeElement.submit();
      }
    });
  }

  displayFn(edition: ComboboxItemDto): string {
    return edition ? edition.displayText : null;
  }

  setFiltersFromRoute(): void {
    if (this._activatedRoute.snapshot.queryParams['subscriptionEndDateStart'] != null) {
      this.filters.subscriptionEndDateRangeActive = true;
      this.filters.subscriptionEndDateStart = moment(this._activatedRoute.snapshot.queryParams['subscriptionEndDateStart']);
    } else {
      this.filters.subscriptionEndDateStart = moment().startOf('day');
    }

    if (this._activatedRoute.snapshot.queryParams['subscriptionEndDateEnd'] != null) {
      this.filters.subscriptionEndDateRangeActive = true;
      this.filters.subscriptionEndDateEnd = moment(this._activatedRoute.snapshot.queryParams['subscriptionEndDateEnd']);
    } else {
      this.filters.subscriptionEndDateEnd = moment().add(30, 'days').endOf('day');
    }

    if (this._activatedRoute.snapshot.queryParams['creationDateStart'] != null) {
      this.filters.creationDateRangeActive = true;
      this.filters.creationDateStart = moment(this._activatedRoute.snapshot.queryParams['creationDateStart']);
    } else {
      this.filters.creationDateStart = moment().add(-7, 'days').startOf('day');
    }

    if (this._activatedRoute.snapshot.queryParams['creationDateEnd'] != null) {
      this.filters.creationDateRangeActive = true;
      this.filters.creationDateEnd = moment(this._activatedRoute.snapshot.queryParams['creationDateEnd']);
    } else {
      this.filters.creationDateEnd = moment().endOf('day');
    }
  }

  filter(displayText: string): ComboboxItemDto[] {
    return this.editions.filter(
      edition =>
        edition.displayText.toLowerCase().indexOf(displayText.toLowerCase()) === 0);
  }

  autocompleteValueBinding(propertyName: string, newValue: any) {
    this.filters[propertyName] = newValue;
  }

  ngOnInit(): void {
    // forTable
    this.dataSource = new TenantsDataSource(
      this.filters,
      this.paginator,
      this.sort,
      this.tenantsForm,
      this.snackBar,
      this._tenantService,
      this.reloadEvent);
    this.filters.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';
    this._editionService
      .getEditionComboboxItems(0, true, false)
      .subscribe(editions => { this.editions = editions; this.filteredEditions = editions.slice(); });

    this.tenantsGroup.controls['selectedEdition'].valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      .startWith(null)
      .do(edition => edition && typeof edition === 'object' ?
        this.autocompleteValueBinding('selectedEditionId', edition.value) : this.filters.selectedEditionId = undefined)
      .map(edition => edition && typeof edition === 'object' ? edition.displayText : edition)
      .map(displayText => displayText ? this.filter(displayText) : this.editions.slice())
      .subscribe(filterResult => this.filteredEditions = filterResult);
  }
}

export class FilterDto {
  filterText: string;
  creationDateRangeActive: boolean;
  subscriptionEndDateRangeActive: boolean;
  subscriptionEndDateStart: moment.Moment;
  subscriptionEndDateEnd: moment.Moment;
  creationDateStart: moment.Moment;
  creationDateEnd: moment.Moment;
  selectedEditionId: number;
}

export class TenantsDataSource extends DataSource<TenantListDto> {
  // The number of issues returned by github matching the query.
  // resultsLength = 0;
  isLoadingResults = true;

  constructor(
    private filters: FilterDto,
    private paginator: MatPaginator,
    private sort: MatSort,
    private form: ElementRef,
    private snackBar: MatSnackBar,
    private _tenantService: TenantServiceProxy,
    private reloadEvent: EventEmitter<boolean>
  ) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<TenantListDto[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.reloadEvent,
      Observable.fromEvent(this.form.nativeElement, 'submit')
    ];
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    if (!this.sort.active) {
      this.sort.active = 'tenancyName';
    }
    if (this.sort.direction === '') {
      this.sort.direction = 'asc';
    }

    return Observable
      .merge(...displayDataChanges)
      .startWith(null)
      .do(_ => { this.isLoadingResults = true; })
      .switchMap(() => {
        return this._tenantService.getTenants(
          this.filters.filterText,
          this.filters.subscriptionEndDateRangeActive ? this.filters.subscriptionEndDateStart : undefined,
          this.filters.subscriptionEndDateRangeActive ? this.filters.subscriptionEndDateEnd : undefined,
          this.filters.creationDateRangeActive ? this.filters.creationDateStart : undefined,
          this.filters.creationDateRangeActive ? this.filters.creationDateEnd : undefined,
          this.filters.selectedEditionId,
          this.filters.selectedEditionId !== undefined && (this.filters.selectedEditionId + '') !== '-1',
          this.sort.active + ' ' + this.sort.direction,
          this.paginator.pageSize,
          this.paginator.pageIndex * this.paginator.pageSize);
      })
      // .delay(2000)
      .map(result => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.paginator.length = result.totalCount;
        if (result.totalCount === 0 || !result.items) {
          this.snackBar.open('NoData', 'Close', {
            duration: 2000,
          });
        }
        return result.items;
      });
  }

  disconnect() { }
}




