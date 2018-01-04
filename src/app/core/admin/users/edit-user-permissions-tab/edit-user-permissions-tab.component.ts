import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Injector,
  OnChanges,
  EventEmitter,
  Output
} from '@angular/core';
import { PermissionTreeComponent } from '../../shared/permission-tree.component';
import { UserServiceProxy, UpdateUserPermissionsInput, EntityDtoOfInt64 } from '../../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '../../../../shared/common/app-component-base';

@Component({
  selector: 'app-edit-user-permissions-tab',
  templateUrl: './edit-user-permissions-tab.component.html',
  styleUrls: ['./edit-user-permissions-tab.component.scss']
})

export class EditUserPermissionsTabComponent extends AppComponentBase implements OnInit, OnChanges {

  @Input() userId: number;
  @ViewChild('permissionTree') permissionTree: PermissionTreeComponent;
  private saving = false;
  @Output()
  private permissionSaveState: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(
    injector: Injector,
    private _userService: UserServiceProxy
  ) {
    super(injector);
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.userId) {
      this._userService.getUserPermissionsForEdit(this.userId).subscribe(result => {
        this.permissionTree.editData = result;
      });
    }
  }

  save() {
    const input = new UpdateUserPermissionsInput();
    input.id = this.userId;
    input.grantedPermissionNames = this.permissionTree.getGrantedPermissionNames();

    this.saving = true;
    this._userService.updateUserPermissions(input)
      // .delay(2000)
      .finally(() => { this.saving = false; })
      .subscribe(() => {
        this.permissionSaveState.emit(true);
        this.notify.info(this.l('SavedSuccessfully'));
      });
  }

  cancel() {
    this.permissionSaveState.emit(false);
  }


  resetPermissions(): void {
    const input = new EntityDtoOfInt64();

    input.id = this.userId;

    this.saving = true;
    this._userService.resetUserSpecificPermissions(input)
      // .delay(2000)
      .subscribe(() => {
        this.notify.info(this.l('ResetSuccessfully'));
        this._userService.getUserPermissionsForEdit(this.userId).subscribe(result => {
          this.permissionTree.editData = result;
        });
      }, undefined, () => {
        this.saving = false;
      });
  }
}
