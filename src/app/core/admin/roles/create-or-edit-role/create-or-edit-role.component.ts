import { element } from 'protractor';
import {
  Component,
  ElementRef,
  OnInit,
  Input,
  Injector,
  ViewChild,
  AfterContentInit,
  AfterContentChecked,
  AfterViewChecked,
  OnDestroy
} from '@angular/core';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTabGroup, MatTab, MatInput, MatSnackBar } from '@angular/material';
import { AfterViewInit, OnChanges, DoCheck } from '@angular/core/src/metadata/lifecycle_hooks';
import {
  RoleServiceProxy
  , RoleEditDto,
  GetRoleForEditOutput,
  CreateOrUpdateRoleInput
} from '../../../../shared/service-proxies/service-proxies';
import { PermissionTreeComponent } from '../../shared/permission-tree.component';


@Component({
  selector: 'app-create-or-edit-role',
  templateUrl: './create-or-edit-role.component.html',
  styleUrls: ['./create-or-edit-role.component.scss']
})
export class CreateOrEditRoleComponent extends AppComponentBase
  implements OnChanges, OnInit {
  @Input() roleForEditOutput: GetRoleForEditOutput;
  @ViewChild('permissionTree') permissionTree: PermissionTreeComponent;

  private roleGroup: FormGroup;
  private saving = false;
  private input = new CreateOrUpdateRoleInput();

  constructor(
    injector: Injector,
    private _roleService: RoleServiceProxy,
    fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    super(injector);
    this.roleGroup = fb.group({
      displayName: ['', Validators.required],
      isDefault: []
    });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.roleForEditOutput) {
      this.permissionTree.editData = this.roleForEditOutput;
      this.input.role = this.roleForEditOutput.role;
      this.roleGroup.get('displayName').setValue(this.roleForEditOutput.role.displayName);
      this.roleGroup.get('isDefault').setValue(this.roleForEditOutput.role.isDefault);
      // console.log(`${this.roleGroup.get('displayName').value}`);
    }
  }

  save() {
    if (this.roleGroup.invalid) {
      return;
    }
    this.input.role.displayName = this.roleGroup.get('displayName').value;
    this.input.role.isDefault = this.roleGroup.get('isDefault').value;
    this.input.grantedPermissionNames = this.permissionTree.getGrantedPermissionNames();
    this.saving = true;
    this._roleService.createOrUpdateRole(this.input)
      // .delay(2000)
      .finally(() => this.saving = false)
      .subscribe(() => {
        this.snackBar.open(this.l('SavedSuccessfully'), this.l('Close'), {
          duration: 2000,
        });
      });
  }
}
