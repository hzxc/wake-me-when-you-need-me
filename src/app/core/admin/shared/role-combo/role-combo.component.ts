import { element } from 'protractor';
import {
  Component
  , OnInit,
  Output,
  EventEmitter,
  Injector,
  ViewChild,
  ElementRef
} from '@angular/core';
import { RoleListDto, RoleServiceProxy } from '../../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operator/filter';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-role-combo',
  templateUrl: './role-combo.component.html',
  styleUrls: ['./role-combo.component.scss']
})
export class RoleComboComponent extends AppComponentBase implements OnInit {

  private roles: RoleListDto[] = [];
  private filterRoles: RoleListDto[] = [];
  private roleControl = new FormControl();
  @Output() selectedRoleIdChange: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild(MatAutocomplete) auto: MatAutocomplete;

  constructor(
    private _roleService: RoleServiceProxy,
    injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this._roleService.getRoles(undefined).subscribe(result => {
      this.roles = result.items;
      this.filterRoles = result.items;
    });

    this.auto.optionSelected.asObservable().subscribe(
      result => {
        this.selectedRoleIdChange.emit(result.option.value.id);
      }
    );

    this.roleControl.valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      .startWith(null)
      .map(role => role && typeof role === 'object' ? role.displayName : role)
      .map(displayName => displayName ? this.filter(displayName) : this.roles.slice())
      .subscribe(filterResult => this.filterRoles = filterResult);
  }

  filter(displayName: string): RoleListDto[] {
    const re = new RegExp(displayName, 'i');
    return this.roles.filter(
      role =>
        role.displayName.search(re) !== -1);
  }

  displayFn(role: RoleListDto): string {
    return role ? role.displayName : null;
  }
}
