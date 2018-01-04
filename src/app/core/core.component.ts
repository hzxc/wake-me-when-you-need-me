
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/filter';
import * as domHelper from '../shared/helpers/dom.helper';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CoreComponent implements OnInit {

  @ViewChild(MatSidenav) private sideNave: MatSidenav;
  url: string;

  constructor(
    private router: Router
  ) {
    router.events.filter(event => event instanceof NavigationEnd).subscribe((routeChange: NavigationEnd) => {
      this.url = routeChange.url;
      if (this.isNavOver()) {
        this.sideNave.close();
      }
    });
  }

  ngOnInit() {
  }

  isNavOver() {
    const appBody = document.body;

    return window.matchMedia(`(max-width: 959px)`).matches
      && !domHelper.hasClass(appBody, 'collapsed-menu');
  }

}
