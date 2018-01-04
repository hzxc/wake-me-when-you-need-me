import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-shared-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThemeSwitcherComponent implements OnInit {

  private themes: any[];
  constructor(private themeService: ThemeService) {
    this.themes = this.themeService.themes;
  }
  ngOnInit() {
  }
  changeTheme(theme) {
    this.themeService.changeTheme(theme);
  }
}

