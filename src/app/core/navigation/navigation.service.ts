import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

interface IMenuItem {
  type: string;       // Possible values: link/dropDown/icon/separator/extLink
  name?: string;      // Used as display text for item and title for separator type
  state?: string;     // Router state
  icon?: string;      // Item icon name
  tooltip?: string;   // Tooltip text
  disabled?: boolean; // If true, item will not be appeared in sidenav.
  sub?: IChildItem[]; // Dropdown items
}
interface IChildItem {
  name: string;       // Display text
  state: string;      // Router state
}

@Injectable()
export class NavigationService {

  defaultMenu: IMenuItem[] = [
    {
      name: 'Dashboard',
      type: 'link',
      tooltip: 'Dashboard',
      icon: 'dashboard',
      state: 'dashboard'
    },
    {
      name: 'Inbox',
      type: 'link',
      tooltip: 'Inbox',
      icon: 'inbox',
      state: 'inbox'
    },
    {
      name: 'Chat',
      type: 'link',
      tooltip: 'Chat',
      icon: 'chat',
      state: 'chat'
    },
    {
      name: 'Calendar',
      type: 'link',
      tooltip: 'Calendar',
      icon: 'date_range',
      state: 'calendar'
    },
    {
      name: 'Dialogs',
      type: 'dropDown',
      tooltip: 'Dialogs',
      icon: 'filter_none',
      state: 'dialogs',
      sub: [
        { name: 'Confirm', state: 'confirm' },
        { name: 'Loader', state: 'loader' },
      ]
    },
    {
      name: 'Users',
      type: 'dropDown',
      tooltip: 'Users',
      icon: 'person_outline',
      state: 'users',
      sub: [
        { name: 'Create', state: 'create' },
        { name: 'Edit', state: 'edit' },
      ]
    }
  ];
  iconTypeMenuTitle = 'Frequently Accessed';
  menuItems = new BehaviorSubject<IMenuItem[]>(this.defaultMenu);
  menuItems$ = this.menuItems.asObservable();
}
