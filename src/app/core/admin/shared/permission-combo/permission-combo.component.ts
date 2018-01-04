import { Component, OnInit, Input, Output, EventEmitter, Injector, ViewChild, ElementRef } from '@angular/core';
import { FlatPermissionWithLevelDto, PermissionServiceProxy } from '../../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/isEmpty';
import { MatAutocomplete } from '@angular/material';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-permission-combo',
  templateUrl: './permission-combo.component.html',
  styleUrls: ['./permission-combo.component.scss']
})
export class PermissionComboComponent extends AppComponentBase implements OnInit {

  private permissions: FlatPermissionWithLevelDto[] = [];
  private filterPermissions: FlatPermissionWithLevelDto[] = [];
  @Output()
  selectedPermissionNameChange: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(MatAutocomplete) auto: MatAutocomplete;
  private permissionControl = new FormControl();

  constructor(
    private _permissionService: PermissionServiceProxy,
    injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.getAllPermissions();

    this.auto.optionSelected.asObservable().subscribe(
      result => {
        this.selectedPermissionNameChange.emit(result.option.value.name);
      }
    );

    this.permissionControl.valueChanges
    .debounceTime(200)
    .distinctUntilChanged()
    .startWith(null)
    .map(permission => permission && typeof permission === 'object' ? permission.name : permission)
    .map(name => name ? this.filter(name) : this.permissions.slice())
    .subscribe(filterResult => this.filterPermissions = filterResult);
  }

  filter(name: string): FlatPermissionWithLevelDto[] {
    const re = new RegExp(name, 'i');
    return this.permissions.filter(
      permission =>
        permission.name.search(re) !== -1);
  }

  getAllPermissions() {
    this._permissionService.getAllPermissions()
      .map(listResult => listResult ? listResult.items : listResult)
      .map(items => items ? this.displayItems(items as FlatPermissionWithLevelDto[]) : [])
      .subscribe(result => { this.permissions = result; this.filterPermissions = result; });
  }

  displayItems(items: FlatPermissionWithLevelDto[]) {
    $.each(items, (index, item) => {
      item.displayName = Array(item.level + 1).join('---') + ' ' + item.displayName;
    });
    return items;
  }

  displayFn(permission: FlatPermissionWithLevelDto): string {
    return permission ? permission.displayName : null;
  }
}
