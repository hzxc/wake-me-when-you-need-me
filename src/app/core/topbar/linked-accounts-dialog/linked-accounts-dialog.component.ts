import { Component, OnInit, Injector, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { LinkedUserDto, UserLinkServiceProxy, UnlinkUserInput } from '../../../shared/service-proxies/service-proxies';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { AbpMultiTenancyService } from '../../../abp/multi-tenancy/abp-multi-tenancy.service';

import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/delay';
import { LinkAccountsDialogComponent } from '../link-accounts-dialog/link-accounts-dialog.component';

@Component({
  selector: 'app-linked-accounts-dialog',
  templateUrl: './linked-accounts-dialog.component.html',
  styleUrls: ['./linked-accounts-dialog.component.scss']
})
export class LinkedAccountsDialogComponent extends AppComponentBase implements OnInit {

  displayedColumns = [
    'actions',
    'username',
    'delete-actions'
  ];
  dataSource: LinkedAccountsDataSource | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    injector: Injector,
    public dialogRef: MatDialogRef<LinkedAccountsDialogComponent>,
    private snackBar: MatSnackBar,
    private _userLinkService: UserLinkServiceProxy,
    private abpMultiTenancyService: AbpMultiTenancyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.dataSource = new LinkedAccountsDataSource(
      this.paginator,
      this.sort,
      this.snackBar,
      this._userLinkService
    );
  }

  getShownLinkedUserName(linkedUser: LinkedUserDto): string {
    if (!this.abpMultiTenancyService.isEnabled) {
      return linkedUser.username;
    }

    return (linkedUser.tenantId ? linkedUser.tenancyName : '.') + '\\' + linkedUser.username;
  }

  openLinkAccountsDialog(): void {
    const dialogRef = this.dialog.open(LinkAccountsDialogComponent, {
      width: '400px',
      data: {
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.reloadTable();
      }
    });
  }

  deleteLinkedUser(linkedUser: LinkedUserDto): void {
    const username = linkedUser.username;
    this.message.confirm(
      this.l('LinkedUserDeleteWarningMessage', username),
      isConfirmed => {
        if (isConfirmed) {
          const unlinkUserInput = new UnlinkUserInput();
          unlinkUserInput.userId = linkedUser.id;
          unlinkUserInput.tenantId = linkedUser.tenantId;

          this._userLinkService.unlinkUser(unlinkUserInput).subscribe(() => {
            this.dataSource.reloadTable();
            this.notify.success(this.l('SuccessfullyUnlinked'));
          });
        }
      }
    );
  }

}

export class LinkedAccountsDataSource extends DataSource<LinkedUserDto> {

  private isLoadingResults = true;
  constructor(
    private paginator: MatPaginator,
    private sort: MatSort,
    private snackBar: MatSnackBar,
    private _userLinkService: UserLinkServiceProxy,
  ) {
    super();
  }
  reloadBehavior = new BehaviorSubject(false);
  get reload(): boolean { return this.reloadBehavior.value; }
  set reload(reloadActive: boolean) { this.reloadBehavior.next(reloadActive); }
  public reloadTable() {
    this.reloadBehavior.next(true);
  }
  connect(collectionViewer: CollectionViewer): Observable<LinkedUserDto[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.reloadBehavior,
    ];
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    if (this.sort.direction === '') {
      this.sort.direction = 'asc';
    }
    return Observable
      .merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.isLoadingResults = true;
        return this._userLinkService.getLinkedUsers(
          this.paginator.pageSize,
          this.paginator.pageIndex * this.paginator.pageSize,
          this.sort.active ? this.sort.active + ' ' + this.sort.direction : '',
        );
      })
      // .delay(2000)
      .map(result => {
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
