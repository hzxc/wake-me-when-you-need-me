import { element } from 'protractor';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Injector,
  EventEmitter,
  Input,
} from '@angular/core';

import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatTabGroup, MatTab, MatTabLabel, MatLabel } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import { UserListDto, UserServiceProxy, EntityDtoOfInt64 } from '../../../shared/service-proxies/service-proxies';
import { FormGroup, FormBuilder } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/last';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/fromEvent';
import { ActivatedRoute } from '@angular/router';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { AppConsts } from '../../../shared/AppConsts';
import { FileDownloadService } from '../../../shared/utils/file-download.service';
import { ImpersonationService } from './impersonation.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class UsersComponent extends AppComponentBase implements OnInit {
  displayedColumns = [
    'actions',
    'userName',
    'name',
    'surname',
    'roles',
    'emailAddress',
    'isEmailConfirmed',
    'isActive',
    'lastLoginTime',
    'creationTime'
  ];

  dataSource: UsersDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('usersForm') usersForm: ElementRef;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  private usersGroup: FormGroup;
  private checked = false;
  private filters: FilterDto = new FilterDto();
  private ecTab = false;
  private permissionTab = false;
  private userId: number;
  private currentEditUserName = '';

  constructor(
    injector: Injector,
    public _impersonationService: ImpersonationService,
    private _activatedRoute: ActivatedRoute,
    private _userServiceProxy: UserServiceProxy,
    private _fileDownloadService: FileDownloadService,
    private snackBar: MatSnackBar,
  ) {
    super(injector);
    this.filters.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';
  }

  ngOnInit() {
    this.dataSource = new UsersDataSource(
      this.filters,
      this.usersForm,
      this.paginator,
      this.sort,
      this.snackBar,
      this._userServiceProxy,
    );
  }

  advancedFiltersChange(checked: boolean) {
    if (!checked) {
      this.filters.roleId = undefined;
      this.filters.selectedPermissionName = undefined;
    }
  }

  selectedRoleIdChange(roleId: number) {
    this.filters.roleId = roleId;
  }

  selectedPermissionNameChange(name: string) {
    this.filters.selectedPermissionName = name;
  }

  getRolesAsString(roles): string {
    let roleNames = '';

    for (let j = 0; j < roles.length; j++) {
      if (roleNames.length) {
        roleNames = roleNames + ', ';
      }
      roleNames = roleNames + roles[j].roleName;
    }
    return roleNames;
  }

  openEditTabs(user: UserListDto) {
    this.currentEditUserName = user.userName;
    this.userId = user.id;
    this.ecTab = true;
    this.tabGroup.selectedIndex = 1;
    // this.tabGroup._tabs.last.textLabel = 'CreateUser';
    // $(this.tabLabel.).html('EditUser');
    // setInterval(() => {
    //   this.showTab = false;
    // }, 5000);
  }
  createUser() {
    this.userId = undefined;
    this.ecTab = true;
    this.permissionTab = false;
    this.tabGroup.selectedIndex = 1;
  }

  openPermissionsTab(user: UserListDto) {
    this.currentEditUserName = user.userName;
    this.userId = user.id;
    this.permissionTab = true;
    if (this.tabGroup._tabs.length === 3) {
      this.tabGroup.selectedIndex = 2;
    } else {
      this.tabGroup.selectedIndex = 1;
    }
  }

  saveStateChange(state: boolean) {
    if (state) {
      this.tabGroup.selectedIndex = 0;
      this.ecTab = false;
      this.dataSource.reload = state;
    } else {
      this.tabGroup.selectedIndex = 0;
      this.ecTab = false;
    }
  }

  permissionSaveStateChange(state: boolean) {
    console.log(state);
    if (state) {
      this.tabGroup.selectedIndex = 0;
      this.permissionTab = false;
      this.dataSource.reload = state;
    } else {
      this.tabGroup.selectedIndex = 0;
      this.permissionTab = false;
    }
  }


  unlockUser(user: UserListDto): void {
    this._userServiceProxy.unlockUser(new EntityDtoOfInt64({ id: user.id })).subscribe(() => {
      this.notify.success(this.l('UnlockedTheUser', user.userName));
    });
  }

  exportToExcel(): void {
    this._userServiceProxy.getUsersToExcel()
      .subscribe(result => {
        this._fileDownloadService.downloadTempFile(result);
      });
  }

  deleteUser(user: UserListDto): void {
    if (user.userName === AppConsts.userManagement.defaultAdminUserName) {
      this.message.warn(this.l('{0}UserCannotBeDeleted', AppConsts.userManagement.defaultAdminUserName));
      return;
    }

    this.message.confirm(
      this.l('UserDeleteWarningMessage', user.userName),
      (isConfirmed) => {
        if (isConfirmed) {
          this._userServiceProxy.deleteUser(user.id)
            .subscribe(() => {
              this.dataSource.reload = true;
              this.notify.success(this.l('SuccessfullyDeleted'));
            });
        }
      }
    );
  }
}

export class FilterDto {
  filterText: string;
  selectedPermissionName: string;
  roleId: number;
}

export class UsersDataSource extends DataSource<UserListDto> {

  private isLoadingResults = true;

  reloadBehavior = new BehaviorSubject(false);
  get reload(): boolean { return this.reloadBehavior.value; }
  set reload(reloadActive: boolean) { this.reloadBehavior.next(reloadActive); }

  constructor(
    private filters: FilterDto,
    private usersForm: ElementRef,
    private paginator: MatPaginator,
    private sort: MatSort,
    private snackBar: MatSnackBar,
    private _userServiceProxy: UserServiceProxy,
  ) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<UserListDto[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.paginator.page,
      this.reloadBehavior,
      Observable.fromEvent(this.usersForm.nativeElement, 'submit'),
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
      // .do(_ => { this.isLoadingResults = true; })
      .switchMap(() => {
        this.isLoadingResults = true;
        const result = this._userServiceProxy
          .getUsers(
          this.filters.filterText,
          this.filters.selectedPermissionName ? this.filters.selectedPermissionName : undefined,
          this.filters.roleId,
          this.sort.active + ' ' + this.sort.direction,
          this.paginator.pageSize,
          this.paginator.pageIndex * this.paginator.pageSize);
          // .finally(() => { this.isLoadingResults = false; });
        return result;
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
  disconnect() {
  }
}

