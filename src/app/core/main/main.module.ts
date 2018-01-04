import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainRoutingModule } from './main-routing.module';
import { MaterialModule } from '../../shared/material/material.module';
@NgModule({
  imports: [
    CommonModule,
    MainRoutingModule,
    MaterialModule,
  ],
  providers: [],
  declarations: [DashboardComponent]
})
export class MainModule { }
