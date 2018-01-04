import {SideBarMenuItem} from './side-bar-menu-item';

export class SideBarMenu {
    name = '';
    displayName = '';
    items: SideBarMenuItem[];

    constructor(name: string, displayName: string, items: SideBarMenuItem[]) {
        this.name = name;
        this.displayName = displayName;
        this.items = items;
    }
}
