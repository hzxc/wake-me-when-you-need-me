import { Injectable } from '@angular/core';
import * as domHelper from '../helpers/dom.helper';
@Injectable()
export class ThemeService {
  themes = [
    {
      name: 'indigo-light-theme',
      baseColor: '#3f51b5',
      isActive: true
    },
    {
      name: 'deeppurple-light-theme',
      baseColor: '#673ab7',
      isActive: false
    },
    {
      name: 'purple-dark-theme',
      baseColor: '#9c27b0',
      isActive: false
    }, {
      name: 'pink-dark-theme',
      baseColor: '#e91e63',
      isActive: false
    },
    // {
    //   name: 'blue-light-theme',
    //   baseColor: '#247ba0',
    //   isActive: false
    // },
  ];
  activatedThemeName: String;
  constructor() {
    this.changeTheme({ name: 'indigo-light-theme' });
  }
  changeTheme(theme) {
    domHelper.changeTheme(this.themes, theme.name);
    this.themes.forEach((t) => {
      t.isActive = false;
      if (t.name === theme.name) {
        t.isActive = true;
        this.activatedThemeName = theme.name;
      }
    });
  }
}
