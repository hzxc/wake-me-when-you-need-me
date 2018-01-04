export class SideBarMenuItem {
  name = '';
  permissionName = '';
  icon = '';
  route = '';
  type: string;
  tooltip?: string;
  items: SideBarMenuItem[];

  constructor(
    name: string,
    permissionName: string,
    icon: string,
    route: string,
    items?: SideBarMenuItem[],
    type: string = 'link',
    tooltip?: string) {
    this.name = name;
    this.permissionName = permissionName;
    this.icon = icon;
    this.route = route;
    this.type = type;

    if (items === undefined) {
      this.items = [];
    } else {
      this.items = items;
    }

    if (this.items.length) {
      this.type = 'dropDown';
    }

    if (!tooltip) {
      this.tooltip = name;
    }
  }
}
