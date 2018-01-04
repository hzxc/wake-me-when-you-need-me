import { Directive, OnInit, ElementRef, HostListener } from '@angular/core';
import * as domHelper from '../../shared/helpers/dom.helper';

@Directive({
  selector: '[appSideNavAccordion]'
})
export class SideNavAccordionDirective implements OnInit {

  constructor(private el: ElementRef) {
  }

  ngOnInit(): void {
    const self = this;
    const subMenu = this.el.nativeElement.querySelector('.mat-list-item-content > mat-nav-list');
    const isCollapsed = domHelper.hasClass(document.body, 'collapsed-menu');

    if (!!subMenu) {
      this.el.nativeElement.className += ' has-submenu';
    }

    if (isCollapsed) {
      setTimeout(() => {
        domHelper.removeClass(self.el.nativeElement, 'open');
      });
    }
  }

  @HostListener('click', ['$event'])
  onClick($event) {
    const parentLi = domHelper.findClosest($event.target, 'mat-list-item');
    if (!domHelper.hasClass(parentLi, 'has-submenu')) {
      // PREVENTS CLOSING PARENT ITEM
      return;
    }
    this.toggleOpen();
  }

  // For collapsed sidebar
  @HostListener('mouseenter', ['$event'])
  onMouseEnter($event) {
    const elem = this.el.nativeElement;
    const isCollapsed = domHelper.hasClass(document.body, 'collapsed-menu');
    if (!isCollapsed) {
      return;
    }
    domHelper.addClass(elem, 'open');
  }
  @HostListener('mouseleave', ['$event'])
  onMouseLeave($event) {
    const elem = this.el.nativeElement;
    const isCollapsed = domHelper.hasClass(document.body, 'collapsed-menu');
    if (!isCollapsed) { return; }
    domHelper.removeClass(elem, 'open');
  }

  private toggleOpen() {
    const elem = this.el.nativeElement;
    const parenMenuItems = document.getElementsByClassName('has-submenu');

    if (domHelper.hasClass(elem, 'open')) {
      domHelper.removeClass(parenMenuItems, 'open');

    } else {
      domHelper.removeClass(parenMenuItems, 'open');
      domHelper.addClass(elem, 'open');
    }
  }

}
