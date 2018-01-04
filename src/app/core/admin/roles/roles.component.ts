import { Component, OnInit, Injector, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import { MatPaginator, MatSort, MatSnackBar, MatTabGroup, MatTab, MatDialog } from '@angular/material';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import {
  RoleServiceProxy,
  ListResultDtoOfRoleListDto,
  RoleListDto,
  GetRoleForEditOutput
} from '../../../shared/service-proxies/service-proxies';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent extends AppComponentBase implements OnInit {

  // ForTable
  displayedColumns = [
    'actions',
    'displayName',
    'creationTime',
  ];
  dataSource: RolesDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;


  // private roleId = 0;
  private roleForEditOutput: GetRoleForEditOutput;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  constructor(
    injector: Injector,
    private snackBar: MatSnackBar,
    private _roleService: RoleServiceProxy,
    public dialog: MatDialog,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.dataSource = new RolesDataSource(
      this.paginator,
      this.sort,
      this.snackBar,
      this._roleService,
      this.reloadEvent
    );
  }

  tabClick(tab: any) {
    this.reloadEvent.emit(true);
  }

  openEditTabs(roleId: number) {
    if (roleId && roleId > 0) {
      // this.roleId = roleId;
      this.fetchRoleDataForEdit(roleId);
    }
  }

  openCreateTabs(roleId?: number) {
    // console.log('openCreateTabs');
    this.fetchRoleDataForEdit(roleId);
  }

  fetchRoleDataForEdit(roleId: number) {
    this.dataSource.isLoadingResults = true;
    this._roleService.getRoleForEdit(roleId)
      // .delay(2000)
      .finally(() => {
        this.dataSource.isLoadingResults = false;
      })
      .subscribe(
      result => {
        if (result) {
          this.tabGroup.selectedIndex = 1;
          this.roleForEditOutput = result;
        }
      }
      );
  }

  deleteRole(row: RoleListDto) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        msg: 'RoleDeleteWarningMessage',
        displayName: row.displayName,
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._roleService.deleteRole(row.id).subscribe(() => {
          this.reloadEvent.emit(true);
          this.snackBar.open(this.l('SuccessfullyDeleted'), this.l('Close'), {
            duration: 2000,
          });
          // abp.notify.success(this.l('SuccessfullyDeleted'));
        });
      }
    });
  }
}

export class RolesDataSource extends DataSource<RoleListDto> {

  isLoadingResults = true;

  constructor(
    private paginator: MatPaginator,
    private sort: MatSort,
    private snackBar: MatSnackBar,
    private _roleService: RoleServiceProxy,
    private reloadEvent: EventEmitter<boolean>
  ) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<RoleListDto[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.reloadEvent,
    ];
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    if (!this.sort.active) {
      this.sort.active = 'displayName';
    }
    if (this.sort.direction === '') {
      this.sort.direction = 'asc';
    }
    return Observable
      .merge(...displayDataChanges)
      .startWith(null)
      .do(_ => { this.isLoadingResults = true; })
      // .delay(2000)
      .switchMap(() => {
        const result = this._roleService
          .getRoles('')
          .finally(() => { this.isLoadingResults = false; });
        return result;
      })
      .map(result => {
        // Flip flag to show that loading has finished.
        this.paginator.length = result.items.length;
        if (result.items.length === 0 || !result.items) {
          this.snackBar.open('NoData', 'Close', {
            duration: 2000,
          });
        }
        return result.items;
      });
  }
  disconnect(collectionViewer: CollectionViewer): void {
  }
  // The number of issues returned by github matching the query.
}
