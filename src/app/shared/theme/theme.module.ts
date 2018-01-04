import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeSwitcherComponent } from './theme-switcher/theme-switcher.component';
import { ThemeService } from './theme.service';
import {
  MatButtonModule,
  MatTooltipModule,
  MatMenuModule,
  MatIconModule,
  MatGridListModule
} from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatGridListModule
  ],
  providers: [
    ThemeService
  ],
  exports: [ThemeSwitcherComponent],
  declarations: [ThemeSwitcherComponent]
})
export class ThemeModule { }
